import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import { 
    ChevronLeft, Hash, Plus, Minus, Grid3X3, 
    CircleDot, Square as SquareIcon, RotateCw, 
    Play, Share2, RefreshCw, LayoutTemplate, Type, Trash2, Triangle
} from 'lucide-react';

const WhiteboardView = ({ onBack, lang }) => {
    // --- 1. STATE MANAGEMENT (with persistence) ---
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
    const [editingId, setEditingId] = useState(null); // Node double-click editing
    const [interactionMode, setInteractionMode] = useState(null); 
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1920, h: 1080 });

    // --- 2. PERSISTENCE & COLOR SYNC ---
    useEffect(() => {
        localStorage.setItem('anpassa_whiteboard_elements', JSON.stringify(elements));
        localStorage.setItem('anpassa_whiteboard_history', JSON.stringify(history));
        localStorage.setItem('anpassa_whiteboard_h_index', historyIndex.toString());
        localStorage.setItem('anpassa_whiteboard_bg', bgType);
    }, [elements, history, historyIndex, bgType]);

    useEffect(() => {
        if (selectedId && activeTool === 'select') {
            setElements(prev => prev.map(el => el.id === selectedId ? { ...el, stroke: color } : el));
        }
    }, [color]);

    // --- 3. COORDINATE LOGIC & AUTO-SNAP ---
    const getCoordinates = (e, shouldSnap = true) => {
        const svg = containerRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        let x = (clientX - rect.left) * (viewBox.w / zoom / rect.width) + viewBox.x;
        let y = (clientY - rect.top) * (viewBox.h / zoom / rect.height) + viewBox.y;

        // AUTO-CONNECT FEATURE: Snap lines to the center of nodes
        if (activeTool === 'line') {
            const nearbyNode = elements.find(el => el.type === 'node' && 
                Math.sqrt((x - (el.x + el.width/2))**2 + (y - (el.y + el.height/2))**2) < 50
            );
            if (nearbyNode) {
                return { x: nearbyNode.x + nearbyNode.width/2, y: nearbyNode.y + nearbyNode.height/2 };
            }
        }

        if (shouldSnap && !['pen', 'highlighter'].includes(activeTool)) {
            x = Math.round(x / 20) * 20;
            y = Math.round(y / 20) * 20;
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
        const next = elements.map(el => 
            el.id === id ? { ...el, divisions: Math.max(1, (el.divisions || 1) + delta), filledIndices: [] } : el
        );
        commitToHistory(next);
    };

    const spinSpinner = (id) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, arrowRotation: (el.arrowRotation || 0) + 1440 + Math.random() * 360 } : el));
    };

    // --- 4. INTERACTION HANDLERS ---
    const handleMouseDown = (e) => {
        if (e.target.closest('.ui-ignore')) return;
        const { x, y } = getCoordinates(e);

        if (activeTool === 'select') {
            const hit = [...elements].reverse().find(el => isPointInElement(x, y, el));
            if (hit) {
                setSelectedId(hit.id);
                setInteractionMode('moving');
                setIsDrawing(true);
                setDragOffset({ x: x - (hit.x || 0), y: y - (hit.y || 0) });
            } else { setSelectedId(null); setEditingId(null); }
            return;
        }

        setIsDrawing(true);
        setInteractionMode('drawing');
        const newId = Date.now();
        let newElement = {
            id: newId, type: activeTool, x, y, startX: x, startY: y,
            width: 0, height: 0, stroke: color, fill: 'none', rotation: 0,
            strokeWidth: 6, opacity: 1,
        };

        if (activeTool === 'coord') {
            newElement.stepX = 1; newElement.stepY = 1; newElement.gridSize = 40;
            newElement.isFirstQuadrant = false; newElement.showLabels = true; newElement.fontSize = 14;
        } else if (activeTool === 'line') {
            newElement.x2 = x; newElement.y2 = y; newElement.showEquation = false;
        } else if (activeTool === 'triangle') {
            newElement.triangleType = 'right';
        } else if (activeTool === 'pen' || activeTool === 'highlighter') {
            newElement.type = 'path'; newElement.points = [{ x, y }];
            newElement.strokeWidth = activeTool === 'highlighter' ? 35 : 6;
            newElement.opacity = activeTool === 'highlighter' ? 0.4 : 1;
        } else if (activeTool.startsWith('frac_') || activeTool === 'spinner') {
            newElement.divisions = 4; newElement.filledIndices = [];
            newElement.showLabel = false;
            if (activeTool === 'spinner') newElement.arrowRotation = 0;
        } else if (activeTool === 'node') {
            newElement.label = "?"; newElement.width = 80; newElement.height = 80;
        }

        setElements(prev => [...prev, newElement]);
        setSelectedId(newId);
    };

    const handleMouseMove = (e) => {
        const { x, y } = getCoordinates(e);
        if (!isDrawing) return;

        setElements(prev => {
            const updated = [...prev];
            const el = updated.find(item => item.id === (selectedId || updated[updated.length - 1].id));
            if (!el) return prev;

            if (interactionMode === 'moving') {
                const dx = x - (el.x + dragOffset.x);
                const dy = y - (el.y + dragOffset.y);
                if (el.type === 'path') el.points = el.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                if (el.type === 'line') { el.x2 += dx; el.y2 += dy; }
                el.x = x - dragOffset.x; el.y = y - dragOffset.y;
            } else if (interactionMode === 'resizing') {
                el.width = Math.max(40, x - el.x); el.height = Math.max(40, y - el.y);
                if (el.type === 'line') { el.x2 = x; el.y2 = y; }
            } else if (interactionMode === 'rotating') {
                const cx = (el.x || 0) + (el.width || 0) / 2;
                const cy = (el.y || 0) + (el.height || 0) / 2;
                el.rotation = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
            } else if (interactionMode === 'drawing') {
                if (el.type === 'path') el.points.push({ x, y });
                else if (el.type === 'line') { el.x2 = x; el.y2 = y; }
                else if (['node', 'spinner'].includes(el.type)) {
                    const r = Math.sqrt((x - el.startX)**2 + (y - el.startY)**2);
                    el.width = r * 2; el.height = r * 2;
                    el.x = el.startX - r; el.y = el.startY - r;
                } else {
                    el.x = Math.min(x, el.startX); el.y = Math.min(y, el.startY);
                    el.width = Math.abs(x - el.startX); el.height = Math.abs(y - el.startY);
                }
            }
            return updated;
        });
    };

    const handleMouseUp = () => { if (!isDrawing) return; setIsDrawing(false); setInteractionMode(null); commitToHistory(elements); };

    const isPointInElement = (x, y, el) => {
        if (el.type === 'path') return Math.abs(x - el.points[0].x) < 30 && Math.abs(y - el.points[0].y) < 30;
        const r = el.width / 2;
        if (el.type.includes('rect') || el.type === 'coord' || el.type === 'triangle') return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
        if (el.type.includes('circle') || ['spinner', 'node'].includes(el.type)) return Math.sqrt((x - (el.x + r))**2 + (y - (el.y + r))**2) <= r;
        if (el.type === 'line') {
            const d = Math.abs((el.y2 - el.y) * x - (el.x2 - el.x) * y + el.x2 * el.y - el.y2 * el.x) / Math.sqrt((el.y2 - el.y)**2 + (el.x2 - el.x)**2);
            return d < 15;
        }
        return false;
    };

    const toggleFill = (id, idx) => {
        const next = elements.map(el => {
            if (el.id === id) {
                const filled = [...(el.filledIndices || [])];
                const fIdx = filled.indexOf(idx);
                if (fIdx > -1) filled.splice(fIdx, 1); else filled.push(idx);
                return { ...el, filledIndices: filled };
            }
            return el;
        });
        commitToHistory(next);
    };

    // --- 5. RENDER ENGINE ---
    const renderElement = (el) => {
        const isSelected = selectedId === el.id;
        const showUI = isSelected || hoveredId === el.id;
        const transform = `rotate(${el.rotation || 0}, ${el.x + el.width/2}, ${el.y + el.height/2})`;

        if (el.type === 'path') {
            const d = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
            return (
                <g key={el.id} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <path d={d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" opacity={el.opacity} />
                    {showUI && <foreignObject x={el.points[0].x - 15} y={el.points[0].y - 45} width={30} height={30} className="ui-ignore"><button onClick={() => deleteElement(el.id)} className="text-rose-500 bg-white border-2 border-rose-500 rounded p-1 shadow-md"><Trash2 size={14}/></button></foreignObject>}
                </g>
            );
        }

        if (el.type === 'line') {
            const g = elements.find(g => g.type === 'coord' && el.x >= g.x && el.x <= g.x + g.width);
            let equationText = "";
            if (g && el.showEquation) {
                const s = g.gridSize; const ox = g.isFirstQuadrant ? g.x : g.x + g.width/2; const oy = g.isFirstQuadrant ? g.y + g.height : g.y + g.height/2;
                const x1_v = (el.x-ox)/s*g.stepX, y1_v = (oy-el.y)/s*g.stepY, x2_v = (el.x2-ox)/s*g.stepX, y2_v = (oy-el.y2)/s*g.stepY;
                const m = (y2_v - y1_v) / (x2_v - x1_v || 0.001);
                const c = y1_v - m * x1_v;
                equationText = `y = ${m.toFixed(1)}x ${c >= 0 ? '+' : ''} ${c.toFixed(1)}`;
            }
            return (
                <g key={el.id} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={el.stroke} strokeWidth={el.strokeWidth} strokeLinecap="round" />
                    {el.showEquation && (
                        <g transform={`translate(${el.x2 + 15}, ${el.y2})`}>
                            <rect x="-5" y="-18" width="140" height="28" fill="white" fillOpacity="0.8" rx="4" />
                            <text fontSize="18" fontWeight="bold" fill={el.stroke} className="select-none">{equationText}</text>
                        </g>
                    )}
                    {showUI && renderHandles(el)}
                </g>
            );
        }

        if (el.type === 'triangle') {
            const pts = el.triangleType === 'right' ? `${el.x},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}` :
                        el.triangleType === 'isosceles' ? `${el.x+el.width/2},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height}` :
                        `${el.x+el.width/3},${el.y} ${el.x},${el.y+el.height} ${el.x+el.width},${el.y+el.height*0.8}`;
            return (
                <g key={el.id} transform={transform} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <polygon points={pts} fill="none" stroke="black" strokeWidth={el.strokeWidth} />
                    {showUI && renderHandles(el)}
                </g>
            );
        }

        if (el.type === 'coord') {
            const step = el.gridSize || 40; const ox = el.isFirstQuadrant ? el.x : el.x + el.width/2; const oy = el.isFirstQuadrant ? el.y + el.height : el.y + el.height/2;
            const lines = []; const labs = [];
            for (let i = -20; i <= 20; i++) {
                const xp = ox + i * step; const yp = oy - i * step;
                if (xp >= el.x && xp <= el.x + el.width) {
                    lines.push(<line key={`v-${i}`} x1={xp} y1={el.y} x2={xp} y2={el.y + el.height} stroke="#cbd5e1" strokeWidth="1" />);
                    if (el.showLabels && i !== 0) labs.push(<text key={`tx-${i}`} x={xp} y={oy + 25} textAnchor="middle" fontSize={el.fontSize} fontWeight="900" fill="black">{i * el.stepX}</text>);
                }
                if (yp >= el.y && yp <= el.y + el.height) {
                    lines.push(<line key={`h-${i}`} x1={el.x} y1={yp} x2={el.x + el.width} y2={yp} stroke="#cbd5e1" strokeWidth="1" />);
                    if (el.showLabels && i !== 0) labs.push(<text key={`ty-${i}`} x={ox - 10} y={yp + 5} textAnchor="end" fontSize={el.fontSize} fontWeight="900" fill="black">{i * el.stepY}</text>);
                }
            }
            return (
                <g key={el.id} transform={transform} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke="black" strokeWidth="1" />
                    {lines} <line x1={el.x} y1={oy} x2={el.x+el.width} y2={oy} stroke="black" strokeWidth="3" /><line x1={ox} y1={el.y} x2={ox} y2={el.y+el.height} stroke="black" strokeWidth="3" />
                    {labs} <text x={ox-10} y={oy+25} fontSize={el.fontSize} fontWeight="900" fill="black">0</text>
                    {showUI && renderHandles(el)}
                </g>
            );
        }

        // NODES, SPINNERS, FRACTION SHAPES
        const r = el.width/2; const cx = el.x + r; const cy = el.y + r;
        const fills = []; const borderLines = [];
        if (el.divisions) {
            for (let i = 0; i < el.divisions; i++) {
                if (el.type.includes('rect')) {
                    const sw = el.width / el.divisions;
                    fills.push(<rect key={`f-${i}`} x={el.x + (i * sw)} y={el.y} width={sw} height={el.height} fill={el.filledIndices?.includes(i) ? el.stroke : 'transparent'} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleFill(el.id, i); }} />);
                    if (i > 0) borderLines.push(<line key={`l-${i}`} x1={el.x + (i * sw)} y1={el.y} x2={el.x + (i * sw)} y2={el.y + el.height} stroke="black" strokeWidth="2" />);
                } else {
                    const a = 360/el.divisions; const sA = i*a, eA = (i+1)*a;
                    const x1 = cx + r*Math.cos(Math.PI*sA/180), y1 = cy + r*Math.sin(Math.PI*sA/180), x2 = cx + r*Math.cos(Math.PI*eA/180), y2 = cy + r*Math.sin(Math.PI*eA/180);
                    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
                    fills.push(<path key={`f-${i}`} d={d} fill={el.filledIndices?.includes(i) ? el.stroke : (el.type==='spinner'?'white':'transparent')} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleFill(el.id, i); }} />);
                    borderLines.push(<line key={`l-${i}`} x1={cx} y1={cy} x2={x1} y2={y1} stroke="black" strokeWidth="2" />);
                }
            }
        }

        return (
            <g key={el.id} transform={transform} onMouseEnter={() => setHoveredId(el.id)} onMouseLeave={() => setHoveredId(null)} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }} onDoubleClick={() => el.type === 'node' && setEditingId(el.id)}>
                {fills}
                {el.type.includes('rect') ? <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="none" stroke="black" strokeWidth={el.strokeWidth} /> : <circle cx={cx} cy={cy} r={r} fill="none" stroke="black" strokeWidth={el.strokeWidth} />}
                {borderLines}
                {el.type === 'spinner' && (
                    <g style={{ transform: `rotate(${el.arrowRotation}deg)`, transition: 'transform 3s cubic-bezier(0.1, 0, 0.1, 1)', transformOrigin: `${cx}px ${cy}px` }}>
                        <line x1={cx} y1={cy} x2={cx} y2={cy-r+15} stroke="black" strokeWidth="8" strokeLinecap="round" /><path d={`M ${cx-10} ${cy-r+25} L ${cx} ${cy-r+5} L ${cx+10} ${cy-r+25} Z`} fill="black" />
                    </g>
                )}
                {el.type === 'node' && editingId !== el.id && <text x={cx} y={cy+10} textAnchor="middle" className="text-2xl font-black fill-black pointer-events-none select-none">{el.label}</text>}
                {el.type === 'node' && editingId === el.id && (
                    <foreignObject x={cx - 30} y={cy - 15} width="60" height="30" className="ui-ignore"><input autoFocus className="w-full h-full text-center font-black bg-white/80 border-none outline-none" value={el.label} maxLength={3} onChange={e => setElements(prev => prev.map(n => n.id === el.id ? {...n, label: e.target.value} : n))} onBlur={() => { setEditingId(null); commitToHistory(elements); }} /></foreignObject>
                )}
                {el.showLabel && <text x={el.type.includes('rect') ? el.x + el.width/2 : cx} y={el.type.includes('rect') ? el.y-25 : cy-r-25} textAnchor="middle" className="text-3xl font-black fill-black select-none">{el.filledIndices.length}/{el.divisions}</text>}
                {showUI && renderHandles(el, r)}
            </g>
        );
    };

    const renderHandles = (el, radius = 0) => {
        const isC = ['circle', 'frac_circle', 'spinner', 'node'].includes(el.type);
        const cx = isC ? el.x + radius : el.x + el.width/2;
        const botY = isC ? el.y + radius*2 : el.y + el.height;
        const rigX = isC ? el.x + radius*2 : el.x + el.width;

        return (
            <g className="ui-ignore">
                <rect x={el.x-5} y={el.y-5} width={(isC ? radius*2 : el.width)+10} height={(isC ? radius*2 : el.height)+10} fill="none" stroke="#3b82f6" strokeDasharray="5" opacity="0.4" />
                <foreignObject x={el.x-35} y={el.y-35} width={30} height={30}><button onClick={()=>deleteElement(el.id)} className="text-rose-500 bg-white border-2 border-rose-500 rounded p-1 shadow-md"><Trash2 size={14}/></button></foreignObject>
                <circle cx={cx} cy={el.y-40} r={8} fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-alias" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating'); setIsDrawing(true);}} />
                <line x1={cx} y1={el.y} x2={cx} y2={el.y-40} stroke="#3b82f6" strokeDasharray="2" />
                <rect x={rigX-5} y={botY-5} width={10} height={10} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('resizing'); setIsDrawing(true);}} />
                
                <foreignObject x={el.type==='coord'?el.x:cx-120} y={botY+20} width={320} height={100}>
                    <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-xl border-2 border-emerald-500 p-2 pointer-events-auto text-[10px] font-black uppercase">
                        {el.type === 'triangle' && (<>
                            <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i,triangleType:'right'}:i))} className="px-2 bg-slate-100 rounded">Rät</button>
                            <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i,triangleType:'isosceles'}:i))} className="px-2 bg-slate-100 rounded">Liks</button>
                            <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i,triangleType:'scalene'}:i))} className="px-2 bg-slate-100 rounded">Olik</button>
                        </>)}
                        {el.type === 'line' && <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i,showEquation: !i.showEquation}:i))} className="px-2 py-1 bg-emerald-500 text-white rounded">Equation</button>}
                        {el.type === 'coord' && (<>
                            X:<input type="number" className="w-8 border-b" value={el.stepX} onChange={e => setElements(prev => prev.map(o => o.id === el.id ? {...o, stepX: e.target.value} : o))} />
                            Y:<input type="number" className="w-8 border-b" value={el.stepY} onChange={e => setElements(prev => prev.map(o => o.id === el.id ? {...o, stepY: e.target.value} : o))} />
                            <button onClick={() => setElements(prev => prev.map(o => o.id === el.id ? {...o, isFirstQuadrant: !o.isFirstQuadrant} : o))} className="px-1 bg-slate-100 rounded">1/4Q</button>
                        </>)}
                        {(el.divisions || el.type === 'spinner') && (<>
                            <button onClick={()=>updateDivisions(el.id, -1)} className="px-1 bg-slate-100 rounded shadow-sm text-sm font-bold"> - </button>
                            <span className="px-1">{el.divisions} Delar</span>
                            <button onClick={()=>updateDivisions(el.id, 1)} className="px-1 bg-slate-100 rounded shadow-sm text-sm font-bold"> + </button>
                            {el.type === 'spinner' && <button onClick={()=>spinSpinner(el.id)} className="bg-emerald-500 text-white rounded px-2 ml-1 shadow-sm"><Play size={10} fill="white" /></button>}
                            <button onClick={()=>setElements(prev=>prev.map(i=>i.id===el.id?{...i, showLabel: !i.showLabel}:i))} className="px-1 bg-slate-100 rounded"><Hash size={12}/></button>
                        </>)}
                    </div>
                </foreignObject>
            </g>
        );
    };

    return (
        <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden z-[100] font-sans">
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
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
            <div className="flex-1 relative flex overflow-hidden">
                <main className={`flex-1 relative ${bgType === 'blank' ? 'bg-white' : 'bg-slate-50'} overflow-hidden cursor-crosshair z-10`} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
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