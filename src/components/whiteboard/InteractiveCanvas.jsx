import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import { Trash2, Play, RefreshCw, BarChart2, List, Hash,
    AlignLeft, AlignCenter, AlignRight, ListOrdered, Palette, Dices,
    ChevronLeft, ChevronRight
 } from 'lucide-react';
import 'mathlive';

//  MathDisplay helper added so the Smart Box can render LaTeX formulas!
const MathDisplay = ({ content, className = "" }) => {
    const containerRef = useRef(null);
    useEffect(() => {
        if (!content || !containerRef.current) return;
        containerRef.current.innerText = content;
        if (window.renderMathInElement) {
            window.renderMathInElement(containerRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ], throwOnError: false, trust: true
            });
        }
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

// 🟢 NEW: Added resolution prop (defaults to standard 1080p 16:9)
export default function InteractiveCanvas({ lang = 'sv', bgType, onToggleBg, elements = [], setElements, livePacket = [], clueProgress = {}, resolution = { w: 1920, h: 1080 } }) {
    // --- 0. TRANSLATIONS ---
    const t = {
        sv: {
            stepX: "Steg X:", stepY: "Steg Y:", quad1: "1:a Kvadr.", addRow: "+ Rad", remRow: "- Rad",
            graph: "GRAF", equation: "Ekvation", right: "Rät", isosceles: "Liksid", scalene: "Oliksidig", whole: "Heltal",
            decimal: "Decimal", fraction: "Bråk", parts: "Delar", size: "Storlek:", dice: "Tärningar",
            sides: "Sidor", rollAll: "SLÅ ALLA", min: "Min:", max: "Max:", calc: "Räkna:", eg: "t.ex. 10-3",
            horizontal: "Horisontell", vertical: "Vertikal"
        },
        en: {
            stepX: "Step X:", stepY: "Step Y:", quad1: "1st Quad", addRow: "+ Row", remRow: "- Row",
            graph: "GRAPH", equation: "Equation", right: "Right", isosceles: "Isosceles", scalene: "Scalene", whole: "Whole",
            decimal: "Decimal", fraction: "Fraction", parts: "Parts", size: "Size:", dice: "Dice",
            sides: "Sides", rollAll: "ROLL ALL", min: "Min:", max: "Max:", calc: "Calc:", eg: "e.g. 10-3",
            horizontal: "Horizontal", vertical: "Vertical"
        }
    }[lang || 'sv'];

    // --- 1. ISOLATED DRAWING STATES ---
    //   REMOVED: local elements state is gone. The parent controls this now.
    const [activeTool, setActiveTool] = useState('select');
    const [color, setColor] = useState('#0f172a');
    const [isDrawing, setIsDrawing] = useState(false);
    
    const [selectedId, setSelectedId] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [interactionMode, setInteractionMode] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const svgRef = useRef(null);

    // Ref to hold the active drawing path for zero-latency rendering
    const activePathRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(new Date());

    // --- 2. TIMERS & EFFECTS ---
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date()); 
            
            setElements(prev => {
                if (!prev.some(el => el.type === 'timer' && el.isRunning)) return prev;
                return prev.map(el => {
                    if (el.type === 'timer' && el.isRunning && el.timeLeft > 0) {
                        const nextTime = el.timeLeft - 1;
                        return { ...el, timeLeft: nextTime, isRunning: nextTime > 0 };
                    }
                    return el;
                });
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [setElements]);

    useEffect(() => {
        if (activeTool === 'calculator' || activeTool === 'timer' || activeTool === 'richText' || activeTool === 'realClock' || activeTool === 'volume_cue') {
            const newId = Date.now().toString();
            
            let newEl = { 
                id: newId, 
                type: activeTool, 
                x: 300, y: 150, 
                stroke: color, 
                rotation: 0, 
                opacity: 1 
            };

            if (activeTool === 'calculator') {
                newEl.width = 280; newEl.height = 440; newEl.expression = ""; newEl.result = ""; newEl.ans = ""; newEl.calcMode = "LTR";
            } else if (activeTool === 'timer') {
                newEl.width = 360; newEl.height = 360; newEl.duration = 60; newEl.timeLeft = 60; newEl.isRunning = false;
            } else if (activeTool === 'richText') {
                newEl.width = 500; newEl.height = 300; newEl.content = "<p></p>";
            } else if (activeTool === 'realClock') {
                newEl.width = 280; newEl.height = 280; newEl.clockType = 'analog'; 
            } else if (activeTool === 'volume_cue') {
                newEl.width = 280; newEl.height = 140; newEl.volumeLevel = 'quiet'; 
            }

            setElements(prev => [...prev, newEl]);
            setSelectedId(newId);
            
            if (activeTool === 'richText') {
                setEditingId(newId);
            }
            
            setActiveTool('select'); 
        }
    }, [activeTool, color, setElements]);

    useEffect(() => {
        const handleGlobalDeselect = (e) => {
            if (e.target.closest('.ui-ignore') || e.target.closest('[contenteditable="true"]')) return;
            if (e.target.closest('[data-id]')) return;
            
            if (activeTool === 'select') {
                setSelectedId(null);
                setEditingId(null);
                setInteractionMode(null);
                setIsDrawing(false);
            }
        };

        window.addEventListener('pointerdown', handleGlobalDeselect);
        return () => window.removeEventListener('pointerdown', handleGlobalDeselect);
    }, [activeTool]);

    useEffect(() => {
        if (!isDrawing) return; 

        const handleGlobalMove = (e) => { handlePointerMove(e); };
        const handleGlobalUp = (e) => { handlePointerUp(e); };

        window.addEventListener('pointermove', handleGlobalMove);
        window.addEventListener('pointerup', handleGlobalUp);

        return () => {
            window.removeEventListener('pointermove', handleGlobalMove);
            window.removeEventListener('pointerup', handleGlobalUp);
        };
    }, [isDrawing, interactionMode, selectedId, dragOffset, activeTool]); 

    // --- 3. ENGINE HELPERS ---
    const getSmoothPathData = (points) => {
        if (!points || points.length === 0) return '';
        if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
        if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
        
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
        }
        d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
        return d;
    };

    const getCoordinates = (e, shouldSnap = true) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const CTM = svg.getScreenCTM();
        let x = (e.clientX - CTM.e) / CTM.a;
        let y = (e.clientY - CTM.f) / CTM.d;
        if (shouldSnap && !['pen', 'highlighter', 'protractor', 'ruler', 'select'].includes(activeTool)) {
            x = Math.round(x / 20) * 20; y = Math.round(y / 20) * 20;
        }
        return { x, y };
    };

    const deleteElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedId(null);
    };

    const updateDivisions = (id, delta) => setElements(prev => prev.map(el => el.id === id ? { ...el, divisions: Math.max(1, (el.divisions || 1) + delta), sliceColors: {} } : el));
    const spinSpinner = (id) => setElements(prev => prev.map(el => el.id === id ? { ...el, arrowRotation: (el.arrowRotation || 0) + 1440 + Math.random() * 360 } : el));
    const toggleFill = (id, idx) => setElements(prev => prev.map(el => { if (el.id === id) { const colors = { ...(el.sliceColors || {}) }; if (colors[idx] === color) delete colors[idx]; else colors[idx] = color; return { ...el, sliceColors: colors }; } return el; }));
    
    const rollDice = (id) => {
        let iterations = 0;
        const interval = setInterval(() => {
            setElements(prev => prev.map(el => {
                if (el.id !== id) return el;
                const newDice = (el.diceData || [{ value: 1, color: '#ffffff' }]).map(d => ({ ...d, value: Math.floor(Math.random() * (parseInt(el.sides) || 6)) + 1 }));
                return { ...el, diceData: newDice, isRolling: true };
            }));
            iterations++;
            if (iterations > 12) {
                clearInterval(interval);
                setElements(prev => prev.map(el => el.id === id ? { ...el, isRolling: false } : el));
            }
        }, 60);
    };

    const getGraphLinePoints = (el) => {
        if (!el.equation) return null;
        const cleanEq = el.equation.replace(/\s+/g, '').toLowerCase();
        const match = cleanEq.match(/y=([-+]?\d*\.?\d*)x?([-+]?\d*\.?\d*)?/);
        if (!match) return null;
        let m = match[1] === "" ? 1 : (match[1] === "-" ? -1 : parseFloat(match[1]));
        if (isNaN(m)) m = 0; 
        const c = parseFloat(match[2] || 0);
        const s = el.gridSize || 40;
        const stepX = parseFloat(el.stepX) || 1, stepY = parseFloat(el.stepY) || 1;
        const localOX = el.isFirstQuadrant ? 0 : el.width / 2;
        const localOY = el.isFirstQuadrant ? el.height : el.height / 2;
        const logicXLeft = (-localOX / s) * stepX, logicXRight = ((el.width - localOX) / s) * stepX;
        const logicYLeft = m * logicXLeft + c, logicYRight = m * logicXRight + c;
        return { x1: 0, y1: localOY - (logicYLeft / stepY) * s, x2: el.width, y2: localOY - (logicYRight / stepY) * s };
    };

    const isPointInElement = (x, y, el) => {
        if (el.type === 'path' && el.points?.length > 0) {
            return el.points.some(p => Math.abs(x - p.x) < 20 && Math.abs(y - p.y) < 20);
        }
        
        const r = el.width / 2;
        const bounds = ['rect', 'coord', 'triangle', 'ruler', 'shapes_3d', 'tchart', 'math', 'dice', 'richText', 'calculator', 'dynamicClues', 'volume_cue'];

        // 🟢 FIX: Added a generous 15px hit margin to all bounding boxes
        if (bounds.some(b => el.type.includes(b))) {
            return x >= el.x - 15 && x <= el.x + el.width + 15 && y >= el.y - 15 && y <= el.y + el.height + 15;
        }
        
        if (el.type.includes('circle') || ['spinner', 'node', 'protractor', 'clock', 'timer', 'realClock'].includes(el.type)) {
            return Math.sqrt((x - (el.x + r))**2 + (y - (el.y + r))**2) <= r + 15; 
        }
        
        if (el.type === 'line') {
            return Math.abs((el.y2-el.y)*x - (el.x2-el.x)*y + el.x2*el.y - el.y2*el.x) / Math.sqrt((el.y2-el.y)**2 + (el.x2-el.x)**2) < 25; 
        }
        return false;
    };

    // --- 4. POINTER HANDLERS ---
    const handlePointerDown = (e) => {
        if (e.target.closest('.ui-ignore') || e.target.closest('[contenteditable="true"]')) return;
        if (e.target instanceof Element) e.target.setPointerCapture(e.pointerId);
        if (e.pointerType === 'pen' && activeTool === 'select') setActiveTool('pen');

        const { x, y } = getCoordinates(e, false);
        
        const targetNode = e.target.closest('[data-id]');
        const hitId = targetNode ? targetNode.getAttribute('data-id') : null;
        let hit = hitId ? elements.find(el => el.id === hitId) : null;
        
        if (!hit) {
            hit = [...elements].reverse().find(el => isPointInElement(x, y, el));
        }

        if (['timer', 'clock', 'ruler', 'coord', 'dice', 'math', 'richText', 'calculator', 'realClock'].includes(activeTool)) {
            const newId = Date.now().toString();
            let newEl = { 
                id: newId, type: activeTool, x: x - 100, y: y - 100, 
                width: activeTool === 'math' ? 300 : (activeTool === 'richText' ? 500 : (activeTool === 'calculator' || activeTool === 'realClock' ? 280 : 200)), 
                height: activeTool === 'math' ? 80 : (activeTool === 'richText' ? 300 : (activeTool === 'calculator' ? 440 : (activeTool === 'realClock' ? 280 : 200))), 
                stroke: color, rotation: 0, opacity: 1 
            };
            
            if (activeTool === 'timer') { newEl.duration = 60; newEl.timeLeft = 60; newEl.isRunning = false; }
            else if (activeTool === 'clock') { newEl.hourRotation = 300; newEl.minRotation = 0; }
            else if (activeTool === 'ruler') { newEl.width = 800; newEl.height = 100; newEl.min = "0"; newEl.max = "10"; newEl.stepValue = 1; newEl.unitType = 'whole'; newEl.denom = 4; newEl.showSubnotches = true; }
            else if (activeTool === 'coord') { newEl.stepX = "1"; newEl.stepY = "1"; newEl.gridSize = 40; newEl.isFirstQuadrant = false; newEl.showLabels = true; newEl.fontSize = 20; }
            else if (activeTool === 'dice') { newEl.sides = "6"; newEl.diceData = [{ value: 1, color: '#ffffff' }]; }
            else if (activeTool === 'math') { newEl.label = ""; newEl.fontSize = 32; }
            else if (activeTool === 'richText') { newEl.content = "<p>Skriv här...</p>"; }
            else if (activeTool === 'calculator') { newEl.expression = ""; newEl.result = ""; newEl.ans = ""; }
            else if (activeTool === 'realClock') { newEl.clockType = 'analog'; } 

            setElements([...elements, newEl]);
            setSelectedId(newId);
            setActiveTool('select');
            setIsDrawing(false);
            setInteractionMode(null);
            return;
        }

        if (activeTool === 'select') {
            if (hit) {
                setSelectedId(hit.id); 
                setInteractionMode('moving'); 
                setIsDrawing(true);
                const startX = hit.x || (hit.points ? hit.points[0].x : 0);
                const startY = hit.y || (hit.points ? hit.points[0].y : 0);
                setDragOffset({ x: x - startX, y: y - startY });
            } else {
                setSelectedId(null); 
                setEditingId(null);
                setInteractionMode(null);
                setIsDrawing(false);
            }
            return;
        }

        setIsDrawing(true); 
        setInteractionMode('drawing');
        const newId = Date.now().toString();
        const snap = getCoordinates(e, true);
        let newEl = { id: newId, type: activeTool, x: snap.x, y: snap.y, startX: snap.x, startY: snap.y, width: 0, height: 0, stroke: color, fill: 'none', strokeWidth: 4, opacity: 1, rotation: 0 };
        
        if (activeTool === 'pen' || activeTool === 'highlighter') { 
            activePathRef.current = {
                id: newId,
                type: 'path',
                points: [{ x: snap.x, y: snap.y }], 
                strokeWidth: activeTool === 'highlighter' ? 35 : 6,
                opacity: activeTool === 'highlighter' ? 0.4 : 1,
                stroke: color
            };
            return;
        } else if (activeTool === 'line') { newEl.x2 = snap.x; newEl.y2 = snap.y; }
        else if (activeTool === 'triangle') { newEl.triangleType = 'right'; }
        else if (activeTool === 'protractor') { newEl.width = 400; newEl.height = 200; }
        else if (activeTool === 'tchart') { newEl.width = 750; newEl.height = 450; newEl.chartType = 'bar'; newEl.showGraph = true; newEl.xLabel = 'X'; newEl.yLabel = 'Y'; newEl.rows = [{ label: 'A', value: 10 }, { label: 'B', value: 20 }]; }
        else if (activeTool.startsWith('3d_')) { newEl.type = 'shapes_3d'; newEl.shape3D = activeTool.replace('3d_', ''); newEl.showInternal = true; }
        else if (activeTool.startsWith('frac_') || activeTool === 'spinner') { newEl.divisions = 4; newEl.sliceColors = {}; newEl.showLabel = false; }
        
        setElements([...elements, newEl]); 
        setSelectedId(newId);
    };

    const handlePointerMove = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e, !['pen', 'highlighter', 'select'].includes(activeTool));
        const raw = getCoordinates(e, false);

        if (interactionMode === 'drawing' && (activeTool === 'pen' || activeTool === 'highlighter')) {
            if (activePathRef.current) {
                activePathRef.current.points.push({ x: raw.x, y: raw.y });
                const pathNode = svgRef.current?.querySelector(`#active-drawing-path`);
                if (pathNode) {
                    const d = getSmoothPathData(activePathRef.current.points);
                    pathNode.setAttribute('d', d);
                }
            }
            return; 
        }

        setElements(prev => {
            const updated = [...prev];
            const el = updated.find(item => item.id === selectedId);
            if (!el) return prev;

            if (interactionMode === 'rotating-hour' || interactionMode === 'rotating-min') {
                const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
                const angle = Math.atan2(raw.y - cy, raw.x - cx) * (180 / Math.PI) + 90;
                if (interactionMode === 'rotating-hour') el.hourRotation = angle; else el.minRotation = angle;
            } else if (interactionMode === 'rotating') {
                const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
                el.rotation = Math.atan2(raw.y - cy, raw.x - cx) * (180 / Math.PI) + 90;
            } else if (interactionMode === 'move-start') {
                el.x = raw.x; el.y = raw.y;
            } else if (interactionMode === 'move-end') {
                el.x2 = raw.x; el.y2 = raw.y;
            } else if (interactionMode === 'moving') {
                const dx = raw.x - (el.x + dragOffset.x), dy = raw.y - (el.y + dragOffset.y);
                if (el.type === 'path') el.points = el.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                if (el.type === 'line') { el.x2 += dx; el.y2 += dy; }
                el.x = raw.x - dragOffset.x; el.y = raw.y - dragOffset.y;
            } else if (interactionMode === 'scaling') {
                const newGridSize = Math.max(20, Math.min(100, Math.max(raw.x - el.x, (el.y + el.height) - raw.y) / 10));
                el.gridSize = newGridSize;
            } else if (interactionMode === 'resizing') {
                    el.width = Math.max(50, raw.x - el.x);
                    el.height = (el.shape3D === 'cube') ? el.width : (el.type === 'calculator' ? el.width * (440/280) : Math.max(50, raw.y - el.y));
            } else if (interactionMode === 'drawing') {
                if (el.type === 'line') { el.x2 = x; el.y2 = y; }
                else if (['node', 'spinner'].includes(el.type)) {
                    const r = Math.sqrt((x - el.startX) ** 2 + (y - el.startY) ** 2);
                    el.width = r * 2; el.height = r * 2; el.x = el.startX - r; el.y = el.startY - r;
                } else {
                    el.x = Math.min(x, el.startX); el.y = Math.min(y, el.startY);
                    el.width = Math.abs(x - el.startX); el.height = Math.abs(y - el.startY);
                    if (el.shape3D === 'cube') el.height = el.width;
                }
            } 
            return updated;
        });
    };

    const handlePointerUp = (e) => { 
        if (e && e.target instanceof Element) try { e.target.releasePointerCapture(e.pointerId); } catch(err) {}
        if (!isDrawing) return; 
        setIsDrawing(false); setInteractionMode(null); 

        if ((activeTool === 'pen' || activeTool === 'highlighter') && activePathRef.current) {
            const finalPath = activePathRef.current; 
            if (finalPath.points.length > 2) {
                setElements(prev => [...prev, finalPath]); 
            }
            activePathRef.current = null; 
        } else {
            setElements(current => current.filter(el => {
                if (el.type === 'path') return el.points.length > 2;
                if (el.type === 'line') return Math.abs(el.x - el.x2) > 5 || Math.abs(el.y - el.y2) > 5;
                if (['timer', 'clock', 'ruler', 'coord', 'richText', 'calculator'].includes(el.type)) return true;
                return el.width > 5 || el.height > 5;
            }));
        }

        const discrete = ['rect', 'circle', 'triangle', 'coord', 'shapes_3d', 'tchart', 'frac_rect', 'frac_circle', 'spinner', 'richText', 'calculator'];
        if (discrete.includes(activeTool) || activeTool.startsWith('3d_')) setActiveTool('select');
    };

    // --- 5. RENDERERS ---
    const renderHandles = (el, radius = 0) => {
        const isC = ['circle', 'frac_circle', 'spinner', 'node', 'clock', 'timer', 'realClock'].includes(el.type);
        const isP = el.type === 'protractor';
        const botY = isP ? el.y + radius : (isC ? el.y + radius*2 : el.y + el.height);
        const cx = (isC || isP) ? el.x + radius : el.x + el.width/2;
        const rigX = (isC || isP) ? el.x + radius*2 : el.x + el.width;
        const hasOptions = ['ruler', 'shapes_3d', 'triangle', 'tchart', 'frac_rect', 'frac_circle', 'spinner', 'coord', 'math', 'dice', 'dynamicClues', 'volume_cue'].includes(el.type);

        // 🟢 FIX: Smart counter-rotation logic ensures menus stay horizontal!
        const isRotatedByParent = ['line', 'coord', 'timer', 'dynamicClues', 'volume_cue', 'rect', 'circle', 'triangle', 'frac_rect', 'frac_circle', 'spinner'].includes(el.type);
        const unrotateMenu = (el.rotation && isRotatedByParent) ? `rotate(${-el.rotation}, ${cx}, ${botY+8})` : '';
        const unrotateTrash = (el.rotation && isRotatedByParent) ? `rotate(${-el.rotation}, ${el.x - 22.5}, ${el.y - 22.5})` : '';

        return (
            <g className="ui-ignore pointer-events-auto">
                <rect x={el.x-5} y={el.y-5} width={(isC || isP ? radius*2 : el.width)+10} height={(isP ? radius : (isC ? radius*2 : el.height))+10} fill="none" stroke="#3b82f6" strokeDasharray="5" opacity="0.4" />
                
                <foreignObject x={el.x - 45} y={el.y - 45} width={45} height={45} transform={unrotateTrash}>
                    <button onClick={() => deleteElement(el.id)} className="text-rose-500 bg-white border-2 border-rose-500 rounded-xl shadow-lg w-10 h-10 flex items-center justify-center hover:bg-rose-50 cursor-pointer pointer-events-auto">
                        <Trash2 size={20}/>
                    </button>
                </foreignObject>
                <circle cx={cx} cy={el.y-55} r={12} fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-alias" onPointerDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating'); setIsDrawing(true);}} />
                <rect x={rigX-5} y={botY-5} width={20} height={20} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onPointerDown={(e)=>{e.stopPropagation(); setInteractionMode('resizing'); setIsDrawing(true);}} />
                {(el.type === 'coord' || el.type === 'tchart') && (
                    <circle cx={rigX + 25} cy={botY - 10} r={10} fill="#eab308" stroke="#854d0e" strokeWidth="2" className="cursor-zoom-in" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('scaling'); setIsDrawing(true); }} />
                )}
                {hasOptions && (
                    <foreignObject x={el.x} y={botY+8} width={600} height={100} transform={unrotateMenu} className="ui-ignore pointer-events-auto overflow-visible">
                        <div className="flex flex-wrap gap-3 bg-white rounded-xl shadow-xl border border-emerald-500 p-2.5 pointer-events-auto text-[11px] font-black uppercase items-center w-max" onPointerDown={e => e.stopPropagation()}>
                            {el.type === 'coord' && (
                                <>
                                    {t.stepX}<input type="text" className="w-10 border-b text-center outline-none" value={el.stepX} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepX:e.target.value}:o))} />
                                    {t.stepY}<input type="text" className="w-10 border-b text-center outline-none" value={el.stepY} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepY:e.target.value}:o))} />
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, isFirstQuadrant:!o.isFirstQuadrant}:o))} className={`px-2 py-1 rounded-md transition-colors ${el.isFirstQuadrant?'bg-emerald-500 text-white':'bg-slate-100 hover:bg-slate-200'}`}>{t.quad1}</button>
                                    <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200 ml-1">
                                        <span className="text-[10px] text-slate-500 font-black lowercase">y =</span>
                                        <input type="text" placeholder="2x + 1" className="w-20 border-b border-blue-500 outline-none text-center font-bold lowercase bg-blue-50/30 rounded-t" value={el.equation ? el.equation.replace('y=', '') : ""} onChange={(e) => setElements(p=>p.map(o=>o.id===el.id?{...o, equation: e.target.value ? `y=${e.target.value}` : ""}:o))} />
                                    </div>
                                </>
                            )}
                            {el.type === 'tchart' && (
                                <div className="flex gap-1.5">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: [...o.rows, {label:'?', value:'0'}]}:o))} className="px-2.5 py-1.5 bg-emerald-500 text-white rounded-md text-[10px] font-black uppercase shadow-sm">{t.addRow}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: o.rows.length > 1 ? o.rows.slice(0, -1) : o.rows}:o))} className="px-2.5 py-1.5 bg-rose-100 text-rose-600 rounded-md text-[10px] font-black uppercase">{t.remRow}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, chartType: o.chartType==='bar'?'line':'bar'}:o))} className="px-2.5 py-1.5 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors">{el.chartType==='bar'?<BarChart2 size={14}/>:<List size={14}/>}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showGraph:!o.showGraph}:o))} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-colors ${el.showGraph ? 'bg-emerald-600 text-white':'bg-slate-100 hover:bg-slate-200'}`}>{t.graph}</button>
                                </div>
                            )}
                            {el.type === 'ruler' && (
                                <div className="flex flex-wrap gap-3 items-center">
                                    {t.min}<input type="text" className="w-10 border-b text-center outline-none" value={el.min} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, min:e.target.value}:o))} />
                                    {t.max}<input type="text" className="w-10 border-b text-center outline-none" value={el.max} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, max:e.target.value}:o))} />
                                    {t.calc}<input type="text" placeholder={t.eg} className="w-16 border-b border-emerald-500 text-center outline-none font-bold text-emerald-700" value={el.equation} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, equation:e.target.value}:o))} />
                                    
                                    <select className="bg-slate-100 rounded-md p-1 text-[10px] font-bold outline-none cursor-pointer" value={el.unitType} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, unitType:e.target.value}:o))}>
                                        <option value="whole">{t.whole}</option>
                                        <option value="decimal">{t.decimal}</option>
                                        <option value="fraction">{t.fraction}</option>
                                    </select>

                                    {el.unitType === 'fraction' ? (
                                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                                            <span className="text-[9px] font-black uppercase text-slate-400">{lang === 'sv' ? 'Nämnare:' : 'Denom:'}</span>
                                            <input type="number" min="1" className="w-10 border-b text-center outline-none font-bold text-indigo-600" value={el.denom || 4} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, denom: parseInt(e.target.value) || 1}:o))} />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                                            <span className="text-[9px] font-black uppercase text-slate-400">{lang === 'sv' ? 'Steg:' : 'Step:'}</span>
                                            <input type="number" step="any" className="w-12 border-b text-center outline-none font-bold text-indigo-600" value={el.stepValue || 1} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepValue: parseFloat(e.target.value) || 1}:o))} />
                                        </div>
                                    )}

                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showSubnotches: !o.showSubnotches}:o))} className={`p-1.5 rounded-md transition-colors ${el.showSubnotches ? 'bg-emerald-500 text-white' : 'bg-slate-100 hover:bg-slate-200'}`}><Hash size={14}/></button>

                                    {/* 🟢 NEW: Orientation Toggle (Swaps width/height automatically) */}
                                    <div className="w-px h-6 bg-slate-300 mx-1" />
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, orientation: o.orientation === 'vertical' ? 'horizontal' : 'vertical', width: o.height || 100, height: o.width || 800}:o))} className={`px-3 py-1.5 rounded-md transition-colors bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase`}>
                                        {el.orientation === 'vertical' ? t.vertical : t.horizontal}
                                    </button>
                                </div>
                            )}
                            {el.type === 'dice' && (
                                <div className="flex items-center gap-2.5">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, diceData: (o.diceData||[]).slice(0,-1)}:o))} className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-md font-black text-sm">-</button>
                                    <span className="text-[10px] font-black">{(el.diceData||[]).length} {t.dice}</span>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, diceData: [...(o.diceData||[]), {value:1, color:'#ffffff'}]}:o))} className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-md font-black text-sm">+</button>
                                    <select className="bg-slate-50 border rounded-md p-1 outline-none text-[10px] cursor-pointer" value={el.sides||"6"} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, sides:e.target.value}:o))}>{[4,6,8,10,12,20].map(s=><option key={s} value={s}>{s} {t.sides}</option>)}</select>
                                    <button onClick={()=>rollDice(el.id)} className="bg-emerald-500 hover:bg-emerald-600 transition-colors text-white rounded-lg px-3 py-1.5 font-black text-[10px]">{t.rollAll}</button>
                                </div>
                            )}
                            {el.type === 'dynamicClues' && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, fontSize: Math.max(12, (o.fontSize||24)-2)}:o))} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-black text-[10px]">A-</button>
                                        <span className="text-[10px] font-black w-6 text-center">{el.fontSize||24}px</span>
                                        <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, fontSize: Math.min(72, (o.fontSize||24)+2)}:o))} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded font-black text-[10px]">A+</button>
                                    </div>
                                    <div className="w-px h-4 bg-slate-300 mx-1" />
                                    <div className="flex items-center gap-1">
                                        <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showText: o.showText===false}:o))} className={`px-2 py-1 rounded text-[10px] font-black transition-colors ${el.showText!==false ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>TEXT</button>
                                        <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showLatex: o.showLatex===false}:o))} className={`px-2 py-1 rounded text-[10px] font-black transition-colors ${el.showLatex!==false ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>LATEX</button>
                                    </div>
                                </>
                            )}
                            {el.type === 'volume_cue' && (
                                <div className="flex gap-2">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, volumeLevel:'quiet'}:o))} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-colors ${el.volumeLevel==='quiet'?'bg-rose-500 text-white shadow-sm':'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>🤫 {lang==='sv'?'Tyst':'Quiet'}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, volumeLevel:'whisper'}:o))} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-colors ${el.volumeLevel==='whisper'?'bg-amber-500 text-white shadow-sm':'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>💬 {lang==='sv'?'Viska':'Whisper'}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, volumeLevel:'discuss'}:o))} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-colors ${el.volumeLevel==='discuss'?'bg-emerald-500 text-white shadow-sm':'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>🗣️ {lang==='sv'?'Grupp':'Group'}</button>
                                </div>
                            )}
                            {el.type === 'math' && (
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                                    {t.size} <input type="text" className="w-12 border-b-2 border-emerald-500 text-center outline-none" value={el.fontSize} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, fontSize: e.target.value}:o))} />
                                </div>
                            )}
                            {el.type === 'triangle' && (
                                <>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'right'}:o))} className={`px-2.5 py-1.5 rounded-md text-[10px] transition-colors ${el.triangleType==='right'?'bg-emerald-500 text-white':'bg-slate-100 hover:bg-slate-200'}`}>{t.right}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'isosceles'}:o))} className={`px-2.5 py-1.5 rounded-md text-[10px] transition-colors ${el.triangleType==='isosceles'?'bg-emerald-500 text-white':'bg-slate-100 hover:bg-slate-200'}`}>{t.isosceles}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'scalene'}:o))} className={`px-2.5 py-1.5 rounded-md text-[10px] transition-colors ${el.triangleType==='scalene'?'bg-emerald-500 text-white':'bg-slate-100 hover:bg-slate-200'}`}>{t.scalene}</button>
                                </>
                            )}
                            {el.type === 'shapes_3d' && (
                                <>
                                    <span className="text-emerald-600 font-black">{el.shape3D}</span>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showInternal:!o.showInternal}:o))} className={`p-1.5 rounded-md border transition-colors ${el.showInternal?'bg-emerald-500 text-white':'bg-slate-50 hover:bg-slate-100'}`}><Hash size={14}/></button>
                                </>
                            )}
                            {(el.divisions || el.type === 'spinner') && (
                                <>
                                    <button onClick={()=>updateDivisions(el.id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-md font-black text-sm">-</button>
                                    <span className="px-1">{el.divisions} {t.parts}</span>
                                    <button onClick={()=>updateDivisions(el.id, 1)} className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors rounded-md font-black text-sm">+</button>
                                    <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i, showLabel:!i.showLabel}:i))} className={`p-1.5 rounded-lg ml-1 border-2 transition-all ${el.showLabel ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}><Hash size={14}/></button>
                                    {el.type==='spinner' && (<button onClick={()=>spinSpinner(el.id)} className="bg-emerald-500 text-white rounded-lg p-1.5 ml-1 hover:bg-emerald-600 active:scale-90 transition-transform"><Play size={14} fill="white"/></button>)}
                                </>
                            )}
                        </div>
                    </foreignObject>
                )}
            </g>
        );
    };

    const renderElement = (el) => {
        const isSelected = selectedId === el.id;
        const showUI = isSelected || hoveredId === el.id;
        const transform = `rotate(${el.rotation || 0}, ${el.x + el.width/2}, ${el.y + el.height/2})`;
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;

        // Path (Pen/Highlighter)
        if (el.type === 'path') {
            const d = getSmoothPathData(el.points);
            return <path key={el.id} data-id={el.id} d={d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={el.opacity} className="pointer-events-auto cursor-move" />;
        }

        // Line
        if (el.type === 'line') {
            return (
                <g key={el.id} data-id={el.id} className="pointer-events-auto cursor-move">
                    <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.stroke} strokeWidth={el.strokeWidth || 4} strokeLinecap="round" />
                    {isSelected && (
                        <g className="ui-ignore">
                            <circle cx={el.x} cy={el.y} r={10} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-crosshair pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('move-start'); setIsDrawing(true); }} />
                            <circle cx={el.x2} cy={el.y2} r={10} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-crosshair pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('move-end'); setIsDrawing(true); }} />
                        </g>
                    )}
                    {showUI && renderHandles(el)}
                </g>
            );
        }

        // Coordinate Plane
        if (el.type === 'coord') {
            const s = el.gridSize || 40, stepX = parseFloat(el.stepX) || 1, stepY = parseFloat(el.stepY) || 1;
            const localOX = el.isFirstQuadrant ? 0 : el.width / 2, localOY = el.isFirstQuadrant ? el.height : el.height / 2;
            const lns = [], lbs = [], graphLine = getGraphLinePoints(el);
            for (let i = -20; i <= 20; i++) {
                const lp = i * s;
                if (localOX + lp >= 0 && localOX + lp <= el.width) {
                    lns.push(<line key={`v-${i}`} x1={localOX + lp} y1={0} x2={localOX + lp} y2={el.height} stroke="#cbd5e1" strokeWidth="1" />);
                    if (el.showLabels && i !== 0) lbs.push(<text key={`tx-${i}`} x={localOX + lp} y={localOY + 25} textAnchor="middle" fontSize={el.fontSize} fontWeight="900" fill="black">{(i * stepX).toLocaleString()}</text>);
                }
                if (localOY - lp >= 0 && localOY - lp <= el.height) {
                    lns.push(<line key={`h-${i}`} x1={0} y1={localOY - lp} x2={el.width} y2={localOY - lp} stroke="#cbd5e1" strokeWidth="1" />);
                    if (el.showLabels && i !== 0) lbs.push(<text key={`ty-${i}`} x={localOX - 10} y={localOY - lp + 5} textAnchor="end" fontSize={el.fontSize} fontWeight="900" fill="black">{(i * stepY).toLocaleString()}</text>);
                }
            }
            return (
                <g key={el.id} data-id={el.id} transform={`translate(${el.x}, ${el.y}) ${transform.replace(/translate\([^)]+\)/, '')}`} className="pointer-events-auto cursor-move">
                    <rect x={0} y={0} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke="black" strokeWidth="1" />
                    <svg width={el.width} height={el.height} style={{ overflow: 'hidden' }}>{lns}{graphLine && <line x1={graphLine.x1} y1={graphLine.y1} x2={graphLine.x2} y2={graphLine.y2} stroke={el.stroke || "#3b82f6"} strokeWidth="4" strokeLinecap="round"/>}</svg>
                    <line x1={0} y1={localOY} x2={el.width} y2={localOY} stroke="black" strokeWidth="3" />
                    <line x1={localOX} y1={0} x2={localOX} y2={el.height} stroke="black" strokeWidth="3" />
                    {lbs}<text x={localOX - 10} y={localOY + 25} fontSize={el.fontSize} fontWeight="900" fill="black">0</text>
                    <g transform={`translate(${-el.x}, ${-el.y})`}>{showUI && renderHandles(el)}</g>
                </g>
            );
        }

        // T-Chart
        if (el.type === 'tchart') {
            const scaleFactor = (el.gridSize || 40) / 40, tableW = el.width * 0.4, graphW = el.width * 0.55, graphH = (el.height - 130) * scaleFactor; 
            const dataValues = el.rows.map(r => parseFloat(r.value) || 0);
            const rawMax = Math.max(...dataValues, 5);
            const stepSize = ((max) => { const rS = max/5, mag = Math.pow(10, Math.floor(Math.log10(rS))), res = rS/mag; return (res < 1.5 ? 1 : res < 3.5 ? 2 : res < 7.5 ? 5 : 10) * mag; })(rawMax);
            const niceMax = Math.ceil(rawMax / stepSize) * stepSize;
            const barColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
            const yTicks = [];
            for (let j = 0; j <= niceMax/stepSize; j++) {
                const py = -(j * stepSize / niceMax) * graphH;
                yTicks.push(<g key={j}><line x1="-5" y1={py} x2="0" y2={py} stroke="black" strokeWidth="1" /><text x="-10" y={py} textAnchor="end" alignmentBaseline="middle" fontSize="14" fontWeight="bold" fill="black">{j * stepSize}</text></g>);
            }
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.95" stroke="black" strokeWidth="3" rx="8" />
                        <g transform={`translate(${el.x + 10}, ${el.y + 10})`}>
                            <line x1={tableW/2} y1="0" x2={tableW/2} y2={el.height - 20} stroke="black" strokeWidth="4" />
                            <line x1="0" y1="50" x2={tableW} y2="50" stroke="black" strokeWidth="4" />
                            <foreignObject x={0} y={0} width={tableW} height={50} className="ui-ignore pointer-events-auto">
                                <div className="flex w-full h-full" onPointerDown={e => e.stopPropagation()}>
                                    <input className="w-1/2 text-center font-black bg-transparent outline-none text-xl border-none" value={el.xLabel} onChange={e => setElements(p => p.map(o => o.id === el.id ? {...o, xLabel: e.target.value} : o))} />
                                    <input className="w-1/2 text-center font-black bg-transparent outline-none text-xl border-none" value={el.yLabel} onChange={e => setElements(p => p.map(o => o.id === el.id ? {...o, yLabel: e.target.value} : o))} />
                                </div>
                            </foreignObject>
                            {el.rows.map((row, i) => (
                                <foreignObject key={i} x={0} y={65 + i*40} width={tableW} height={40} className="ui-ignore pointer-events-auto">
                                    <div className="flex w-full h-full border-b border-slate-100 hover:bg-slate-50" onPointerDown={e => e.stopPropagation()}>
                                        <input className="w-1/2 text-center text-m font-bold bg-transparent outline-none text-black border-none" value={row.label} onChange={e => { const newRows = [...el.rows]; newRows[i].label = e.target.value; setElements(p => p.map(o => o.id === el.id ? {...o, rows: newRows} : o)); }} />
                                        <input className="w-1/2 text-center text-m font-black bg-transparent outline-none text-blue-600 border-none" value={row.value} onChange={e => { const newRows = [...el.rows]; newRows[i].value = e.target.value; setElements(p => p.map(o => o.id === el.id ? {...o, rows: newRows} : o)); }} />
                                    </div>
                                </foreignObject>
                            ))}
                        </g>
                        {el.showGraph && (
                            <g transform={`translate(${el.x + tableW + 40}, ${el.y + el.height - 90})`}>
                                <line x1="0" y1="0" x2={graphW} y2="0" stroke="black" strokeWidth="2" />
                                <line x1="0" y1="0" x2="0" y2={-graphH} stroke="black" strokeWidth="2" />
                                {yTicks}
                                {el.rows.map((row, i) => {
                                    const numVal = parseFloat(row.value) || 0, barWidth = (graphW / el.rows.length) * 0.7, barH = (numVal / niceMax) * graphH, px = i * (graphW / el.rows.length) + (graphW / el.rows.length) / 2;
                                    return (
                                        <g key={i}>
                                            {el.chartType === 'bar' ? <rect x={px - barWidth/2} y={-barH} width={barWidth} height={barH} fill={barColors[i % barColors.length]} fillOpacity="0.7" stroke="black" strokeWidth="1" /> : (i < el.rows.length - 1 && <line x1={px} y1={-(numVal/niceMax)*graphH} x2={(i+1)*(graphW/el.rows.length)+graphW/el.rows.length/2} y2={-(parseFloat(el.rows[i+1].value || 0)/niceMax)*graphH} stroke={el.stroke} strokeWidth="4" />)}
                                            <g transform={`translate(${px}, 10) rotate(-45)`}><text x="0" y="0" textAnchor="end" alignmentBaseline="middle" fontSize="18" fontWeight="900" fill="black">{row.label}</text></g>
                                        </g>
                                    );
                                })}
                            </g>
                        )}
                    </g>
                    {showUI && renderHandles(el)}
                </React.Fragment>
            );
        }

        // Clock
        if (el.type === 'clock') {
            const ticks = [];
            for (let i = 0; i < 60; i++) {
                const angle = i * 6 * (Math.PI / 180), isHour = i % 5 === 0, tickLen = isHour ? 15 : 7;
                ticks.push(<line key={`t-${i}`} x1={cx + (r - tickLen) * Math.sin(angle)} y1={cy - (r - tickLen) * Math.cos(angle)} x2={cx + r * Math.sin(angle)} y2={cy - r * Math.cos(angle)} stroke="black" strokeWidth={isHour ? 3 : 1} />);
                if (isHour) ticks.push(<text key={`n-${i}`} x={cx + (r - 40) * Math.sin(angle)} y={cy - (r - 40) * Math.cos(angle) + 8} textAnchor="middle" fontSize="22" fontWeight="bold" fill="black">{i === 0 ? 12 : i / 5}</text>);
            }
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth="6" />
                        {ticks}
                        <g transform={`rotate(${el.hourRotation}, ${cx}, ${cy})`}><line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.55} stroke="black" strokeWidth="10" strokeLinecap="round" /><path d={`M ${cx - 10} ${cy - r * 0.55} L ${cx} ${cy - r * 0.65} L ${cx + 10} ${cy - r * 0.55} Z`} fill="black" className="cursor-pointer ui-ignore pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('rotating-hour'); setIsDrawing(true); }} /></g>
                        <g transform={`rotate(${el.minRotation}, ${cx}, ${cy})`}><line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.8} stroke="#475569" strokeWidth="6" strokeLinecap="round" /><path d={`M ${cx - 8} ${cy - r * 0.8} L ${cx} ${cy - r * 0.9} L ${cx + 8} ${cy - r * 0.8} Z`} fill="#475569" className="cursor-pointer ui-ignore pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('rotating-min'); setIsDrawing(true); }} /></g>
                        <circle cx={cx} cy={cy} r="6" fill="black" />
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        // Timer
        if (el.type === 'timer') {
            const isDone = el.timeLeft === 0;
            const timeStr = `${Math.floor(el.timeLeft / 60)}:${(el.timeLeft % 60).toString().padStart(2, '0')}`;
            const prog = (el.timeLeft / el.duration) * 360;
            
            //   FIX: Handle full (360°) and zero states cleanly so the SVG arc doesn't collapse into a straight line
            const isFull = prog >= 360;
            const endAngle = (prog * Math.PI) / 180;
            const endX = cx + r * Math.sin(endAngle);
            const endY = cy - r * Math.cos(endAngle);
            
            const pathData = prog <= 0 
                ? "" 
                : isFull 
                    ? `M ${cx} ${cy-r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy-r}` 
                    : `M ${cx} ${cy-r} A ${r} ${r} 0 ${prog > 180 ? 1 : 0} 1 ${endX} ${endY}`;
            
            return (
                <g key={el.id} transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    {/* Background & Progress Ring */}
                    <circle cx={cx} cy={cy} r={r} fill={isDone ? "#fee2e2" : "#e0f2fe"} stroke={isDone ? "#ef4444" : "#3b82f6"} strokeWidth="4" />
                    <path 
                        d={pathData} 
                        fill="none" 
                        stroke={isDone ? "#ef4444" : "#10b981"} 
                        strokeWidth={Math.max(4, r * 0.08)} // Scales stroke width slightly with size
                        strokeLinecap="round" 
                    />
                    
                    {/*   PERFECTLY CENTERED TEXT */}
                    <text 
                        x={cx} 
                        y={cy} 
                        textAnchor="middle" 
                        dominantBaseline="central" 
                        dy="0.05em"
                        fontSize={r / 2} 
                        fontWeight="900" 
                        fill={isDone ? "#ef4444" : "#1e293b"}
                    >
                        {timeStr}
                    </text>

                    {/*   NEW: COMPACT CONTROLS ROW UNDERNEATH THE TIMER */}
                    {/*   NEW: COMPACT CONTROLS ROW UNDERNEATH THE TIMER */}
                    {showUI && (
                        <foreignObject x={cx - 150} y={el.y + el.height + 10} width={300} height={60} transform={el.rotation ? `rotate(${-el.rotation}, ${cx}, ${el.y + el.height + 10})` : ''} className="ui-ignore pointer-events-auto overflow-visible">
                            <div className="flex items-center justify-center gap-2 w-full h-full" onPointerDown={e => e.stopPropagation()}>
                                {/* Start / Pause */}
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, isRunning: !o.isRunning } : o)); 
                                    }} 
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm text-white transition-all active:scale-95 cursor-pointer ${el.isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                                    title={el.isRunning ? "Pausa" : "Starta"}
                                >
                                    <Play size={18} fill="currentColor" className={el.isRunning ? "hidden" : "block"} />
                                    {/* Simple pause bars icon using CSS since we didn't import Pause from lucide */}
                                    {el.isRunning && (
                                        <div className="flex gap-1">
                                            <div className="w-1 h-3.5 bg-white rounded-sm"></div>
                                            <div className="w-1 h-3.5 bg-white rounded-sm"></div>
                                        </div>
                                    )}
                                </button>
                                
                                {/* Reset */}
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, timeLeft: el.duration, isRunning: false } : o)); 
                                    }} 
                                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                    title="Återställ"
                                >
                                    <RefreshCw size={18} />
                                </button>

                                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                                
                                {/* Subtract 1 Min */}
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, duration: Math.max(0, o.duration - 60), timeLeft: Math.max(0, o.timeLeft - 60) } : o)); 
                                    }} 
                                    className="px-3 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                >
                                    -1m
                                </button>
                                
                                {/* Add 1 Min */}
                                <button 
                                    onPointerDown={(e) => { 
                                        e.stopPropagation(); 
                                        setElements(p => p.map(o => o.id === el.id ? { ...o, duration: o.duration + 60, timeLeft: o.timeLeft + 60 } : o)); 
                                    }} 
                                    className="px-3 h-10 bg-white border border-slate-200 rounded-xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                                >
                                    +1m
                                </button>
                            </div>
                        </foreignObject>
                    )}
                    {showUI && renderHandles(el, r)}
                </g>
            );
        }

        // Live Real Clock
        if (el.type === 'realClock') {
            const isAnalog = el.clockType !== 'digital';
            const h = currentTime.getHours();
            const m = currentTime.getMinutes();
            const s = currentTime.getSeconds();

            // Calculate precise analog rotations
            const secRot = s * 6;
            const minRot = m * 6 + s * 0.1;
            const hrRot = (h % 12) * 30 + m * 0.5;

            // Locale formatted time string
            const timeString = currentTime.toLocaleTimeString(lang === 'sv' ? 'sv-SE' : 'en-US', { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
            });

            // 🎨 Flat Colorful Design Palette
            const faceColor = "#ffffff";
            const rimColor = "#0b0b0c"; // Black
            const hrHandColor = "#1e293b"; // Dark slate
            const minHandColor = "#8b5cf6"; // Violet
            const secHandColor = "#f43f5e"; // Rose accent
            const tickColor = "#cbd5e1";
            const fontFam = "'Nunito', 'Quicksand', 'Varela Round', sans-serif";

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        {isAnalog ? (
                            <>
                                {/* Flat colorful rim and face */}
                                <circle cx={cx} cy={cy} r={r} fill={faceColor} stroke={rimColor} strokeWidth={r * 0.08} />
                                
                                {/*   FIXED: Only draw small dots for minutes/seconds, leaving the hours blank */}
                                {Array.from({length: 60}).map((_, i) => {
                                    const isHour = i % 5 === 0;
                                    if (isHour) return null; // Skip drawing a dot for the hour markers
                                    const angle = i * 6 * (Math.PI / 180);
                                    const dist = r * 0.82;
                                    const dotR = r * 0.015;
                                    return <circle key={i} cx={cx + dist*Math.sin(angle)} cy={cy - dist*Math.cos(angle)} r={dotR} fill={tickColor} />;
                                })}
                                
                                {/* Hour Numbers (Rounded Font) */}
                                {Array.from({length: 12}).map((_, i) => {
                                    const hr = i === 0 ? 12 : i;
                                    const angle = i * 30 * (Math.PI / 180);
                                    const dist = r * 0.78;
                                    return (
                                        <text 
                                            key={`n-${i}`} 
                                            x={cx + dist*Math.sin(angle)} 
                                            y={cy - dist*Math.cos(angle)} 
                                            textAnchor="middle" 
                                            dominantBaseline="central" 
                                            dy="0.05em" 
                                            fontSize={r * 0.19} 
                                            fontWeight="900" 
                                            fill={hrHandColor} 
                                            fontFamily={fontFam}
                                        >
                                            {hr}
                                        </text>
                                    );
                                })}
                                
                                {/* Hands (Thick, flat, rounded caps) */}
                                <g transform={`rotate(${hrRot}, ${cx}, ${cy})`}>
                                    <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.45} stroke={hrHandColor} strokeWidth={r * 0.08} strokeLinecap="round" />
                                </g>
                                <g transform={`rotate(${minRot}, ${cx}, ${cy})`}>
                                    <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.65} stroke={minHandColor} strokeWidth={r * 0.06} strokeLinecap="round" />
                                </g>
                                <g transform={`rotate(${secRot}, ${cx}, ${cy})`}>
                                    <line x1={cx} y1={cy + r * 0.15} x2={cx} y2={cy - r * 0.75} stroke={secHandColor} strokeWidth={r * 0.02} strokeLinecap="round" />
                                    {/* Center dot attached to second hand */}
                                    <circle cx={cx} cy={cy} r={r * 0.05} fill={secHandColor} />
                                </g>
                            </>
                        ) : (
                            <>
                                {/* DIGITAL BOX */}
                                <rect 
                                    x={cx - r * 1.05} // Pushed further left to maintain exact center
                                    y={cy - r * 0.35} 
                                    width={r * 2.1}   // Increased width for left/right padding
                                    height={r * 0.7} 
                                    fill={faceColor} 
                                    rx={r * 0.15} 
                                    stroke={rimColor} 
                                    strokeWidth={r * 0.06} 
                                />
                                <text 
                                    x={cx} 
                                    y={cy} 
                                    textAnchor="middle" 
                                    dominantBaseline="central" 
                                    dy="0.05em"
                                    fontSize={r * 0.35} 
                                    fontWeight="900" 
                                    fill={hrHandColor} 
                                    fontFamily={fontFam} 
                                    style={{ letterSpacing: '0.02em' }}
                                >
                                    {timeString}
                                </text>
                                
                            </>
                        )}
                    </g>
                    {/* UI Mode Toggle Button */}
                    {showUI && (
                        <foreignObject x={cx - 60} y={el.y + el.height + 10} width={120} height={50} className="ui-ignore pointer-events-auto">
                            <div className="flex justify-center" onPointerDown={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => setElements(p => p.map(o => o.id === el.id ? {...o, clockType: isAnalog ? 'digital' : 'analog'} : o))}
                                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl shadow-sm font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 transition-colors cursor-pointer"
                                >
                                    {isAnalog ? "Digital" : "Analog"}
                                </button>
                            </div>
                        </foreignObject>
                    )}
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        // Protractor
        if (el.type === 'protractor') {
            const ticks = [];
            for (let i = 0; i <= 180; i += 1) {
                const a = (i * Math.PI) / 180, l = i % 10 === 0 ? 25 : 12;
                ticks.push(<line key={i} x1={cx + (r-l)*Math.cos(-a)} y1={cy + (r-l)*Math.sin(-a)} x2={cx + r*Math.cos(-a)} y2={cy + r*Math.sin(-a)} stroke="black" strokeWidth={i % 10 === 0 ? 3 : 1} />);
                if (i % 10 === 0) ticks.push(<text key={`t-${i}`} x={cx+(r-45)*Math.cos(-a)} y={cy+(r-45)*Math.sin(-a)} textAnchor="middle" fontSize="16" fontWeight="900" fill="black">{i}</text>);
            }
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <path d={`M ${el.x} ${cy} A ${r} ${r} 0 0 1 ${el.x+el.width} ${cy} Z`} fill="white" fillOpacity="0.5" stroke="black" strokeWidth="2" />
                        {ticks}<circle cx={cx} cy={cy} r="5" fill="black" />
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        // Ruler (Number Line)
        if (el.type === 'ruler') {
            const isVertical = el.orientation === 'vertical';
            const ticks = [];
            const rng = parseFloat(el.max) - parseFloat(el.min);
            const pxU = rng > 0 ? (isVertical ? el.height / rng : el.width / rng) : 0;
            
            let step = 1;
            if (el.unitType === 'fraction') step = 1 / (el.denom || 4);
            else step = el.stepValue || (el.unitType === 'decimal' ? 0.1 : 1);
            
            if (step <= 0 || isNaN(step)) step = 1;
            if (rng / step > 300) step = rng / 300; 

            if (rng > 0) {
                for (let i = 0; i <= rng + 0.0001; i += step) {
                    const val = parseFloat(el.min) + i;
                    
                    if (isVertical) {
                        // 🟢 Vertical Drawing Logic (Bottom to Top)
                        const yp = el.y + el.height - (i * pxU);
                        ticks.push(<line key={`m-${i}`} x1={el.x + 30} y1={yp} x2={el.x + 70} y2={yp} stroke="black" strokeWidth="4" />);

                        if (el.unitType === 'fraction') {
                            const den = el.denom || 4;
                            const num = Math.round(val * den);
                            if (num % den === 0) {
                                ticks.push(<text key={`l-${i}`} x={el.x + 20} y={yp} textAnchor="end" dominantBaseline="central" fontSize="24" fontWeight="900" fill="black">{num / den}</text>);
                            } else {
                                ticks.push(
                                    <g key={`l-${i}`} transform={`translate(${el.x + 10}, ${yp})`}>
                                        <text x="-5" y="-12" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="900" fill="black">{num}</text>
                                        <line x1="-15" y1="-2" x2="5" y2="-2" stroke="black" strokeWidth="2.5" />
                                        <text x="-5" y="10" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="900" fill="black">{den}</text>
                                    </g>
                                );
                            }
                        } else if (el.unitType === 'decimal') {
                            const decLabel = parseFloat(val.toFixed(4)).toString();
                            ticks.push(<text key={`l-${i}`} x={el.x + 20} y={yp} textAnchor="end" dominantBaseline="central" fontSize="24" fontWeight="900" fill="black">{decLabel}</text>);
                        } else {
                            ticks.push(<text key={`l-${i}`} x={el.x + 20} y={yp} textAnchor="end" dominantBaseline="central" fontSize="24" fontWeight="900" fill="black">{Math.round(val)}</text>);
                        }
                    } else {
                        // 🟢 Horizontal Drawing Logic (Left to Right)
                        const xp = el.x + i * pxU;
                        ticks.push(<line key={`m-${i}`} x1={xp} y1={el.y + 30} x2={xp} y2={el.y + 70} stroke="black" strokeWidth="4" />);

                        if (el.unitType === 'fraction') {
                            const den = el.denom || 4;
                            const num = Math.round(val * den);
                            if (num % den === 0) {
                                ticks.push(<text key={`l-${i}`} x={xp} y={el.y + 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="black">{num / den}</text>);
                            } else {
                                ticks.push(
                                    <g key={`l-${i}`} transform={`translate(${xp}, ${el.y + 95})`}>
                                        <text x="0" y="-12" textAnchor="middle" fontSize="18" fontWeight="900" fill="black">{num}</text>
                                        <line x1="-12" y1="-4" x2="12" y2="-4" stroke="black" strokeWidth="2.5" />
                                        <text x="0" y="14" textAnchor="middle" fontSize="18" fontWeight="900" fill="black">{den}</text>
                                    </g>
                                );
                            }
                        } else if (el.unitType === 'decimal') {
                            const decLabel = parseFloat(val.toFixed(4)).toString();
                            ticks.push(<text key={`l-${i}`} x={xp} y={el.y + 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="black">{decLabel}</text>);
                        } else {
                            ticks.push(<text key={`l-${i}`} x={xp} y={el.y + 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="black">{Math.round(val)}</text>);
                        }
                    }
                }

                if (el.showSubnotches) {
                    const subStepSize = el.unitType === 'fraction' ? step / 2 : step / 10;
                    for (let i = 0; i <= rng + 0.0001; i += subStepSize) {
                        const rMod = i % step;
                        if (rMod > 0.001 && Math.abs(rMod - step) > 0.001) {
                            if (isVertical) {
                                const yp = el.y + el.height - (i * pxU);
                                ticks.push(<line key={`s-${i}`} x1={el.x + 40} y1={yp} x2={el.x + 60} y2={yp} stroke="black" strokeWidth="2" opacity="0.5" />);
                            } else {
                                const xp = el.x + i * pxU;
                                ticks.push(<line key={`s-${i}`} x1={xp} y1={el.y + 40} x2={xp} y2={el.y + 60} stroke="black" strokeWidth="2" opacity="0.5" />);
                            }
                        }
                    }
                }
            }

            const hops = [];
            const match = el.equation?.match(/(\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)/);
            if (match && rng > 0) {
                const startVal = parseFloat(match[1]), op = match[2], count = parseFloat(match[3]), dir = op === '+' ? 1 : -1;
                const intCount = Math.max(1, Math.floor(count));
                
                if (isVertical) {
                    // Vertical Hops logic
                    const startY = el.y + el.height - ((startVal - parseFloat(el.min)) * pxU);
                    const yDir = dir === 1 ? -1 : 1; 
                    const totalHeight = count * pxU;
                    const singleHopPx = totalHeight / intCount;
                    
                    for (let j = 0; j < intCount; j++) {
                        const y1 = startY + (j * yDir * singleHopPx);
                        const y2 = y1 + (yDir * singleHopPx);
                        const midY = (y1 + y2) / 2;
                        hops.push(<path key={j} d={`M ${el.x + 50} ${y1} Q ${el.x + 100} ${midY} ${el.x + 50} ${y2}`} fill="none" stroke={el.stroke} strokeWidth="3" strokeDasharray="6,4" />);
                        if (j === intCount - 1) hops.push(<path key="arrow" d={`M ${el.x+40} ${y2-5*yDir} L ${el.x+50} ${y2} L ${el.x+60} ${y2-5*yDir}`} fill="none" stroke={el.stroke} strokeWidth="3" />);
                    }
                    const labelY = startY + (totalHeight / 2) * yDir;
                    hops.push(<g key="lbl"><rect x={el.x + 85} y={labelY - 17} width="50" height="35" fill="white" rx="4" /><text x={el.x + 110} y={labelY} textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="black" fill={el.stroke}>{op}{count}</text></g>);
                } else {
                    // Horizontal Hops logic
                    const totalWidth = count * pxU;
                    const startX = el.x + (startVal - parseFloat(el.min)) * pxU;
                    const singleHopPx = totalWidth / intCount;
                    
                    for (let j = 0; j < intCount; j++) {
                        const x1 = startX + (j * dir * singleHopPx), x2 = x1 + (dir * singleHopPx), midX = (x1 + x2) / 2;
                        hops.push(<path key={j} d={`M ${x1} ${el.y + 30} Q ${midX} ${el.y - 40} ${x2} ${el.y + 30}`} fill="none" stroke={el.stroke} strokeWidth="3" strokeDasharray="6,4" />);
                        if (j === intCount - 1) hops.push(<path key="arrow" d={`M ${x2-5*dir} ${el.y+20} L ${x2} ${el.y+30} L ${x2-5*dir} ${el.y+40}`} fill="none" stroke={el.stroke} strokeWidth="3" />);
                    }
                    const labelX = startX + (totalWidth / 2) * dir;
                    hops.push(<g key="lbl"><rect x={labelX - 25} y={el.y - 75} width="50" height="35" fill="white" rx="4" /><text x={labelX} y={el.y - 50} textAnchor="middle" fontSize="22" fontWeight="black" fill={el.stroke}>{op}{count}</text></g>);
                }
            }
            
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <rect x={el.x} y={el.y} width={el.width} height={el.height || 100} fill="transparent" />
                        {isVertical ? (
                            <line x1={el.x+50} y1={el.y} x2={el.x+50} y2={el.y+el.height} stroke="black" strokeWidth="5" />
                        ) : (
                            <line x1={el.x} y1={el.y+50} x2={el.x+el.width} y2={el.y+50} stroke="black" strokeWidth="5" />
                        )}
                        {ticks}{hops}
                    </g>
                    {showUI && renderHandles(el)}
                </React.Fragment>
            );
        }

        // 3D Shapes
        if (el.type === 'shapes_3d') {
            const w = el.width, h = el.height, d = w * 0.4;
            let faces = [], lines = [];
            const common = { fill: el.stroke, fillOpacity: 0.15, stroke: el.stroke, strokeWidth: 2 }, dotted = { stroke: el.stroke, strokeWidth: 2, strokeDasharray: "6", fill: "none" };
            if (el.shape3D === 'cube' || el.shape3D === 'prism') {
                faces.push(<path key="f1" d={`M ${el.x} ${el.y+d} L ${el.x+w} ${el.y+d} L ${el.x+w} ${el.y+d+h} L ${el.x} ${el.y+d+h} Z`} {...common} />);
                faces.push(<path key="f2" d={`M ${el.x} ${el.y+d} L ${el.x+d} ${el.y} L ${el.x+w+d} ${el.y} L ${el.x+w} ${el.y+d} Z`} {...common} />);
                faces.push(<path key="f3" d={`M ${el.x+w} ${el.y+d} L ${el.x+w+d} ${el.y} L ${el.x+w+d} ${el.y+h} L ${el.x+w} ${el.y+d+h} Z`} {...common} />);
                if (el.showInternal) lines.push(<path key="h1" d={`M ${el.x} ${el.y+d+h} L ${el.x+d} ${el.y+h} L ${el.x+d} ${el.y} M ${el.x+d} ${el.y+h} L ${el.x+w+d} ${el.y+h}`} {...dotted} />);
            } else if (el.shape3D === 'triprism') {
                const bX = el.x + d, bY = el.y;
                if (el.showInternal) faces.push(<path key="back" d={`M ${bX} ${bY+h} L ${bX+w-d} ${bY+h} L ${bX+(w-d)/2} ${bY+d} Z`} {...common} strokeDasharray="4"/>);
                faces.push(<path key="front" d={`M ${el.x} ${el.y+h} L ${el.x+w-d} ${el.y+h} L ${el.x+(w-d)/2} ${el.y+d} Z`} {...common}/>);
                lines.push(<line key="c1" x1={el.x} y1={el.y+h} x2={bX} y2={bY+h} {...common}/>, <line key="c2" x1={el.x+w-d} y1={el.y+h} x2={bX+w-d} y2={bY+h} {...common}/>, <line key="c3" x1={el.x+(w-d)/2} y1={el.y+d} x2={bX+(w-d)/2} y2={bY+d} {...common}/>);
                if (el.showInternal) lines.push(<line key="h" x1={el.x+(w-d)/2} y1={el.y+d} x2={el.x+(w-d)/2} y2={el.y+h} {...dotted} />);
            } else if (el.shape3D === 'pyramid') {
                faces.push(<path key="b" d={`M ${el.x} ${el.y+h} L ${el.x+w-d} ${el.y+h} L ${el.x+w} ${el.y+h-d} L ${el.x+d} ${el.y+h-d} Z`} {...common} />, <path key="s1" d={`M ${el.x} ${el.y+h} L ${el.x+w/2} ${el.y} L ${el.x+w-d} ${el.y+h} Z`} {...common} />, <path key="s2" d={`M ${el.x+w-d} ${el.y+h} L ${el.x+w/2} ${el.y} L ${el.x+w} ${el.y+h-d} Z`} {...common} />);
                if (el.showInternal) lines.push(<line key="h" x1={el.x+w/2} y1={el.y} x2={el.x+w/2} y2={el.y+h-d/2} {...dotted} />);
            } else if (el.shape3D === 'house') {
                const baseH = h * 0.6;
                faces.push(<path key="h1" d={`M ${el.x} ${el.y+h} L ${el.x+w} ${el.y+h} L ${el.x+w} ${el.y+h-baseH} L ${el.x} ${el.y+h-baseH} Z`} {...common} />);
                faces.push(<path key="h2" d={`M ${el.x+w} ${el.y+h} L ${el.x+w+d} ${el.y+h-d} L ${el.x+w+d} ${el.y+h-baseH-d} L ${el.x+w} ${el.y+h-baseH} Z`} {...common} />);
                faces.push(<path key="hr" d={`M ${el.x} ${el.y+h-baseH} L ${el.x+w/2} ${el.y} L ${el.x+w} ${el.y+h-baseH} Z`} {...common} fillOpacity={0.4} />);
                faces.push(<path key="hr2" d={`M ${el.x+w/2} ${el.y} L ${el.x+w/2+d} ${el.y-d} L ${el.x+w+d} ${el.y+h-baseH-d} L ${el.x+w} ${el.y+h-baseH} Z`} {...common} fillOpacity={0.4} />);
                if (el.showInternal) lines.push(<line key="h" x1={el.x+w/2} y1={el.y} x2={el.x+w/2} y2={el.y+h} {...dotted} />);
            } else if (el.shape3D === 'cylinder' || el.shape3D === 'silo' || el.shape3D === 'tube') {
                faces.push(<ellipse key="e1" cx={el.x+w/2} cy={el.y+h} rx={w/2} ry={d/2} {...common} />);
                faces.push(<rect key="r1" x={el.x} y={el.y+d/2} width={w} height={h-d/2} {...common} stroke="none" />);
                faces.push(<ellipse key="e2" cx={el.x+w/2} cy={el.y+d/2} rx={w/2} ry={d/2} {...common} fillOpacity={0.3} />);
                lines.push(<line key="l1" x1={el.x} y1={el.y+d/2} x2={el.x} y2={el.y+h} stroke={el.stroke} strokeWidth="2" />, <line key="l2" x1={el.x+w} y1={el.y+d/2} x2={el.x+w} y2={el.y+h} stroke={el.stroke} strokeWidth="2" />);
                if (el.shape3D === 'silo') faces.push(<path key="dome" d={`M ${el.x} ${el.y+d/2} A ${w/2} ${w/2} 0 0 1 ${el.x+w} ${el.y+d/2}`} {...common} fillOpacity={0.4} />);
                if (el.shape3D === 'tube') faces.push(<ellipse key="inner1" cx={el.x+w/2} cy={el.y+d/2} rx={w/4} ry={d/4} {...common} fill="white" fillOpacity="1" />, <ellipse key="inner2" cx={el.x+w/2} cy={el.y+h} rx={w/4} ry={d/4} {...common} fill="none" strokeDasharray="3"/>);
                if (el.showInternal && el.shape3D !== 'tube') lines.push(<line key="h" x1={el.x+w/2} y1={el.y+d/2} x2={el.x+w/2} y2={el.y+h} {...dotted} />);
            } else if (el.shape3D === 'cone' || el.shape3D === 'icecream') {
                const isIce = el.shape3D === 'icecream'; const apexY = isIce ? el.y+h : el.y; const baseY = isIce ? el.y+d/2 : el.y+h;
                faces.push(<ellipse key="base" cx={el.x+w/2} cy={baseY} rx={w/2} ry={d/2} {...common} />, <path key="side" d={`M ${el.x} ${baseY} L ${el.x+w/2} ${apexY} L ${el.x+w} ${baseY} Z`} {...common} />);
                if (isIce) faces.push(<path key="scoop" d={`M ${el.x} ${baseY} A ${w/2} ${w/2} 0 0 1 ${el.x+w} ${baseY}`} {...common} fillOpacity={0.4} />);
                if (el.showInternal) lines.push(<line key="h" x1={el.x+w/2} y1={apexY} x2={el.x+w/2} y2={baseY} {...dotted} />);
            } else if (el.shape3D === 'sphere' || el.shape3D === 'hemi') {
                if (el.shape3D === 'hemi') faces.push(<ellipse key="b" cx={el.x+w/2} cy={el.y+w/2} rx={w/2} ry={w/6} {...common} />, <path key="d" d={`M ${el.x} ${el.y+w/2} A ${w/2} ${w/2} 0 0 1 ${el.x+w} ${el.y+w/2}`} {...common} fillOpacity={0.3} transform={`rotate(180, ${el.x+w/2}, ${el.y+w/2})`}/>);
                else faces.push(<circle key="s1" cx={el.x+w/2} cy={el.y+w/2} r={w/2} {...common} fillOpacity={0.2} />, <ellipse key="eq" cx={el.x+w/2} cy={el.y+w/2} rx={w/2} ry={w/6} {...common} fill="none" strokeDasharray="4" />);
                if (el.showInternal) lines.push(<line key="r" x1={el.x+w/2} y1={el.y+w/2} x2={el.x+w} y2={el.y+w/2} {...dotted} />);
            }
            
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        {faces}{lines}
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        // Dice
        if (el.type === 'dice') {
            const dice = el.diceData || [];
            const cols = Math.ceil(Math.sqrt(dice.length));
            const cellSize = el.width / cols;
            const rows = Math.ceil(dice.length / cols);
            const actualGridHeight = rows * cellSize; 

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move" onDoubleClick={() => rollDice(el.id)}>
                        {dice.map((d, i) => {
                            const dx = el.x + (i % cols) * cellSize;
                            const dy = el.y + Math.floor(i / cols) * cellSize;
                            const dSize = cellSize * 0.85;
                            return (
                                <g key={i}>
                                    <rect x={dx + cellSize * 0.075} y={dy + cellSize * 0.075} width={dSize} height={dSize} fill="white" stroke="black" strokeWidth="3" rx={dSize * 0.2} className={el.isRolling ? "animate-pulse" : ""} />
                                    <text x={dx + cellSize/2} y={dy + cellSize/2 + (dSize*0.15)} textAnchor="middle" fontSize={dSize * 0.5} fontWeight="900" fill="black" className="select-none pointer-events-none">{d.value}</text>
                                </g>
                            );
                        })}
                    </g>
                    
                    <foreignObject x={el.x} y={el.y + actualGridHeight + 10} width={el.width} height={60} className="ui-ignore pointer-events-auto overflow-visible">
                        <div className="flex justify-center w-full h-full" onPointerDown={e => e.stopPropagation()}>
                            <button 
                                onClick={() => rollDice(el.id)} 
                                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-black uppercase text-[12px] tracking-widest rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 w-max"
                            >
                                <Dices size={16} /> {lang === 'sv' ? "Slå" : "Roll"}
                            </button>
                        </div>
                    </foreignObject>

                    {showUI && renderHandles(el, el.width/2)}
                </React.Fragment>
            );
        }
        // Interactive Calculator
        if (el.type === 'calculator') {
            const currentMode = el.calcMode || 'LTR';
        
            const calcButtons = [
                '(', ')', '^', '√',
                'AC', 'DEL', '%', '÷',
                '7', '8', '9', '×',
                '4', '5', '6', '-',
                '1', '2', '3', '+',
                '0', '.', 'π', '='
            ];
        
            const handleCalcClick = (btn) => {
                setElements(prev => prev.map(o => {
                    if (o.id !== el.id) return o;
                    let expr = o.expression || "";
                    let res = o.result || "";
                    let ans = o.ans || "";
        
                    if (btn === 'AC') { 
                        expr = ""; res = ""; 
                    } else if (btn === 'DEL') { 
                        expr = expr.slice(0, -1); res = ""; 
                    } else if (btn === '=') {
                        try {
                            let parsed = expr
                                .replace(/×/g, '*')
                                .replace(/÷/g, '/')
                                .replace(/π/g, Math.PI.toString())
                                .replace(/(\d+(\.\d+)?)%/g, (_, num) => (parseFloat(num)/100).toString());
        
                            let evaluated;
                            
                            if (currentMode === 'PEMDAS') {
                                // STANDARD JS MATH EVALUATION
                                let pemdasStr = parsed
                                    .replace(/\^/g, '**')
                                    .replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)')
                                    .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
                                evaluated = new Function(`return ${pemdasStr}`)();
                            } else {
                                // CUSTOM LEFT-TO-RIGHT (LTR) EVALUATION ENGINE
                                const solveLTR = (equation) => {
                                    let str = equation;
                                    // 1. Solve roots with parens
                                    while (str.includes('√(')) {
                                        str = str.replace(/√\(([^()]+)\)/g, (_, inner) => Math.sqrt(solveLTR(inner)).toString());
                                    }
                                    // 2. Solve parens recursively
                                    while (str.includes('(')) {
                                        str = str.replace(/\(([^()]+)\)/g, (_, inner) => solveLTR(inner).toString());
                                    }
                                    // 3. Solve raw roots
                                    str = str.replace(/√(\d+(?:\.\d+)?)/g, (_, num) => Math.sqrt(parseFloat(num)).toString());
                                    
                                    // 4. Tokenize: Separate ALL operators from numbers
                                    let tokens = str.match(/\d+(?:\.\d+)?|[+\-*/^]/g);
                                    if (!tokens) return parseFloat(str) || 0;
                                    
                                    let result = 0;
                                    let startIndex = 0;
                            
                                    // Handle leading negative sign (e.g., "-5 + 3")
                                    if (tokens[0] === '-') {
                                        result = -parseFloat(tokens[1] || 0);
                                        startIndex = 2;
                                    } else {
                                        result = parseFloat(tokens[0] || 0);
                                        startIndex = 1;
                                    }
                                    
                                    for (let i = startIndex; i < tokens.length; i += 2) {
                                        let op = tokens[i];
                                        
                                        // Handle negative numbers written after an operator (e.g., "5 * -3")
                                        let nextNumOffset = 1;
                                        let isNegative = false;
                                        if (tokens[i+1] === '-') {
                                            isNegative = true;
                                            nextNumOffset = 2;
                                        }
                                        
                                        let nextNum = parseFloat(tokens[i + nextNumOffset] || 0);
                                        if (isNegative) nextNum = -nextNum;
                            
                                        if (op === '+') result += nextNum;
                                        else if (op === '-') result -= nextNum;
                                        else if (op === '*') result *= nextNum;
                                        else if (op === '/') result /= nextNum;
                                        else if (op === '^') result = Math.pow(result, nextNum);
                                        
                                        if (isNegative) i++; // Skip the extra minus sign token in the loop
                                    }
                                    return result;
                                };
                                evaluated = solveLTR(parsed);
                            }
                            
                            // Safe Rounding for floating point errors
                            const final = Math.round(evaluated * 10000000) / 10000000;
                            res = final.toString();
                            ans = final.toString();
                        } catch (e) {
                            res = "Error";
                        }
                    } else {
                        if (res !== "" && res !== "Error" && !['+', '-', '×', '÷', '^', '%'].includes(btn)) {
                            expr = btn; 
                        } else if (res !== "" && res !== "Error") {
                            expr = res + btn; 
                        } else {
                            expr += btn;
                        }
                        res = "";
                    }
                    return { ...o, expression: expr, result: res, ans: ans };
                }));
            };
        
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="#1e293b" rx={24 * (el.width / 280)} stroke="#334155" strokeWidth="6" className="shadow-2xl" />
                        
                        <foreignObject x={el.x} y={el.y} width={el.width} height={el.height}>
                            <div 
                                style={{ width: '280px', height: '440px', transform: `scale(${el.width / 280})`, transformOrigin: 'top left' }} 
                                className="flex flex-col p-5 pointer-events-auto"
                            >
                                {/* 🟢 NEW: Hardware Header with Mode Toggle */}
                                <div className="flex justify-between items-center mb-2 px-1 ui-ignore" onPointerDown={e => e.stopPropagation()}>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Anpassa</span>
                                    <button 
                                        onClick={() => setElements(prev => prev.map(o => o.id === el.id ? { ...o, calcMode: currentMode === 'LTR' ? 'PEMDAS' : 'LTR' } : o))}
                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-inner transition-colors cursor-pointer
                                            ${currentMode === 'LTR' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}
                                        title={lang === 'sv' ? "Ändra beräkningsordning" : "Toggle Calculation Order"}
                                    >
                                        {currentMode === 'LTR' ? 'L->R MODE' : 'PEMDAS MODE'}
                                    </button>
                                </div>
        
                                <div className="bg-white rounded-xl h-32 mb-5 p-4 flex flex-col justify-between items-end border-4 border-slate-200 shadow-inner font-mono overflow-hidden shrink-0">
                                    <div className="text-slate-500 font-bold text-3xl tracking-widest w-full text-right overflow-hidden break-all">
                                        {el.expression}
                                    </div>
                                    <div className="text-slate-900 text-5xl font-black truncate w-full text-right mt-1">
                                        {el.result}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-4 gap-2.5 flex-1 ui-ignore" onPointerDown={e => e.stopPropagation()}>
                                    {calcButtons.map(btn => {
                                        let bg = "bg-slate-200 hover:bg-slate-300 text-slate-800 border-b-4 border-slate-300 active:border-b-0 active:translate-y-1";
                                        if (btn === 'AC' || btn === 'DEL') bg = "bg-rose-500 hover:bg-rose-600 text-white border-b-4 border-rose-700 active:border-b-0 active:translate-y-1";
                                        if (btn === '=') bg = "bg-indigo-500 hover:bg-indigo-600 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1";
                                        if (['÷', '×', '-', '+'].includes(btn)) bg = "bg-amber-400 hover:bg-amber-500 text-slate-900 border-b-4 border-amber-600 active:border-b-0 active:translate-y-1";
                                        
                                        return (
                                            <button 
                                                key={btn} onClick={() => handleCalcClick(btn)}
                                                className={`${bg} rounded-xl font-black text-lg shadow-sm flex items-center justify-center transition-all cursor-pointer`}
                                            >
                                                {btn}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </foreignObject>
                    </g>
                    {showUI && renderHandles(el)}
                </React.Fragment>
            );
        }
        // MathLive
        if (el.type === 'math') {
            const isEditing = editingId === el.id;
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} onDoubleClick={() => setEditingId(el.id)} className="pointer-events-auto cursor-move">
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke={isSelected ? "#3b82f6" : "transparent"} strokeWidth="2" rx="8" />
                        <foreignObject x={el.x} y={el.y} width={el.width} height={el.height} className="ui-ignore" style={{ pointerEvents: isEditing ? 'auto' : 'none' }}>
                            <math-field style={{ width: '100%', height: '100%', background: 'transparent', fontSize: `${el.fontSize}px`, border: 'none', color: 'black' }} onInput={e => setElements(prev => prev.map(n => n.id === el.id ? {...n, label: e.target.value} : n))} ref={(elDom) => { if (elDom && elDom.value !== el.label) elDom.value = el.label; }}>
                                {el.label}
                            </math-field>
                        </foreignObject>
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        // Rich Text (Wordpad Tool)
        if (el.type === 'richText') {
            const isEditing = editingId === el.id;
            
            const applyStyle = (cmd, val = null) => {
                if (cmd === 'fontSize') {
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('fontSize', false, "7");
                    const fontElements = document.getElementsByTagName("font");
                    for (let i = 0; i < fontElements.length; i++) {
                        if (fontElements[i].size === "7") {
                            fontElements[i].removeAttribute("size");
                            fontElements[i].style.fontSize = val + "px";
                            //   FIX: Set line height to normal so it scales down perfectly when reducing text size
                            fontElements[i].style.lineHeight = "normal";
                        }
                    }
                } else {
                    document.execCommand(cmd, false, val);
                }

                //   NEW: Instantly sync the text to the state after formatting (e.g. clicking Bullet Points)
                const node = document.getElementById(`rich-text-${el.id}`);
                if (node) {
                    const html = node.innerHTML;
                    const scrollH = node.scrollHeight;
                    setElements(prev => prev.map(item => 
                        item.id === el.id ? { ...item, height: Math.max(item.height || 0, scrollH), content: html } : item
                    ));
                }
            };

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto">
                        <rect 
                            x={el.x} y={el.y} width={el.width} height={el.height} 
                            fill="white" fillOpacity={isEditing ? 1 : 1} 
                            stroke={isSelected ? "#3b82f6" : "#e2e8f0"} strokeWidth={isSelected ? 3 : 1} rx="8"
                            style={{ cursor: isEditing ? 'text' : 'move' }}
                            onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id); }}
                        />
                        <foreignObject 
                            x={el.x} y={el.y} width={el.width} height={el.height}
                            style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
                        >
                            <div 
                                id={`rich-text-${el.id}`} //   NEW: Added ID so the toolbar can find and save it
                                contentEditable={isEditing} suppressContentEditableWarning
                                className="w-full h-full p-4 outline-none font-sans text-slate-800 overflow-hidden [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2"
                                style={{ 
                                    whiteSpace: 'pre-wrap', 
                                    wordBreak: 'break-word', 
                                    listStylePosition: 'inside',
                                    fontSize: '32px',
                                    lineHeight: '1.25'
                                }}
                                //   NEW: Uncontrolled Ref loading prevents React from randomly wiping the DOM
                                ref={(node) => {
                                    if (node && node.getAttribute('data-init') !== 'true') {
                                        node.innerHTML = el.content || '';
                                        node.setAttribute('data-init', 'true');
                                    }
                                }}
                                //   NEW: Saves text constantly as you type
                                onInput={(e) => {
                                    const html = e.currentTarget.innerHTML;
                                    const scrollH = e.currentTarget.scrollHeight;
                                    setElements(prev => prev.map(item => 
                                        item.id === el.id ? { ...item, height: Math.max(item.height || 0, scrollH), content: html } : item
                                    ));
                                }}
                                onBlur={(e) => {
                                    const html = e.currentTarget.innerHTML;
                                    setElements(prev => prev.map(item => item.id === el.id ? { ...item, content: html } : item));
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                            />
                        </foreignObject>

                        {isEditing && (
                            <foreignObject x={el.x} y={el.y - 55} width={Math.max(el.width, 650)} height={55} className="ui-ignore pointer-events-auto overflow-visible">
                                <div 
                                    className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl shadow-2xl border border-slate-700 w-max"
                                    onPointerDown={e => { 
                                        e.stopPropagation(); 
                                        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'INPUT') {
                                            e.preventDefault(); 
                                        }
                                    }} 
                                >
                                    <button onClick={() => applyStyle('bold')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded font-bold">B</button>
                                    <button onClick={() => applyStyle('italic')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded italic font-serif">I</button>
                                    <button onClick={() => applyStyle('underline')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded underline">U</button>
                                    
                                    <div className="w-px h-6 bg-slate-700 mx-1" />
                                    
                                    <select 
                                        onChange={(e) => applyStyle('fontSize', e.target.value)} 
                                        className="bg-slate-800 text-white text-[12px] h-8 rounded px-2 outline-none border border-slate-700 cursor-pointer"
                                        defaultValue="32"
                                    >
                                        {[12, 14, 16, 18, 20, 24, 32, 48, 64, 90, 114].map(sz => (
                                            <option key={sz} value={sz}>{sz}px</option>
                                        ))}
                                    </select>

                                    <div className="w-px h-6 bg-slate-700 mx-1" />

                                    <button onClick={() => applyStyle('insertUnorderedList')} className="w-8 h-8 text-white hover:bg-slate-700 rounded flex items-center justify-center" title="Punktlista"><List size={16}/></button>
                                    <button onClick={() => applyStyle('insertOrderedList')} className="w-8 h-8 text-white hover:bg-slate-700 rounded flex items-center justify-center" title="Numrerad lista"><ListOrdered size={16}/></button>
                                    
                                    <div className="w-px h-6 bg-slate-700 mx-1" />
                                    
                                    <button onClick={() => applyStyle('justifyLeft')} className="w-8 h-8 text-white hover:bg-slate-700 rounded flex items-center justify-center" title="Vänsterjustera"><AlignLeft size={16}/></button>
                                    <button onClick={() => applyStyle('justifyCenter')} className="w-8 h-8 text-white hover:bg-slate-700 rounded flex items-center justify-center" title="Centrera"><AlignCenter size={16}/></button>
                                    <button onClick={() => applyStyle('justifyRight')} className="w-8 h-8 text-white hover:bg-slate-700 rounded flex items-center justify-center" title="Högerjustera"><AlignRight size={16}/></button>

                                    <div className="w-px h-6 bg-slate-700 mx-1" />
                                    
                                    <div className="relative flex items-center justify-center w-8 h-8 hover:bg-slate-700 rounded overflow-hidden" title="Byt färg">
                                        <Palette size={16} className="text-white absolute pointer-events-none" />
                                        <input
                                            type="color"
                                            className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer opacity-0 z-10"
                                            onChange={(e) => applyStyle('foreColor', e.target.value)}
                                        />
                                    </div>

                                    <button onClick={() => setEditingId(null)} className="ml-2 px-4 py-1.5 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-600 active:scale-95 transition-all">
                                        Klar
                                    </button>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                    {showUI && !isEditing && renderHandles(el)}
                </React.Fragment>
            );
        }

        // 🟢 NEW: The Dynamic "Smart Box" for Clues
        if (el.type === 'dynamicClues') {
            const q = livePacket.find(p => p.id === el.questionId);
            const clues = q?.clues || q?.resolvedData?.clues || [];
            const progress = el.progress || 0; 
            
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.95" stroke={isSelected ? "#3b82f6" : "#e2e8f0"} strokeWidth={isSelected ? 3 : 2} rx="14" />
                        
                        {/* 🟢 FIX 1: Removed 'ui-ignore' so the SVG canvas can actually detect your mouse clicks! */}
                        <foreignObject x={el.x} y={el.y} width={el.width} height={el.height}>
                            <div className="w-full h-full flex flex-col pointer-events-auto">
                                
                                {/* 🟢 FIX 2: Drag Handle - Letting the click pass through means you can instantly drag the box! */}
                                <div className="w-full h-8 flex items-center justify-center shrink-0 opacity-40 hover:opacity-100 transition-opacity cursor-move" style={{ touchAction: 'none' }}>
                                    <div className="w-12 h-1.5 bg-slate-400 rounded-full pointer-events-none" />
                                </div>

                                <div 
                                    className="flex-1 px-4 pb-4 overflow-y-auto custom-scrollbar cursor-text"
                                    onPointerDown={(e) => {
                                        // 🟢 FIX 3: We stop the canvas from dragging so you can scroll the text, 
                                        // but we force the menu to open by selecting the box directly!
                                        e.stopPropagation();
                                        setSelectedId(el.id);
                                    }} 
                                >
                                    {clues.length === 0 ? (
                                        <div className="text-slate-400 italic font-bold text-center mt-4 text-sm">
                                            {lang === 'sv' ? "Inga steg tillgängliga" : "No steps available"}
                                        </div>
                                    ) : progress === 0 ? (
                                        <div className="text-slate-400 italic font-bold text-center mt-10 text-sm">
                                            {lang === 'sv' ? "Använd pilarna nedan för att visa stegen." : "Use the arrows below to reveal steps."}
                                        </div>
                                    ) : (
                                        clues.slice(0, progress).map((clue, idx) => {
                                            const text = typeof clue === 'object' ? clue[lang] || clue.text : clue;
                                            const latex = typeof clue === 'object' ? clue.latex : null;
                                            const fSize = el.fontSize || 24;
                                            
                                            return (
                                                <div key={idx} className="pb-3 mb-3 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0 animate-in fade-in slide-in-from-top-2">
                                                    <div className="font-black text-indigo-500 uppercase tracking-widest mb-1 opacity-70" style={{ fontSize: `${Math.max(10, fSize * 0.5)}px` }}>
                                                        {lang === 'sv' ? 'Steg' : 'Step'} {idx + 1}
                                                    </div>
                                                    {el.showText !== false && text && (
                                                        <div className="font-bold text-slate-700 leading-relaxed" style={{ fontSize: `${fSize}px` }}>
                                                            <MathDisplay content={text} />
                                                        </div>
                                                    )}
                                                    {el.showLatex !== false && latex && (
                                                        <div className="mt-2 text-center text-indigo-600 font-serif bg-indigo-50/50 py-2 rounded-lg border border-indigo-100" style={{ fontSize: `${fSize * 1.2}px` }}>
                                                            <MathDisplay content={`$$${latex}$$`} />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                <div 
                                    className="h-10 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-3 shrink-0 rounded-b-[14px]"
                                    onPointerDown={(e) => {
                                        // 🟢 FIX 4: Clicking the footer also selects the box without dragging
                                        e.stopPropagation();
                                        setSelectedId(el.id);
                                    }} 
                                >
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, progress: Math.max(0, progress-1)}:o)); }} 
                                        className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft size={18}/>
                                    </button>
                                    <span className="text-[11px] font-black text-slate-500 tracking-widest select-none">{progress} / {clues.length}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, progress: Math.min(clues.length, progress+1)}:o)); }} 
                                        className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors cursor-pointer"
                                    >
                                        <ChevronRight size={18}/>
                                    </button>
                                </div>
                            </div>
                        </foreignObject>
                    </g>
                    {showUI && renderHandles(el)}
                </React.Fragment>
            );
        }

        // 🟢 NEW: Volume Cue / Work Mode Visual Box
        if (el.type === 'volume_cue') {
            const levels = {
                quiet: { emoji: '🤫', sv: 'Tyst Arbete', en: 'Quiet Work', color: 'bg-rose-50 text-rose-700 border-rose-300 shadow-rose-900/10' },
                whisper: { emoji: '💬', sv: 'Viskröst (Par)', en: 'Whisper (Pair)', color: 'bg-amber-50 text-amber-700 border-amber-300 shadow-amber-900/10' },
                discuss: { emoji: '🗣️', sv: 'Diskutera (Grupp)', en: 'Discuss (Group)', color: 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-emerald-900/10' }
            };
            const config = levels[el.volumeLevel || 'quiet'];
            
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        {/* 🟢 FIX: Invisible SVG rect behind the HTML ensures perfect clicking & dragging */}
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="transparent" />
                        
                        {/* 🟢 FIX: pointer-events-none allows clicks to pass through the HTML down to the SVG rect! */}
                        <foreignObject x={el.x} y={el.y} width={el.width} height={el.height} className="pointer-events-none">
                            <div className={`w-full h-full rounded-[2rem] border-[3px] flex flex-col items-center justify-center shadow-lg transition-colors duration-500 ${config.color}`}>
                                <div className="text-5xl drop-shadow-md mb-2">{config.emoji}</div>
                                <div className="font-black uppercase tracking-widest text-center text-[14px] leading-tight px-2">
                                    {lang === 'sv' ? config.sv : config.en}
                                </div>
                            </div>
                        </foreignObject>
                    </g>
                    {showUI && renderHandles(el)}
                </React.Fragment>
            );
        }

        // Standard Shapes (Rect, Circle, Triangle, Fractions, Spinner)
        const fills = [], borderL = [];
        if (['rect', 'frac_rect', 'circle', 'frac_circle', 'spinner', 'triangle'].includes(el.type)) {
            if (el.divisions) {
                for (let i = 0; i < el.divisions; i++) {
                    const secCol = el.sliceColors?.[i] || 'transparent';
                    if (el.type.includes('rect')) {
                        const sw = el.width / el.divisions;
                        fills.push(<rect key={i} x={el.x + (i * sw)} y={el.y} width={sw} height={el.height} fill={secCol} className="cursor-pointer" onPointerDown={(e) => { e.stopPropagation(); toggleFill(el.id, i); }} />);
                        if (i > 0) borderL.push(<line key={i} x1={el.x + (i * sw)} y1={el.y} x2={el.x + (i * sw)} y2={el.y + el.height} stroke="black" strokeWidth="2" />);
                    } else if (el.type.includes('circle') || el.type === 'spinner') {
                        const a = 360/el.divisions, sA = i*a, eA = (i+1)*a, x1 = cx + r*Math.cos(Math.PI*sA/180), y1 = cy + r*Math.sin(Math.PI*sA/180), x2 = cx + r*Math.cos(Math.PI*eA/180), y2 = cy + r*Math.sin(Math.PI*eA/180);
                        fills.push(<path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={el.type === 'spinner' && secCol === 'transparent' ? 'white' : secCol} className="cursor-pointer" onPointerDown={(e) => { e.stopPropagation(); toggleFill(el.id, i); }} />);
                        borderL.push(<line key={`l-${i}`} x1={cx} y1={cy} x2={x1} y2={y1} stroke="black" strokeWidth="2" />);
                    }
                }
            }
            return (
                <g key={el.id} data-id={el.id} transform={transform} className="pointer-events-auto cursor-move">
                    {fills}
                    {/* 🟢 FIX: Changed fill="none" to fill="transparent" so the insides of shapes are fully clickable! */}
                    {/* 🟢 FIX: Changed fill="none" to fill="transparent" so the insides of shapes are fully clickable! */}
                    {el.type === 'triangle' ? (() => {
                        const pts = el.triangleType === 'right' 
                            ? `${el.x},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}` 
                            : el.triangleType === 'isosceles' 
                                ? `${el.x+el.width/2},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}` 
                                : `${el.x+el.width/4},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}`; // 🟢 Scalene! Flat base, offset apex
                        return <polygon points={pts} fill="transparent" stroke="black" strokeWidth={el.strokeWidth} />;
                    })() : el.type.includes('rect') ? <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="transparent" stroke="black" strokeWidth={el.strokeWidth} /> : <circle cx={cx} cy={cy} r={r} fill="transparent" stroke="black" strokeWidth={el.strokeWidth} />}
                    {borderL}
                    {el.type === 'spinner' && (
                        <g style={{ transform: `rotate(${el.arrowRotation || 0}deg)`, transition: 'transform 3s cubic-bezier(0.1, 0, 0.1, 1)', transformOrigin: `${cx}px ${cy}px` }}>
                            <line x1={cx} y1={cy} x2={cx} y2={cy-r+15} stroke="black" strokeWidth="8" strokeLinecap="round" />
                            <path d={`M ${cx-10} ${cy-r+25} L ${cx} ${cy-r+5} L ${cx+10} ${cy-r+25} Z`} fill="black" />
                        </g>
                    )}
                    {el.showLabel && <text x={el.type.includes('rect') ? el.x + el.width/2 : cx} y={el.type.includes('rect') ? el.y - 25 : cy - r - 25} textAnchor="middle" className="text-3xl font-black fill-black select-none pointer-events-none">{Object.keys(el.sliceColors || {}).length}/{el.divisions}</text>}
                    {showUI && renderHandles(el, r)}
                </g>
            );
        }

        return null;
    };

    return (
        <>
            <svg 
                ref={svgRef}
                viewBox={`0 0 ${resolution.w} ${resolution.h}`}
                preserveAspectRatio="xMidYMid meet"
                className={`absolute inset-0 w-full h-full z-30 ${activeTool === 'select' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
                onPointerDown={handlePointerDown}
            >
                {elements.map(renderElement)}

                {isDrawing && (activeTool === 'pen' || activeTool === 'highlighter') && activePathRef.current && (
                    <path 
                        id="active-drawing-path"
                        stroke={activePathRef.current.stroke} 
                        strokeWidth={activePathRef.current.strokeWidth} 
                        fill="none" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        opacity={activePathRef.current.opacity} 
                    />
                )}
            </svg>

            <Toolbar 
                lang={lang} 
                activeTool={activeTool} 
                setActiveTool={setActiveTool} 
                color={color} 
                setColor={setColor} 
                onClear={() => setElements([])} 
                canUndo={false} 
                canRedo={false}
                bgType={bgType}
                onToggleBg={onToggleBg}
            />
        </>
    );
}