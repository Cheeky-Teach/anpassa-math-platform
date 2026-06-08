import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import { Trash2, Play, RefreshCw, BarChart2, List, Hash } from 'lucide-react';
import 'mathlive';

export default function InteractiveCanvas({ lang = 'sv' }) {
    // --- 0. TRANSLATIONS ---
    const t = {
        sv: {
            stepX: "Steg X:", stepY: "Steg Y:", quad1: "1:a Kvadr.", addRow: "+ Rad", remRow: "- Rad",
            graph: "GRAF", equation: "Ekvation", right: "Rät", isosceles: "Liksid", whole: "Heltal",
            decimal: "Decimal", fraction: "Bråk", parts: "Delar", size: "Storlek:", dice: "Tärningar",
            sides: "Sidor", rollAll: "SLÅ ALLA", min: "Min:", max: "Max:", calc: "Räkna:", eg: "t.ex. 10-3"
        },
        en: {
            stepX: "Step X:", stepY: "Step Y:", quad1: "1st Quad", addRow: "+ Row", remRow: "- Row",
            graph: "GRAPH", equation: "Equation", right: "Right", isosceles: "Isosceles", whole: "Whole",
            decimal: "Decimal", fraction: "Fraction", parts: "Parts", size: "Size:", dice: "Dice",
            sides: "Sides", rollAll: "ROLL ALL", min: "Min:", max: "Max:", calc: "Calc:", eg: "e.g. 10-3"
        }
    }[lang || 'sv'];

    // --- 1. ISOLATED DRAWING STATES ---
    const [elements, setElements] = useState([]);
    const [activeTool, setActiveTool] = useState('select');
    const [color, setColor] = useState('#0f172a');
    const [isDrawing, setIsDrawing] = useState(false);
    
    const [selectedId, setSelectedId] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [interactionMode, setInteractionMode] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const svgRef = useRef(null);

    // --- 2. TIMERS & EFFECTS ---
    useEffect(() => {
        const interval = setInterval(() => {
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
    }, []);

    // GLOBAL BACKGROUND DESELECTION CONTROLLER
    useEffect(() => {
        const handleGlobalDeselect = (e) => {
            // Ignore clicks if interacting with text editors or UI utility toolbars
            if (e.target.closest('.ui-ignore') || e.target.closest('[contenteditable="true"]')) return;
            
            // Ignore clicks targeted directly at drawn shapes
            if (e.target.closest('[data-id]')) return;
            
            // If the user clicks empty space in Selection Mode, cleanly drop active selection handles
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

    // --- 3. ENGINE HELPERS ---
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
        const bounds = ['rect', 'coord', 'triangle', 'ruler', 'shapes_3d', 'tchart', 'math', 'dice', 'richText'];
        if (bounds.some(b => el.type.includes(b))) return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
        if (el.type.includes('circle') || ['spinner', 'node', 'protractor', 'clock', 'timer'].includes(el.type)) return Math.sqrt((x - (el.x + r))**2 + (y - (el.y + r))**2) <= r;
        if (el.type === 'line') return Math.abs((el.y2-el.y)*x - (el.x2-el.x)*y + el.x2*el.y - el.y2*el.x) / Math.sqrt((el.y2-el.y)**2 + (el.x2-el.x)**2) < 15;
        return false;
    };

    // --- 4. POINTER HANDLERS ---
    const handlePointerDown = (e) => {
        if (e.target.closest('.ui-ignore') || e.target.closest('[contenteditable="true"]')) return;
        if (e.target instanceof Element) e.target.setPointerCapture(e.pointerId);
        if (e.pointerType === 'pen' && activeTool === 'select') setActiveTool('pen');

        const { x, y } = getCoordinates(e, false);
        
        // 🟢 FIXED: Use native DOM hit detection to perfectly identify what is being dragged
        const targetNode = e.target.closest('[data-id]');
        const hitId = targetNode ? targetNode.getAttribute('data-id') : null;
        let hit = hitId ? elements.find(el => el.id === hitId) : null;
        
        // Fallback to mathematical boundaries if DOM hit misses (e.g. clicking transparent center of a circle)
        if (!hit) {
            hit = [...elements].reverse().find(el => isPointInElement(x, y, el));
        }

        // 1. Instant Spawn Tools
        if (['timer', 'clock', 'ruler', 'coord', 'dice', 'math', 'richText'].includes(activeTool)) {
            const newId = Date.now().toString();
            let newEl = { 
                id: newId, type: activeTool, x: x - 100, y: y - 100, 
                width: activeTool === 'math' ? 300 : (activeTool === 'richText' ? 500 : 200), 
                height: activeTool === 'math' ? 80 : (activeTool === 'richText' ? 300 : 200), 
                stroke: color, rotation: 0, opacity: 1 
            };
            if (activeTool === 'timer') { newEl.duration = 60; newEl.timeLeft = 60; newEl.isRunning = false; }
            else if (activeTool === 'clock') { newEl.hourRotation = 300; newEl.minRotation = 0; }
            else if (activeTool === 'ruler') { newEl.width = 800; newEl.height = 100; newEl.min = "0"; newEl.max = "10"; newEl.stepValue = 1; newEl.unitType = 'whole'; newEl.denom = 4; newEl.showSubnotches = true; }
            else if (activeTool === 'coord') { newEl.stepX = "1"; newEl.stepY = "1"; newEl.gridSize = 40; newEl.isFirstQuadrant = false; newEl.showLabels = true; newEl.fontSize = 20; }
            else if (activeTool === 'dice') { newEl.sides = "6"; newEl.diceData = [{ value: 1, color: '#ffffff' }]; }
            else if (activeTool === 'math') { newEl.label = ""; newEl.fontSize = 32; }
            else if (activeTool === 'richText') { newEl.content = "<p>Skriv här...</p>"; }

            setElements([...elements, newEl]);
            setSelectedId(newId);
            setActiveTool('select');
            setIsDrawing(false);
            setInteractionMode(null);
            return;
        }

        // 2. Select Tool
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

        // 3. Drag Draw Tools
        setIsDrawing(true); 
        setInteractionMode('drawing');
        const newId = Date.now().toString();
        const snap = getCoordinates(e, true);
        let newEl = { id: newId, type: activeTool, x: snap.x, y: snap.y, startX: snap.x, startY: snap.y, width: 0, height: 0, stroke: color, fill: 'none', strokeWidth: 4, opacity: 1, rotation: 0 };
        
        if (activeTool === 'pen' || activeTool === 'highlighter') { 
            newEl.type = 'path'; newEl.points = [{ x, y }]; newEl.strokeWidth = activeTool === 'highlighter' ? 35 : 6; newEl.opacity = activeTool === 'highlighter' ? 0.4 : 1; 
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
                el.height = (el.shape3D === 'cube') ? el.width : Math.max(50, raw.y - el.y);
            } else if (interactionMode === 'drawing') {
                if (el.type === 'path') el.points.push({ x: raw.x, y: raw.y });
                else if (el.type === 'line') { el.x2 = x; el.y2 = y; }
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
        
        setElements(current => current.filter(el => {
            if (el.type === 'path') return el.points.length > 2;
            if (el.type === 'line') return Math.abs(el.x - el.x2) > 5 || Math.abs(el.y - el.y2) > 5;
            if (['timer', 'clock', 'ruler', 'coord', 'richText'].includes(el.type)) return true;
            return el.width > 5 || el.height > 5;
        }));

        const discrete = ['rect', 'circle', 'triangle', 'coord', 'shapes_3d', 'tchart', 'frac_rect', 'frac_circle', 'spinner', 'richText'];
        if (discrete.includes(activeTool) || activeTool.startsWith('3d_')) setActiveTool('select');
    };

    // --- 5. RENDERERS ---
    const renderHandles = (el, radius = 0) => {
        const isC = ['circle', 'frac_circle', 'spinner', 'node', 'clock', 'timer'].includes(el.type);
        const isP = el.type === 'protractor';
        const botY = isP ? el.y + radius : (isC ? el.y + radius*2 : el.y + el.height);
        const cx = (isC || isP) ? el.x + radius : el.x + el.width/2;
        const rigX = (isC || isP) ? el.x + radius*2 : el.x + el.width;
        const hasOptions = ['ruler', 'shapes_3d', 'triangle', 'tchart', 'frac_rect', 'frac_circle', 'spinner', 'coord', 'math', 'dice'].includes(el.type);

        return (
            <g className="ui-ignore pointer-events-auto">
                <rect x={el.x-5} y={el.y-5} width={(isC || isP ? radius*2 : el.width)+10} height={(isP ? radius : (isC ? radius*2 : el.height))+10} fill="none" stroke="#3b82f6" strokeDasharray="5" opacity="0.4" />
                <foreignObject x={el.x - 45} y={el.y - 45} width={45} height={45}>
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
                    <foreignObject x={el.x} y={botY+20} width={700} height={350}>
                        <div className="flex flex-wrap gap-4 bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-5 pointer-events-auto text-[18px] font-black uppercase items-center" onPointerDown={e => e.stopPropagation()}>
                            {el.type === 'coord' && (
                                <>
                                    {t.stepX}<input type="text" className="w-14 border-b text-center outline-none" value={el.stepX} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepX:e.target.value}:o))} />
                                    {t.stepY}<input type="text" className="w-14 border-b text-center outline-none" value={el.stepY} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepY:e.target.value}:o))} />
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, isFirstQuadrant:!o.isFirstQuadrant}:o))} className={`px-2 py-1 rounded ${el.isFirstQuadrant?'bg-emerald-500 text-white':'bg-slate-100'}`}>{t.quad1}</button>
                                    <div className="flex items-center gap-2 border-l pl-4 border-slate-200 ml-2">
                                        <span className="text-[12px] text-slate-500 font-black lowercase">y =</span>
                                        <input type="text" placeholder="2x + 1" className="w-28 border-b-2 border-blue-500 outline-none text-center font-bold lowercase bg-blue-50/30 rounded-t" value={el.equation ? el.equation.replace('y=', '') : ""} onChange={(e) => setElements(p=>p.map(o=>o.id===el.id?{...o, equation: e.target.value ? `y=${e.target.value}` : ""}:o))} />
                                    </div>
                                </>
                            )}
                            {el.type === 'tchart' && (
                                <div className="flex gap-2">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: [...o.rows, {label:'?', value:'0'}]}:o))} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-black uppercase shadow-sm">{t.addRow}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: o.rows.length > 1 ? o.rows.slice(0, -1) : o.rows}:o))} className="px-3 py-2 bg-rose-100 text-rose-600 rounded-lg text-xs font-black uppercase">{t.remRow}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, chartType: o.chartType==='bar'?'line':'bar'}:o))} className="px-3 py-2 bg-slate-100 rounded-lg">{el.chartType==='bar'?<BarChart2 size={18}/>:<List size={18}/>}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showGraph:!o.showGraph}:o))} className={`px-4 py-2 rounded-lg text-xs font-black ${el.showGraph ? 'bg-emerald-600 text-white':'bg-slate-100'}`}>{t.graph}</button>
                                </div>
                            )}
                            {el.type === 'ruler' && (
                                <div className="flex flex-wrap gap-4 items-center">
                                    {t.min}<input type="text" className="w-14 border-b text-center outline-none" value={el.min} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, min:e.target.value}:o))} />
                                    {t.max}<input type="text" className="w-14 border-b text-center outline-none" value={el.max} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, max:e.target.value}:o))} />
                                    {t.calc}<input type="text" placeholder={t.eg} className="w-24 border-b border-emerald-500 text-center outline-none font-bold text-emerald-700" value={el.equation} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, equation:e.target.value}:o))} />
                                    <select className="bg-slate-100 rounded-lg p-2 text-xs font-bold" value={el.unitType} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, unitType:e.target.value}:o))}><option value="whole">{t.whole}</option><option value="decimal">{t.decimal}</option><option value="fraction">{t.fraction}</option></select>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showSubnotches: !o.showSubnotches}:o))} className={`p-2 rounded-lg ${el.showSubnotches ? 'bg-emerald-500 text-white' : 'bg-slate-50'}`}><Hash size={20}/></button>
                                </div>
                            )}
                            {el.type === 'dice' && (
                                <div className="flex items-center gap-4">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, diceData: (o.diceData||[]).slice(0,-1)}:o))} className="w-8 h-8 bg-slate-100 rounded-lg font-black">-</button>
                                    <span className="text-xs font-black">{(el.diceData||[]).length} {t.dice}</span>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, diceData: [...(o.diceData||[]), {value:1, color:'#ffffff'}]}:o))} className="w-8 h-8 bg-slate-100 rounded-lg font-black">+</button>
                                    <select className="bg-slate-50 border rounded p-1 text-xs" value={el.sides||"6"} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, sides:e.target.value}:o))}>{[4,6,8,10,12,20].map(s=><option key={s} value={s}>{s} {t.sides}</option>)}</select>
                                    <button onClick={()=>rollDice(el.id)} className="bg-emerald-500 text-white rounded-xl px-4 py-2 font-black text-xs">{t.rollAll}</button>
                                </div>
                            )}
                            {el.type === 'math' && (
                                <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-500">
                                    {t.size} <input type="text" className="w-16 border-b-2 border-emerald-500 text-center outline-none" value={el.fontSize} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, fontSize: e.target.value}:o))} />
                                </div>
                            )}
                            {el.type === 'triangle' && (
                                <>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'right'}:o))} className={`px-3 py-1 rounded text-xs ${el.triangleType==='right'?'bg-emerald-500 text-white':'bg-slate-100'}`}>{t.right}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'isosceles'}:o))} className={`px-3 py-1 rounded text-xs ${el.triangleType==='isosceles'?'bg-emerald-500 text-white':'bg-slate-100'}`}>{t.isosceles}</button>
                                </>
                            )}
                            {el.type === 'shapes_3d' && (
                                <>
                                    <span className="text-emerald-600 font-black">{el.shape3D}</span>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showInternal:!o.showInternal}:o))} className={`p-2 rounded border ${el.showInternal?'bg-emerald-500 text-white':'bg-slate-50'}`}><Hash size={18}/></button>
                                </>
                            )}
                            {(el.divisions || el.type === 'spinner') && (
                                <>
                                    <button onClick={()=>updateDivisions(el.id, -1)} className="w-8 h-8 bg-slate-100 rounded font-black">-</button>
                                    <span className="px-2">{el.divisions} {t.parts}</span>
                                    <button onClick={()=>updateDivisions(el.id, 1)} className="w-8 h-8 bg-slate-100 rounded font-black">+</button>
                                    <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i, showLabel:!i.showLabel}:i))} className={`p-2 rounded-xl ml-2 border-2 ${el.showLabel ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 border-slate-200'}`}><Hash size={20}/></button>
                                    {el.type==='spinner' && (<button onClick={()=>spinSpinner(el.id)} className="bg-emerald-500 text-white rounded-xl p-2 ml-2 active:scale-90 transition-transform"><Play size={18} fill="white"/></button>)}
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
            const d = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            return <path key={el.id} data-id={el.id} d={d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" opacity={el.opacity} className="pointer-events-auto cursor-move" />;
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
            const isDone = el.timeLeft === 0, timeStr = `${Math.floor(el.timeLeft / 60)}:${(el.timeLeft % 60).toString().padStart(2, '0')}`, prog = (el.timeLeft / el.duration) * 360;
            return (
                <g key={el.id} transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                    <circle cx={cx} cy={cy} r={r} fill={isDone ? "#fee2e2" : "#e0f2fe"} stroke={isDone ? "#ef4444" : "#3b82f6"} strokeWidth="4" />
                    <path d={`M ${cx} ${cy-r} A ${r} ${r} 0 ${prog > 180 ? 1 : 0} 1 ${cx + r*Math.sin(prog*Math.PI/180)} ${cy - r*Math.cos(prog*Math.PI/180)}`} fill="none" stroke={isDone ? "#ef4444" : "#10b981"} strokeWidth="12" strokeLinecap="round" />
                    <text x={cx} y={cy - 45} textAnchor="middle" fontSize={r/2.5} fontWeight="bold" fill={isDone ? "#ef4444" : "#1e293b"}>{timeStr}</text>
                    {showUI && (
                        <foreignObject x={cx - r*0.9} y={cy} width={r*1.8} height={r} className="ui-ignore pointer-events-auto">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-4"><button onPointerDown={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, isRunning:!o.isRunning}:o)); }} className={`p-5 rounded-full shadow-2xl ${el.isRunning ? 'bg-amber-500':'bg-emerald-500'} text-white`}><Play size={32}/></button><button onPointerDown={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, timeLeft:el.duration, isRunning:false}:o)); }} className="p-5 bg-white rounded-full shadow-xl text-slate-600 border"><RefreshCw size={32}/></button></div>
                                <div className="flex gap-2"><button onPointerDown={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, duration:o.duration+60, timeLeft:o.timeLeft+60}:o)); }} className="px-5 py-2.5 bg-white/90 rounded-2xl shadow-md text-sm font-black">+1m</button><button onPointerDown={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, duration:Math.max(0,o.duration-60), timeLeft:Math.max(0,o.timeLeft-60)}:o)); }} className="px-5 py-2.5 bg-white/90 rounded-2xl shadow-md text-sm font-black">-1m</button></div>
                            </div>
                        </foreignObject>
                    )}
                    {showUI && renderHandles(el, r)}
                </g>
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

        // Ruler
        if (el.type === 'ruler') {
            const ticks = [], rng = el.max - el.min, pxU = el.width / rng;
            const subStep = el.unitType === 'fraction' ? 1/el.denom : (el.unitType === 'decimal' ? 0.1 : 0.5);
            const labelStep = (el.unitType === 'fraction' || el.unitType === 'whole') ? 1 : (el.stepValue || 1);

            for (let i = 0; i <= rng + 0.001; i += subStep) {
                const val = parseFloat(el.min) + i, xp = el.x + i * pxU;
                const isLabelTick = Math.abs(i % labelStep) < 0.001 || Math.abs((i % labelStep) - labelStep) < 0.001;
                if (isLabelTick) {
                    ticks.push(<line key={`m-${i}`} x1={xp} y1={el.y + 30} x2={xp} y2={el.y + 70} stroke="black" strokeWidth="4" />);
                    ticks.push(<text key={`l-${i}`} x={xp} y={el.y + 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="black">{el.unitType === 'decimal' ? val.toFixed(1) : Math.round(val).toString()}</text>);
                } else if (el.showSubnotches) ticks.push(<line key={`s-${i}`} x1={xp} y1={el.y + 40} x2={xp} y2={el.y + 60} stroke="black" strokeWidth="2" opacity="0.5" />);
            }

            const hops = [], match = el.equation?.match(/(\d+)\s*([+-])\s*(\d+)/);
            if (match) {
                const startVal = parseInt(match[1]), op = match[2], count = parseInt(match[3]), dir = op === '+' ? 1 : -1, totalWidth = count * pxU, startX = el.x + (startVal - el.min) * pxU;
                for (let j = 0; j < count; j++) {
                    const x1 = startX + (j * dir * pxU), x2 = x1 + (dir * pxU), midX = (x1 + x2) / 2;
                    hops.push(<path key={j} d={`M ${x1} ${el.y + 30} Q ${midX} ${el.y - 40} ${x2} ${el.y + 30}`} fill="none" stroke={el.stroke} strokeWidth="3" strokeDasharray="6,4" />);
                    if (j === count - 1) hops.push(<path key="arrow" d={`M ${x2-5*dir} ${el.y+20} L ${x2} ${el.y+30} L ${x2-5*dir} ${el.y+40}`} fill="none" stroke={el.stroke} strokeWidth="3" />);
                }
                const labelX = startX + (totalWidth / 2) * dir;
                hops.push(<g key="lbl"><rect x={labelX - 25} y={el.y - 75} width="50" height="35" fill="white" rx="4" /><text x={labelX} y={el.y - 50} textAnchor="middle" fontSize="22" fontWeight="black" fill={el.stroke}>{op}{count}</text></g>);
            }
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move">
                        <line x1={el.x} y1={el.y+50} x2={el.x+el.width} y2={el.y+50} stroke="black" strokeWidth="5" />
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
            const dice = el.diceData || [], cols = Math.ceil(Math.sqrt(dice.length)), cellSize = el.width / cols;
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto cursor-move" onDoubleClick={() => rollDice(el.id)}>
                        {dice.map((d, i) => {
                            const dx = el.x + (i % cols) * cellSize, dy = el.y + Math.floor(i / cols) * cellSize, dSize = cellSize * 0.85;
                            return (
                                <g key={i} onPointerDown={(e) => { setElements(p => p.map(o => o.id === el.id ? {...o, diceData: o.diceData.map((dd, idx) => idx === i ? { ...dd, color: color } : dd)} : o)); }}>
                                    <rect x={dx + cellSize * 0.075} y={dy + cellSize * 0.075} width={dSize} height={dSize} fill={d.color || 'white'} stroke="black" strokeWidth="3" rx={dSize * 0.2} className={el.isRolling ? "animate-pulse" : "cursor-pointer"} />
                                    <text x={dx + cellSize/2} y={dy + cellSize/2 + (dSize*0.15)} textAnchor="middle" fontSize={dSize * 0.5} fontWeight="900" fill="black" className="select-none pointer-events-none">{d.value}</text>
                                </g>
                            );
                        })}
                    </g>
                    {showUI && renderHandles(el, r)}
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
                    const sizeMap = { "1": "12px", "3": "18px", "5": "32px", "7": "64px" };
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('fontSize', false, "7");
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const span = document.createElement("span");
                        span.style.fontSize = sizeMap[val] || "18px";
                        selection.getRangeAt(0).surroundContents(span);
                    }
                } else {
                    document.execCommand(cmd, false, val);
                }
            };

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} data-id={el.id} className="pointer-events-auto">
                        <rect 
                            x={el.x} y={el.y} width={el.width} height={el.height} 
                            fill="white" fillOpacity={isEditing ? 1 : 0.8} 
                            stroke={isSelected ? "#3b82f6" : "#e2e8f0"} strokeWidth={isSelected ? 3 : 1} rx="8"
                            style={{ cursor: isEditing ? 'default' : 'move' }}
                            onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id); }}
                        />
                        <foreignObject 
                            x={el.x} y={el.y} width={el.width} height={el.height}
                            style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
                        >
                            <div 
                                contentEditable={isEditing} suppressContentEditableWarning
                                className="w-full h-full p-4 outline-none prose prose-m overflow-y-auto font-sans text-slate-800"
                                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                                onBlur={(e) => setElements(prev => prev.map(item => item.id === el.id ? { ...item, content: e.currentTarget.innerHTML } : item))}
                                onPointerDown={(e) => e.stopPropagation()}
                                dangerouslySetInnerHTML={{ __html: el.content || '' }}
                            />
                        </foreignObject>

                        {isEditing && (
                            <foreignObject x={el.x} y={el.y - 85} width={Math.max(el.width, 420)} height={85} className="ui-ignore pointer-events-auto">
                                <div className="flex flex-col gap-1 bg-slate-900 p-2 rounded-xl shadow-2xl border border-slate-700" onPointerDown={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => applyStyle('bold')} className="w-8 h-8 text-white hover:bg-slate-700 rounded font-bold">B</button>
                                        <button onClick={() => applyStyle('italic')} className="w-8 h-8 text-white hover:bg-slate-700 rounded italic">I</button>
                                        <button onClick={() => applyStyle('underline')} className="w-8 h-8 text-white hover:bg-slate-700 rounded underline">U</button>
                                        <div className="w-px h-4 bg-slate-700 mx-1" />
                                        <button onClick={() => applyStyle('insertUnorderedList')} className="w-8 h-8 text-white hover:bg-slate-700 rounded flex items-center justify-center"><List size={14}/></button>
                                        <button onClick={() => applyStyle('insertOrderedList')} className="w-8 h-8 text-white hover:bg-slate-700 rounded text-[10px]">1.</button>
                                        <div className="w-px h-4 bg-slate-700 mx-1" />
                                        <button onClick={() => applyStyle('justifyLeft')} className="w-8 h-8 text-white hover:bg-slate-700 rounded text-xs align-left text-left">L</button>
                                        <button onClick={() => applyStyle('justifyCenter')} className="w-8 h-8 text-white hover:bg-slate-700 rounded text-xs align-center text-center">C</button>
                                        <button onClick={() => applyStyle('justifyRight')} className="w-8 h-8 text-white hover:bg-slate-700 rounded text-xs align-right text-right">R</button>
                                        <button onClick={() => setEditingId(null)} className="ml-auto px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600">Klar</button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <select onPointerDown={e => e.stopPropagation()} onChange={(e) => applyStyle('fontSize', e.target.value)} className="bg-slate-800 text-white text-[20px] rounded px-1 outline-none border border-slate-700 cursor-pointer">
                                            <option value="1">Liten</option><option value="3" defaultValue>Normal</option><option value="5">Stor</option><option value="7">Extra Stor</option>
                                        </select>
                                        <div className="flex gap-1 items-center">
                                            {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff'].map(c => (
                                                <button key={c} onClick={() => applyStyle('foreColor', c)} className="w-4 h-4 rounded-full border border-slate-600" style={{ background: c }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </foreignObject>
                        )}
                    </g>
                    {showUI && !isEditing && renderHandles(el)}
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
                    {el.type === 'triangle' ? (() => {
                        const pts = el.triangleType === 'right' ? `${el.x},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}` : el.triangleType === 'isosceles' ? `${el.x+el.width/2},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}` : `${el.x+el.width/3},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height*0.8}`;
                        return <polygon points={pts} fill="none" stroke="black" strokeWidth={el.strokeWidth} />;
                    })() : el.type.includes('rect') ? <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="none" stroke="black" strokeWidth={el.strokeWidth} /> : <circle cx={cx} cy={cy} r={r} fill="none" stroke="black" strokeWidth={el.strokeWidth} />}
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
            {/* 🟢 THE DRAWING LAYER */}
            <svg 
                ref={svgRef}
                className={`absolute inset-0 w-full h-full z-30 ${activeTool === 'select' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {elements.map(renderElement)}
            </svg>

            {/* 🟢 THE HORIZONTAL TOOLBAR */}
            <Toolbar 
                lang={lang} 
                activeTool={activeTool} 
                setActiveTool={setActiveTool} 
                color={color} 
                setColor={setColor} 
                onClear={() => setElements([])} 
                canUndo={false} 
                canRedo={false} 
            />
        </>
    );
}