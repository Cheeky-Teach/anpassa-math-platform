import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import 'mathlive';
import { MathfieldElement } from 'mathlive';
import { 
    ChevronLeft, Hash, Plus, Minus, Grid3X3, 
    CircleDot, Square as SquareIcon, RotateCw, 
    Play, Share2, RefreshCw, LayoutTemplate, Type, Trash2, Triangle,
    BarChart2, List, Clock as ClockIcon, Timer as TimerIcon, Pause
} from 'lucide-react';


const WhiteboardView = ({ onBack, lang }) => {
    // --- 1. STATE MANAGEMENT ---
    const [elements, setElements] = useState(() => {
        const saved = localStorage.getItem('anpassa_whiteboard_elements');
        return saved ? JSON.parse(saved) : [];
    });
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('anpassa_whiteboard_history');
        return saved ? JSON.parse(saved) : [[]];
    });
    const [historyIndex, setHistoryIndex] = useState(() => {
        const saved = localStorage.getItem('anpassa_whiteboard_h_index');
        return saved ? parseInt(saved) : 0;
    });
    const [bgType, setBgType] = useState(() => localStorage.getItem('anpassa_whiteboard_bg') || 'grid');

    const [activeTool, setActiveTool] = useState('select');
    const [color, setColor] = useState('#0f172a');
    const [zoom, setZoom] = useState(1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);
    const [editingId, setEditingId] = useState(null); 
    const [interactionMode, setInteractionMode] = useState(null); 
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [currentTime, setCurrentTime] = useState(new Date());

    const containerRef = useRef(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1920, h: 1080 });

    // --- 2. PERSISTENCE & TIMERS ---
    useEffect(() => {
        localStorage.setItem('anpassa_whiteboard_elements', JSON.stringify(elements));
        localStorage.setItem('anpassa_whiteboard_history', JSON.stringify(history));
        localStorage.setItem('anpassa_whiteboard_h_index', historyIndex.toString());
        localStorage.setItem('anpassa_whiteboard_bg', bgType);
    }, [elements, history, historyIndex, bgType]);

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
    }, []);

    // --- 3. HELPERS ---
    const getCoordinates = (e, shouldSnap = true) => {
        const svg = containerRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let x = (clientX - rect.left) * (viewBox.w / zoom / rect.width) + viewBox.x;
        let y = (clientY - rect.top) * (viewBox.h / zoom / rect.height) + viewBox.y;
        if (shouldSnap && !['pen', 'highlighter'].includes(activeTool)) {
            x = Math.round(x / 20) * 20; y = Math.round(y / 20) * 20;
        }
        return { x, y };
    };

    const commitToHistory = (newElements) => {
        const snapshot = JSON.parse(JSON.stringify(newElements));
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(snapshot);
        const finalHistory = newHistory.length > 50 ? newHistory.slice(1) : newHistory;
        setHistory(finalHistory);
        setHistoryIndex(finalHistory.length - 1);
        setElements(newElements);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const prev = historyIndex - 1;
            setElements(JSON.parse(JSON.stringify(history[prev])));
            setHistoryIndex(prev);
            setSelectedId(null); setEditingId(null);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const next = historyIndex + 1;
            setElements(JSON.parse(JSON.stringify(history[next])));
            setHistoryIndex(next);
        }
    };

    const deleteElement = (id) => {
        const next = elements.filter(el => el.id !== id);
        commitToHistory(next);
        setSelectedId(null);
    };

    const updateDivisions = (id, delta) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, divisions: Math.max(1, (el.divisions || 1) + delta), sliceColors: {} } : el));
    };

    const spinSpinner = (id) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, arrowRotation: (el.arrowRotation || 0) + 1440 + Math.random() * 360 } : el));
    };

    const rollDice = (id) => {
        let iterations = 0;
        const interval = setInterval(() => {
            setElements(prev => prev.map(el => 
                el.id === id ? { ...el, value: Math.floor(Math.random() * 6) + 1, isRolling: true } : el
            ));
            iterations++;
            if (iterations > 12) {
                clearInterval(interval);
                setElements(prev => prev.map(el => 
                    el.id === id ? { ...el, isRolling: false } : el
                ));
            }
        }, 60);
    };

    const toggleFill = (id, idx) => {
        setElements(prev => prev.map(el => {
            if (el.id === id) {
                const colors = { ...(el.sliceColors || {}) };
                if (colors[idx] === color) delete colors[idx]; else colors[idx] = color;
                return { ...el, sliceColors: colors };
            }
            return el;
        }));
    };

    // --- 4. INTERACTION HANDLERS ---
    const handleMouseDown = (e) => {
        if (e.target.closest('.ui-ignore')) return;
        const { x, y } = getCoordinates(e);
        if (selectedId && e.target.closest('foreignObject')) return;

        if (['timer', 'clock', 'ruler', 'coord', 'dice'].includes(activeTool)) {
            const newId = Date.now();
            const centerX = viewBox.x + (viewBox.w / zoom) / 2;
            const centerY = viewBox.y + (viewBox.h / zoom) / 2;
            let newEl = { id: newId, type: activeTool, x: centerX - 150, y: centerY - 150, width: 200, height: 200, stroke: color, rotation: 0, opacity: 1 };
            
            if (activeTool === 'timer') { newEl.duration = 60; newEl.timeLeft = 60; newEl.isRunning = false; }
            else if (activeTool === 'clock') { newEl.hourRotation = 300; newEl.minRotation = 0; }
            else if (activeTool === 'ruler') { newEl.x = centerX-400; newEl.width = 800; newEl.height = 100; newEl.min = "0"; newEl.max = "10"; newEl.stepValue = 1; newEl.unitType = 'whole'; newEl.denom = 4; }
            else if (activeTool === 'coord') { newEl.stepX = "1"; newEl.stepY = "1"; newEl.gridSize = 40; newEl.isFirstQuadrant = false; newEl.showLabels = true; newEl.fontSize = 20; }
            else if (activeTool === 'dice') { newEl.value = 1; newEl.isRolling = false; newEl.width = 120; newEl.height = 120; }

            const updated = [...elements, newEl];
            setElements(updated);
            commitToHistory(updated);
            setSelectedId(newId);
            setActiveTool('select');
            return;
        }

        if (activeTool === 'select') {
            const hit = [...elements].reverse().find(el => isPointInElement(x, y, el));
            if (hit) {
                setSelectedId(hit.id); setInteractionMode('moving'); setIsDrawing(true);
                const startX = hit.x || (hit.points ? hit.points[0].x : 0);
                const startY = hit.y || (hit.points ? hit.points[0].y : 0);
                setDragOffset({ x: x - startX, y: y - startY });
            } else { 
                setSelectedId(null); setInteractionMode('panning'); setIsDrawing(true);
                setPanStart({ x: e.clientX, y: e.clientY });
            }
            return;
        }

        setIsDrawing(true); setInteractionMode('drawing');
        const newId = Date.now();
        let newEl = { id: newId, type: activeTool, x, y, startX: x, startY: y, width: 0, height: 0, stroke: color, fill: 'none', rotation: 0, strokeWidth: 4, opacity: 1 };
        if (activeTool === 'line') { newEl.x2 = x; newEl.y2 = y; newEl.showEquation = false; }
        else if (activeTool === 'triangle') { newEl.triangleType = 'right'; }
        else if (activeTool === 'protractor') { newEl.width = 400; newEl.height = 200; }
        else if (activeTool === 'tchart') {
            newEl.width = 750; newEl.height = 450; newEl.chartType = 'bar'; newEl.showGraph = true;
            newEl.xLabel = 'X'; newEl.yLabel = 'Y';
            newEl.rows = [{ label: 'A', value: 10 }, { label: 'B', value: 20 }];
        }
        else if (activeTool.startsWith('3d_')) { newEl.type = 'shapes_3d'; newEl.shape3D = activeTool.replace('3d_', ''); newEl.showInternal = true; newEl.width = 200; newEl.height = 200; }
        else if (activeTool === 'pen' || activeTool === 'highlighter') { newEl.type = 'path'; newEl.points = [{ x, y }]; newEl.strokeWidth = activeTool === 'highlighter' ? 35 : 6; newEl.opacity = activeTool === 'highlighter' ? 0.4 : 1; }
        else if (activeTool.startsWith('frac_') || activeTool === 'spinner') { newEl.divisions = 4; newEl.sliceColors = {}; newEl.showLabel = false; if (activeTool === 'spinner') newEl.arrowRotation = 0; }
        else if (activeTool === 'node') { newEl.label = ""; newEl.width = 80; newEl.height = 80; }
        else if (activeTool === 'math') { 
            newEl.label = "x = "; 
            newEl.width = 300; 
            newEl.height = 80; 
            newEl.fontSize = 32;
        }
        setElements(prev => [...prev, newEl]); setSelectedId(newId);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(e);
        if (interactionMode === 'panning') {
            const dx = (e.clientX - panStart.x) * (viewBox.w / zoom / containerRef.current.clientWidth);
            const dy = (e.clientY - panStart.y) * (viewBox.h / zoom / containerRef.current.clientHeight);
            setViewBox(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
            setPanStart({ x: e.clientX, y: e.clientY });
            return;
        }
        setElements(prev => {
            const updated = [...prev];
            const el = updated.find(item => item.id === (selectedId || updated[updated.length - 1].id));
            if (!el) return prev;
            if (interactionMode === 'rotating-hour' || interactionMode === 'rotating-min') {
                const cx = el.x + el.width/2, cy = el.y + el.height/2;
                const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
                if (interactionMode === 'rotating-hour') el.hourRotation = angle; else el.minRotation = angle;
            } else if (interactionMode === 'rotating') {
                const cx = el.x + el.width/2, cy = el.y + el.height/2;
                el.rotation = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
            } else if (interactionMode === 'moving') {
                const dx = x - (el.x + dragOffset.x); const dy = y - (el.y + dragOffset.y);
                if (el.type === 'path') el.points = el.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                if (el.type === 'line') { el.x2 += dx; el.y2 += dy; }
                el.x = x - dragOffset.x; el.y = y - dragOffset.y;
            } else if (interactionMode === 'resizing') {
                el.width = Math.max(50, x - el.x);
                el.height = (el.shape3D === 'cube') ? el.width : Math.max(50, y - el.y);
                if (el.type === 'line') { el.x2 = x; el.y2 = y; }
            } else if (interactionMode === 'drawing') {
                if (el.type === 'path') el.points.push({ x, y });
                else if (el.type === 'line') { el.x2 = x; el.y2 = y; }
                else if (['node', 'spinner'].includes(el.type)) {
                    const r = Math.sqrt((x - el.startX)**2 + (y - el.startY)**2);
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

    const handleMouseUp = () => { 
        if (!isDrawing) return; 
        setIsDrawing(false); setInteractionMode(null); 
        setElements(current => {
            const filtered = current.filter(el => {
                if (el.type === 'path') return el.points.length > 2;
                if (el.type === 'line') return Math.abs(el.x - el.x2) > 5 || Math.abs(el.y - el.y2) > 5;
                if (['timer', 'clock', 'ruler', 'coord'].includes(el.type)) return true;
                return el.width > 5 || el.height > 5;
            });
            if (interactionMode !== 'panning') commitToHistory(filtered);
            return filtered;
        });
        const discrete = ['rect', 'circle', 'triangle', 'coord', 'shapes_3d', 'tchart', 'frac_rect', 'frac_circle', 'spinner'];
        if (discrete.includes(activeTool) || (activeTool && activeTool.startsWith('3d_'))) setActiveTool('select');
    };

    const isPointInElement = (x, y, el) => {
        if (el.type === 'path' && el.points && el.points.length > 0) return Math.abs(x - el.points[0].x) < 30 && Math.abs(y - el.points[0].y) < 30;
        const r = el.width / 2;
        const bounds = ['rect', 'coord', 'triangle', 'ruler', 'shapes_3d', 'tchart'];
        if (bounds.some(b => el.type.includes(b))) return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
        if (el.type.includes('circle') || ['spinner', 'node', 'protractor', 'clock', 'timer'].includes(el.type)) return Math.sqrt((x - (el.x + r))**2 + (y - (el.y + r))**2) <= r;
        if (el.type === 'line') {
            const d = Math.abs((el.y2-el.y)*x - (el.x2-el.x)*y + el.x2*el.y - el.y2*el.x) / Math.sqrt((el.y2-el.y)**2 + (el.x2-el.x)**2);
            return d < 15;
        }
        return false;
    };

    // --- 5. RENDER ENGINE ---
    const renderElement = (el) => {
        const isSelected = selectedId === el.id;
        const showUI = isSelected || hoveredId === el.id;
        const transform = `rotate(${el.rotation || 0}, ${el.x + el.width/2}, ${el.y + el.height/2})`;

        // Shared dimensions
        const r = el.width / 2;
        const cx = el.x + r;
        const cy = el.y + r;

        if (el.type === 'path') {
            const d = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            return <path key={el.id} d={d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" opacity={el.opacity} />;
        }

        if (el.type === 'line') {
            const parent = elements.find(g => g.type === 'coord' && el.x >= g.x && el.x <= g.x + g.width);
            let eq = "";
            if (parent && el.showEquation) {
                const s = parent.gridSize, ox = parent.isFirstQuadrant ? parent.x : parent.x + parent.width/2, oy = parent.isFirstQuadrant ? parent.y + parent.height : parent.y + parent.height/2;
                const x1 = (el.x-ox)/s*(parseFloat(parent.stepX)||1), y1 = (oy-el.y)/s*(parseFloat(parent.stepY)||1), x2 = (el.x2-ox)/s*(parseFloat(parent.stepX)||1), y2 = (oy-el.y2)/s*(parseFloat(parent.stepY)||1);
                const m = (y2-y1)/(x2-x1||0.001); const c = y1 - m*x1;
                eq = `y = ${m.toFixed(1)}x ${c >= 0 ? '+' : ''} ${c.toFixed(1)}`;
            }
            return (
                <g key={el.id} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" />
                    {el.showEquation && <g transform={`translate(${el.x2+15}, ${el.y2})`}><rect x="-5" y="-18" width="140" height="28" fill="white" fillOpacity="0.9" rx="4"/><text fontSize="18" fontWeight="bold" fill={el.stroke}>{eq}</text></g>}
                    {showUI && renderHandles(el)}
                </g>
            );
        }

        if (el.type === 'triangle') {
            const w = el.width, h = el.height;
            const pts = el.triangleType === 'right' ? `${el.x},${el.y} ${el.x},${el.y+h} ${el.x+w},${el.y+h}` :
                        el.triangleType === 'isosceles' ? `${el.x+w/2},${el.y} ${el.x},${el.y+h} ${el.x+w},${el.y+h}` :
                        `${el.x+w/3},${el.y} ${el.x},${el.y+h} ${el.x+w},${el.y+h*0.8}`;
            return <g key={el.id} transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}><polygon points={pts} fill="none" stroke="black" strokeWidth={el.strokeWidth} />{showUI && renderHandles(el)}</g>;
        }

        if (el.type === 'coord') {
            const s = el.gridSize || 40, ox = el.isFirstQuadrant ? el.x : el.x + el.width/2, oy = el.isFirstQuadrant ? el.y+el.height : el.y+el.height/2;
            const lns = [], lbs = [];
            const stepX = parseFloat(el.stepX) || 1;
            const stepY = parseFloat(el.stepY) || 1;
            for (let i = -20; i <= 20; i++) {
                const xp = ox + i*s, yp = oy - i*s;
                if (xp >= el.x && xp <= el.x+el.width) { lns.push(<line key={`v-${i}`} x1={xp} y1={el.y} x2={xp} y2={el.y+el.height} stroke="#cbd5e1" strokeWidth="1" />); if (el.showLabels && i!==0) lbs.push(<text key={`tx-${i}`} x={xp} y={oy+25} textAnchor="middle" fontSize={el.fontSize} fontWeight="900" fill="black">{(i * stepX).toLocaleString()}</text>); }
                if (yp >= el.y && yp <= el.y+el.height) { lns.push(<line key={`h-${i}`} x1={el.x} y1={yp} x2={el.x+el.width} y2={yp} stroke="#cbd5e1" strokeWidth="1" />); if (el.showLabels && i !== 0) lbs.push(<text key={`ty-${i}`} x={ox-10} y={yp+5} textAnchor="end" fontSize={el.fontSize} fontWeight="900" fill="black">{(i * stepY).toLocaleString()}</text>); }
            }
            return <g key={el.id} transform={transform} onClick={e=>{e.stopPropagation(); setSelectedId(el.id);}}><rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke="black" strokeWidth="1" />{lns}<line x1={el.x} y1={oy} x2={el.x+el.width} y2={oy} stroke="black" strokeWidth="3" /><line x1={ox} y1={el.y} x2={ox} y2={el.y+el.height} stroke="black" strokeWidth="3" />{lbs}<text x={ox-10} y={oy+25} fontSize={el.fontSize} fontWeight="900" fill="black">0</text>{showUI && renderHandles(el)}</g>;
        }

        if (el.type === 'ruler') {
            const ticks = [], rng = el.max - el.min, pxU = el.width / rng;
            const step = el.unitType === 'fraction' ? 1/el.denom : el.stepValue;
            for (let i = 0; i <= rng + 0.01; i += step) {
                const val = parseFloat(el.min) + i, xp = el.x + i * pxU;
                const isWhole = Math.abs(val % 1) < 0.01;
                ticks.push(<line key={i} x1={xp} y1={el.y + 35} x2={xp} y2={el.y + 65} stroke="black" strokeWidth={isWhole ? 4:2} />);
                let lbl = el.unitType === 'decimal' ? val.toFixed(1) : (el.unitType === 'fraction' ? (isWhole ? Math.round(val) : `${Math.round((val%1)*el.denom)}/${el.denom}`) : Math.round(val));
                if (lbl !== "" && (isWhole || el.unitType !== 'whole')) ticks.push(<text key={`l-${i}`} x={xp} y={el.y + 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="black">{lbl}</text>);
            }
            return <g key={el.id} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}><line x1={el.x} y1={el.y+50} x2={el.x+el.width} y2={el.y+50} stroke="black" strokeWidth="5" />{ticks}{showUI && renderHandles(el)}</g>;
        }

        if (el.type === 'tchart') {
            const tableW = el.width * 0.4, graphW = el.width * 0.55, graphH = el.height - 130;
            const maxVal = Math.max(...el.rows.map(r => r.value), 10);
            const barColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
            const yTicks = [];
            for (let j = 0; j <= 5; j++) {
                const val = Math.round((maxVal / 5) * j);
                const py = -(val / maxVal) * graphH;
                yTicks.push(<g key={j}><line x1="-5" y1={py} x2="0" y2={py} stroke="black" strokeWidth="1" /><text x="-10" y={py} textAnchor="end" alignmentBaseline="middle" fontSize="14" fontWeight="bold" fill="black">{val}</text></g>);
            }
            return (
                <g key={el.id} transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.95" stroke="black" strokeWidth="3" rx="8" />
                    <g transform={`translate(${el.x + 10}, ${el.y + 10})`}>
                        <line x1={tableW/2} y1="0" x2={tableW/2} y2={el.height - 20} stroke="black" strokeWidth="4" />
                        <line x1="0" y1="50" x2={tableW} y2="50" stroke="black" strokeWidth="4" />
                        <text x={tableW/4} y="35" textAnchor="middle" fontWeight="bold" fontSize="22" fill="black">{el.xLabel}</text>
                        <text x={3*tableW/4} y="35" textAnchor="middle" fontWeight="bold" fontSize="22" fill="black">{el.yLabel}</text>
                        {el.rows.map((row, i) => (
                            <g key={i} transform={`translate(0, ${85 + i*40})`}><text x={tableW/4} y="20" textAnchor="middle" fontSize="18" fill="black">{row.label}</text><text x={3*tableW/4} y="20" textAnchor="middle" fontSize="18" fill="black">{row.value}</text></g>
                        ))}
                    </g>
                    {el.showGraph && (
                        <g transform={`translate(${el.x + tableW + 60}, ${el.y + el.height - 90})`}>
                            <line x1="0" y1="0" x2={graphW} y2="0" stroke="black" strokeWidth="2" />
                            <line x1="0" y1="0" x2="0" y2={-graphH} stroke="black" strokeWidth="2" />
                            {yTicks}
                            {el.rows.map((row, i) => {
                                const barWidth = (graphW / el.rows.length) * 0.7, barH = (row.value / maxVal) * graphH, px = i * (graphW / el.rows.length) + (graphW / el.rows.length) / 2;
                                return (
                                    <g key={i}>
                                        {el.chartType === 'bar' ? <rect x={px - barWidth/2} y={-barH} width={barWidth} height={barH} fill={barColors[i % barColors.length]} fillOpacity="0.7" stroke="black" strokeWidth="1" /> : (i < el.rows.length - 1 && <line x1={px} y1={-barH} x2={(i+1)*(graphW/el.rows.length)+graphW/el.rows.length/2} y2={-(el.rows[i+1].value/maxVal)*graphH} stroke={el.stroke} strokeWidth="4" />)}
                                        <g transform={`translate(${px}, 15) rotate(45)`}><text x="0" y="0" textAnchor="end" fontSize="14" fontWeight="900" fill="black">{row.label}</text></g>
                                    </g>
                                );
                            })}
                        </g>
                    )}
                    {showUI && renderHandles(el)}
                </g>
            );
        }

        if (el.type === 'clock') {
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                        <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth="6" />
                        {[...Array(12)].map((_, i) => {
                            const a = (i+1) * 30 * (Math.PI / 180);
                            return <g key={i}><line x1={cx + (r-20)*Math.sin(a)} y1={cy - (r-20)*Math.cos(a)} x2={cx + (r-5)*Math.sin(a)} y2={cy - (r-5)*Math.cos(a)} stroke="black" strokeWidth="4" /><text x={cx + (r-45)*Math.sin(a)} y={cy - (r-45)*Math.cos(a) + 8} textAnchor="middle" fontSize="24" fontWeight="bold" fill="black">{i+1}</text></g>;
                        })}
                        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.5} stroke="black" strokeWidth="12" strokeLinecap="round" transform={`rotate(${el.hourRotation}, ${cx}, ${cy})`} />
                        <circle cx={cx} cy={cy - r * 0.5} r="15" fill="white" stroke="black" strokeWidth="3" transform={`rotate(${el.hourRotation}, ${cx}, ${cy})`} className="cursor-pointer ui-ignore" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating-hour'); setIsDrawing(true);}} />
                        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.8} stroke="#475569" strokeWidth="8" strokeLinecap="round" transform={`rotate(${el.minRotation}, ${cx}, ${cy})`} />
                        <circle cx={cx} cy={cy - r * 0.8} r="12" fill="white" stroke="#475569" strokeWidth="3" transform={`rotate(${el.minRotation}, ${cx}, ${cy})`} className="cursor-pointer ui-ignore" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating-min'); setIsDrawing(true);}} />
                        <circle cx={cx} cy={cy} r="8" fill="black" />
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        if (el.type === 'timer') {
            const isDone = el.timeLeft === 0;
            const timeStr = `${Math.floor(el.timeLeft / 60)}:${(el.timeLeft % 60).toString().padStart(2, '0')}`;
            const prog = (el.timeLeft / el.duration) * 360;
            return (
                <g key={el.id} transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <circle cx={cx} cy={cy} r={r} fill={isDone ? "#fee2e2" : "#e0f2fe"} stroke={isDone ? "#ef4444" : "#3b82f6"} strokeWidth="4" />
                    <path d={`M ${cx} ${cy-r} A ${r} ${r} 0 ${prog > 180 ? 1 : 0} 1 ${cx + r*Math.sin(prog*Math.PI/180)} ${cy - r*Math.cos(prog*Math.PI/180)}`} fill="none" stroke={isDone ? "#ef4444" : "#10b981"} strokeWidth="12" strokeLinecap="round" />
                    <text x={cx} y={cy - 45} textAnchor="middle" fontSize={r/2.5} fontWeight="bold" fill={isDone ? "#ef4444" : "#1e293b"}>{timeStr}</text>
                    {showUI && (
                        <foreignObject x={cx - r*0.9} y={cy} width={r*1.8} height={r} className="ui-ignore">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex gap-4"><button onClick={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, isRunning:!o.isRunning}:o)); }} className={`p-5 rounded-full shadow-2xl ${el.isRunning ? 'bg-amber-500':'bg-emerald-500'} text-white`}><Play size={32}/></button><button onClick={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, timeLeft:el.duration, isRunning:false}:o)); }} className="p-5 bg-white rounded-full shadow-xl text-slate-600 border"><RefreshCw size={32}/></button></div>
                                <div className="flex gap-2"><button onClick={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, duration:o.duration+60, timeLeft:o.timeLeft+60}:o)); }} className="px-5 py-2.5 bg-white/90 rounded-2xl shadow-md text-sm font-black">+1m</button><button onClick={(e)=>{ e.stopPropagation(); setElements(p=>p.map(o=>o.id===el.id?{...o, duration:Math.max(0,o.duration-60), timeLeft:Math.max(0,o.timeLeft-60)}:o)); }} className="px-5 py-2.5 bg-white/90 rounded-2xl shadow-md text-sm font-black">-1m</button></div>
                            </div>
                        </foreignObject>
                    )}
                    {showUI && renderHandles(el, r)}
                </g>
            );
        }

        if (el.type === 'protractor') {
            const ticks = [];
            for (let i = 0; i <= 180; i += 1) {
                const a = (i * Math.PI) / 180, l = i % 10 === 0 ? 25 : 12;
                ticks.push(<line key={i} x1={cx + (r-l)*Math.cos(-a)} y1={cy + (r-l)*Math.sin(-a)} x2={cx + r*Math.cos(-a)} y2={cy + r*Math.sin(-a)} stroke="black" strokeWidth={i % 10 === 0 ? 3 : 1} />);
                if (i % 10 === 0) ticks.push(<text key={`t-${i}`} x={cx+(r-45)*Math.cos(-a)} y={cy+(r-45)*Math.sin(-a)} textAnchor="middle" fontSize="16" fontWeight="900" fill="black">{i}</text>);
            }
            return <g key={el.id} transform={transform} onClick={e=>{e.stopPropagation(); setSelectedId(el.id);}}><path d={`M ${el.x} ${cy} A ${r} ${r} 0 0 1 ${el.x+el.width} ${cy} Z`} fill="white" fillOpacity="0.5" stroke="black" strokeWidth="2" />{ticks}<circle cx={cx} cy={cy} r="5" fill="black" />{showUI && renderHandles(el, r)}</g>;
        }

        if (el.type === 'shapes_3d') {
            const w = el.width, h = el.height, d = w * 0.4;
            let faces = [], lines = [];
            const common = { fill: el.stroke, fillOpacity: 0.15, stroke: el.stroke, strokeWidth: 2 };
            const dotted = { stroke: el.stroke, strokeWidth: 2, strokeDasharray: "6", fill: "none" };
            
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
                    <g transform={transform} onMouseEnter={()=>setHoveredId(el.id)} onMouseLeave={()=>setHoveredId(null)} onClick={e=>{e.stopPropagation(); setSelectedId(el.id);}}>
                        {faces}{lines}
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        if (el.type === 'node') {
            return (
                <g key={el.id} transform={transform} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }} onDoubleClick={() => setEditingId(el.id)}>
                    <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth={el.strokeWidth} />
                    {editingId !== el.id && <text x={cx} y={cy+10} textAnchor="middle" className="text-2xl font-black fill-black select-none pointer-events-none">{el.label}</text>}
                    {editingId === el.id && (
                        <foreignObject x={cx - 40} y={cy - 20} width="80" height="40" className="ui-ignore">
                            <input autoFocus className="w-full h-full text-center text-xl font-black border-2 border-blue-500 rounded bg-white outline-none" 
                                defaultValue={el.label} 
                                onKeyDown={e => { if(e.key === 'Enter') setEditingId(null); }}
                                onChange={e => setElements(prev => prev.map(n => n.id === el.id ? {...n, label: e.target.value} : n))} 
                                onBlur={() => setEditingId(null)} />
                        </foreignObject>
                    )}
                    {showUI && renderHandles(el, r)}
                </g>
            );
        }

        if (el.type === 'math') {
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke={isSelected ? "#3b82f6" : "transparent"} strokeWidth="2" rx="8" />
                        
                        <foreignObject x={el.x} y={el.y} width={el.width} height={el.height} className="ui-ignore">
                            {/* MathLive WYSIWYG Editor */}
                            <math-field
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'transparent',
                                    fontSize: `${el.fontSize}px`,
                                    border: 'none',
                                    padding: '10px'
                                }}
                                onInput={e => {
                                    const newValue = e.target.value;
                                    setElements(prev => prev.map(n => n.id === el.id ? {...n, label: newValue} : n));
                                }}
                                // This ensures the teacher sees the visual math immediately
                                ref={(elDom) => {
                                    if (elDom && elDom.value !== el.label) {
                                        elDom.value = el.label;
                                    }
                                }}
                            >
                                {el.label}
                            </math-field>
                        </foreignObject>
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }

        const fills = []; const borderL = [];
        if (['rect', 'frac_rect', 'circle', 'frac_circle', 'spinner', 'triangle'].includes(el.type)) {
            if (el.divisions) {
                for (let i = 0; i < el.divisions; i++) {
                    const sectionColor = el.sliceColors?.[i] || 'transparent';
                    if (el.type.includes('rect')) {
                        const sw = el.width / el.divisions;
                        fills.push(<rect key={i} x={el.x + (i * sw)} y={el.y} width={sw} height={el.height} fill={sectionColor} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleFill(el.id, i); }} />);
                        if (i > 0) borderL.push(<line key={i} x1={el.x + (i * sw)} y1={el.y} x2={el.x + (i * sw)} y2={el.y + el.height} stroke="black" strokeWidth="2" />);
                    } else if (el.type.includes('circle') || el.type === 'spinner') {
                        const a = 360/el.divisions, sA = i*a, eA = (i+1)*a, x1 = cx + r*Math.cos(Math.PI*sA/180), y1 = cy + r*Math.sin(Math.PI*sA/180), x2 = cx + r*Math.cos(Math.PI*eA/180), y2 = cy + r*Math.sin(Math.PI*eA/180);
                        const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
                        fills.push(<path key={i} d={d} fill={el.type === 'spinner' && sectionColor === 'transparent' ? 'white' : sectionColor} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleFill(el.id, i); }} />);
                        borderL.push(<line key={`l-${i}`} x1={cx} y1={cy} x2={x1} y2={y1} stroke="black" strokeWidth="2" />);
                    }
                }
            }
            return (
                <g key={el.id} transform={transform} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    {fills}
                    {el.type.includes('rect') ? <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="none" stroke="black" strokeWidth={el.strokeWidth} /> : <circle cx={cx} cy={cy} r={r} fill="none" stroke="black" strokeWidth={el.strokeWidth} />}
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

        if (el.type === 'dice') {
            const dotLayouts = {
                1: [[50, 50]],
                2: [[25, 25], [75, 75]],
                3: [[25, 25], [50, 50], [75, 75]],
                4: [[25, 25], [25, 75], [75, 25], [75, 75]],
                5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
                6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
            };
            const currentDots = dotLayouts[el.value] || [];
            
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }} onDoubleClick={() => rollDice(el.id)}>
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" stroke="black" strokeWidth="4" rx="20" 
                              className={el.isRolling ? "animate-pulse" : ""} 
                              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                        {currentDots.map(([dx, dy], i) => (
                            <circle key={i} 
                                    cx={el.x + (dx * el.width / 100)} 
                                    cy={el.y + (dy * el.height / 100)} 
                                    r={el.width / 12} 
                                    fill={el.stroke} />
                        ))}
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }
        
        return null;
    };

    const renderHandles = (el, radius = 0) => {
        const isC = ['circle', 'frac_circle', 'spinner', 'node', 'protractor', 'clock', 'timer'].includes(el.type);
        const botY = isC ? el.y + radius*2 : el.y + el.height, rigX = isC ? el.x + radius*2 : el.x + el.width, cx = isC ? el.x + radius : el.x + el.width/2;
        const hasOptions = ['ruler', 'shapes_3d', 'triangle', 'line', 'tchart', 'frac_rect', 'frac_circle', 'spinner', 'coord','math','dice'].includes(el.type);

        return (
            <g className="ui-ignore">
                <rect x={el.x-5} y={el.y-5} width={(isC ? radius*2 : el.width)+10} height={(isC ? radius*2 : el.height)+10} fill="none" stroke="#3b82f6" strokeDasharray="5" opacity="0.4" />
                <foreignObject x={el.x-45} y={el.y-45} width={45} height={45}><button onClick={()=>deleteElement(el.id)} className="text-rose-500 bg-white border-2 border-rose-500 rounded-xl shadow-lg w-10 h-10 flex items-center justify-center hover:bg-rose-50"><Trash2 size={22}/></button></foreignObject>
                <circle cx={cx} cy={el.y-55} r={12} fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-alias" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating'); setIsDrawing(true);}} />
                <rect x={rigX-5} y={botY-5} width={20} height={20} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('resizing'); setIsDrawing(true);}} />
                {hasOptions && (
                    <foreignObject x={el.x} y={botY+20} width={600} height={300}>
                        <div className="flex flex-wrap gap-4 bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-5 pointer-events-auto text-[20px] font-black uppercase items-center">
                            {el.type === 'coord' && (<>StepX:<input type="text" className="w-14 border-b text-center" value={el.stepX} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepX:e.target.value}:o))} />StepY:<input type="text" className="w-14 border-b text-center" value={el.stepY} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepY:e.target.value}:o))} /><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, isFirstQuadrant:!o.isFirstQuadrant}:o))} className={`px-2 py-1 rounded ${el.isFirstQuadrant?'bg-emerald-500 text-white':'bg-slate-100'}`}>1st Quad</button></>)}
                            {el.type === 'tchart' && (<div className="flex flex-col gap-3 w-full"><div className="flex gap-2"><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: [...o.rows, {label:'?', value:0}]}:o))} className="px-3 py-2 bg-emerald-100 rounded-lg text-xs font-black uppercase">+ Rad</button><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, chartType: o.chartType==='bar'?'line':'bar'}:o))} className="px-3 py-2 bg-slate-100 rounded-lg">{el.chartType==='bar'?<BarChart2 size={18}/>:<List size={18}/>}</button><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showGraph:!o.showGraph}:o))} className={`px-3 py-2 rounded-lg text-xs ${el.showGraph ? 'bg-emerald-600 text-white':'bg-slate-100'}`}>Graf</button></div><div className="flex gap-2 text-xs">X:<input className="w-16 border-b" value={el.xLabel} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, xLabel:e.target.value}:o))} />Y:<input className="w-16 border-b" value={el.yLabel} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, yLabel:e.target.value}:o))} /></div></div>)}
                            {el.type === 'line' && <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showEquation:!o.showEquation}:o))} className={`px-4 py-2 rounded-lg ${el.showEquation ? 'bg-emerald-600 text-white':'bg-slate-100'}`}>Ekvation</button>}
                            {el.type === 'triangle' && (<><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'right'}:o))} className="px-3 py-1 bg-slate-100 rounded text-xs">Rät</button><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'isosceles'}:o))} className="px-3 py-1 bg-slate-100 rounded text-xs">Liksid</button><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'scalene'}:o))} className="px-3 py-1 bg-slate-100 rounded text-xs">Olik</button></>)}
                            {el.type === 'ruler' && (<>Min:<input type="text" className="w-14 border-b text-center" value={el.min} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, min:e.target.value}:o))} />Max:<input type="text" className="w-14 border-b text-center" value={el.max} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, max:e.target.value}:o))} /><select className="bg-slate-100 rounded-lg p-2" value={el.unitType} onChange={e=>{const isF = e.target.value==='fraction';setElements(p=>p.map(o=>o.id===el.id?{...o, unitType:e.target.value, min:isF?0:o.min, max:isF?2:o.max}:o));}}><option value="whole">Whole</option><option value="decimal">Decimal</option><option value="fraction">Fraction</option></select>{el.unitType==='fraction' && (<select className="bg-slate-100 rounded-lg p-2" value={el.denom} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, denom:parseInt(e.target.value)}:o))}>{[2,3,4,5,6,7,8,9,10].map(d=><option key={d} value={d}>1/{d}</option>)}</select>)}</>)}
                            {el.type === 'shapes_3d' && (<><span className="text-emerald-600 px-2 font-black">{el.shape3D}</span><button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showInternal:!o.showInternal}:o))} className={`p-3 rounded-lg border-2 ${el.showInternal?'bg-emerald-500 text-white border-emerald-600':'bg-slate-50 border-slate-200'}`}><Hash size={20}/></button></>)}
                            {(el.divisions || el.type === 'spinner') && (<><button onClick={()=>updateDivisions(el.id, -1)} className="w-12 h-12 bg-slate-100 rounded-xl font-black text-2xl shadow-sm">-</button><span className="px-3 text-lg">{el.divisions} Delar</span><button onClick={()=>updateDivisions(el.id, 1)} className="w-12 h-12 bg-slate-100 rounded-xl font-black text-2xl shadow-sm">+</button>{el.type==='spinner'&&<button onClick={()=>spinSpinner(el.id)} className="bg-emerald-500 text-white rounded-xl p-4 shadow-lg ml-2 hover:scale-110 transition-transform"><Play size={24} fill="white"/></button>}<button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i, showLabel:!i.showLabel}:i))} className={`p-2 rounded-xl ml-2 border-2 ${el.showLabel ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 border-slate-200'}`}><Hash size={20}/></button></>)}
                            {el.type === 'math' && (
                                <div className="flex flex-col gap-3 w-full">
                                    <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-500">
                                        Storlek:
                                        <input type="text" className="w-16 border-b-2 border-emerald-500 text-center bg-transparent outline-none text-emerald-700" value={el.fontSize} onChange={e => setElements(p => p.map(o => o.id === el.id ? { ...o, fontSize: e.target.value } : o))} />
                                    </div>
                                </div>
                            )}
                            {el.type === 'dice' && (
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-600 font-black">Tärning</span>
                                    <button onClick={() => rollDice(el.id)} className="bg-emerald-500 text-white rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all font-black uppercase">
                                        <RefreshCw size={18} className={el.isRolling ? "animate-spin" : ""} />
                                        Slå
                                    </button>
                                </div>
                            )}
                        </div>
                    </foreignObject>
                )}
            </g>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden z-[100] font-sans">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-[150]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"><ChevronLeft size={24} /></button>
                    <h1 className="text-sm font-black uppercase italic tracking-tighter text-slate-800">Anpassa <span className="text-emerald-600">Whiteboard</span></h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4">
                        <button onClick={() => setBgType('grid')} className={`p-1.5 rounded-md transition-all ${bgType === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}><Grid3X3 size={18} /></button>
                        <button onClick={() => setBgType('dot')} className={`p-1.5 rounded-md transition-all ${bgType === 'dot' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}><CircleDot size={18} /></button>
                        <button onClick={() => setBgType('blank')} className={`p-1.5 rounded-md transition-all ${bgType === 'blank' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}><SquareIcon size={18} /></button>
                    </div>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))} className="px-3 py-1 text-xs font-bold text-slate-500">-</button>
                        <span className="px-2 text-[10px] font-black text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(prev => Math.min(5, prev + 0.1))} className="px-3 py-1 text-xs font-bold text-slate-500">+</button>
                    </div>
                </div>
            </header>
            <div className="flex-1 relative flex overflow-visible">
                <main className={`flex-1 relative bg-slate-50 overflow-hidden cursor-crosshair z-10`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <svg ref={containerRef} className="w-full h-full touch-none select-none" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w / zoom} ${viewBox.h / zoom}`}>
                        <defs>
                            <pattern id="grid" width={40} height={40} patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" /></pattern>
                            <pattern id="dot" width={40} height={40} patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#cbd5e1" /></pattern>
                        </defs>
                        {bgType !== 'blank' && <rect width="1000%" height="1000%" x="-500%" y="-500%" fill={`url(#${bgType})`} />}
                        {elements.map(renderElement)}
                    </svg>
                </main>
                <Toolbar lang={lang} activeTool={activeTool} setActiveTool={setActiveTool} color={color} setColor={setColor} onUndo={undo} onRedo={redo} canUndo={historyIndex > 0} canRedo={historyIndex < history.length - 1} onClear={() => { commitToHistory([]); setSelectedId(null); }} />
            </div>
        </div>
    );
};

export default WhiteboardView;