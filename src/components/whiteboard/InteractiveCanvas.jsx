// src/components/whiteboard/InteractiveCanvas.jsx
import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import WhiteboardDrawer from './WhiteboardDrawer';
import { Trash2, Copy, Move } from 'lucide-react';
import 'mathlive';
import { getToolDefinition } from './tools/registry';
import AlgebraTileTool from './tools/manipulatives/AlgebraTileTool';

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

export default function InteractiveCanvas({ 
        lang = 'sv', 
        bgType, 
        onToggleBg, 
        elements = [], 
        setElements = () => {},
        isOverlay = false,
        onCustomClear = null,
        livePacket = [], 
        clueProgress = {}, 
        resolution = { w: 1920, h: 1080 },
        toolbarMode = 'all', 
        allowedTools = null, 
        readOnly = false,
        activeDrawer: controlledActiveDrawer, 
        onToggleDrawer: controlledOnToggleDrawer,
        showDividingLine = false,
        renderDrawer = true
    }) {
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

    const [internalDrawer, setInternalDrawer] = useState(null);
    const activeDrawer = controlledActiveDrawer !== undefined ? controlledActiveDrawer : internalDrawer;
    const handleToggleDrawer = controlledOnToggleDrawer || ((key) => {
        setInternalDrawer(prev => prev === key ? null : key);
    });

    const [activeTool, setActiveTool] = useState('select');
    const [color, setColor] = useState('#06b6d4');
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectionBox, setSelectionBox] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [interactionMode, setInteractionMode] = useState(null);

    // 🟢 When in overlay mode, pass clicks through to the slide unless an active drawing/erasing tool is in use
    const isDrawingTool = activeTool !== 'select';
    const shouldInterceptEvents = !isOverlay || isDrawingTool;
    const elementPointerClass = (!isOverlay || isDrawingTool || selectedIds.length > 0) ? 'pointer-events-auto' : 'pointer-events-none';

    const dragCoordRef = useRef({ x: 0, y: 0 });
    const selectionBoxRef = useRef(null);
    const svgRef = useRef(null);
    const activePathRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // 1. Single Master Timer & Clock Interval
    useEffect(() => {
        if (readOnly || typeof setElements !== 'function') return;
        const interval = setInterval(() => {
            setCurrentTime(new Date()); 
            setElements(prev => {
                if (!Array.isArray(prev) || !prev.some(el => el.type === 'timer' && el.isRunning)) return prev;
                return prev.map(el => {
                    if (el.type === 'timer' && el.isRunning) {
                        // Stopwatch mode: count upwards
                        if (el.timerMode === 'stopwatch') {
                            return { ...el, timeLeft: (el.timeLeft || 0) + 1 };
                        }
                        // Timer mode: count down to 0
                        if (el.timeLeft > 0) {
                            const nextTime = el.timeLeft - 1;
                            return { ...el, timeLeft: nextTime, isRunning: nextTime > 0 };
                        }
                    }
                    return el;
                });
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [readOnly, setElements]);

    // 2. Safe Auto-Spawn for Stamp / Interactive Tools
    // 2. Safe Auto-Spawn for Widget & Stamp Tools
    useEffect(() => {
        // Tools that must remain active strictly for drawing or typing modes:
        const drawingTools = [
            'select', 'pen', 'highlighter', 'eraser', 'line', 
            'rect', 'circle', 'triangle'
        ];

        if (drawingTools.includes(activeTool) || activeTool.startsWith('3d_')) {
            return;
        }

        // Instantly spawn widgets/tools upon selection, then reset tool to 'select'
        if (activeTool && activeTool !== 'select') {
            const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

            if (activeTool === 'timer') {
                setElements(prev => [...prev, {
                    id: newId, type: 'timer', x: 600, y: 250, width: 220, height: 140,
                    timeLeft: 300, initialTime: 300, isRunning: false, stroke: color, rotation: 0, opacity: 1
                }]);
                setSelectedIds([newId]);
                setActiveTool('select');
                return;
            }

            if (activeTool === 'realClock') {
                setElements(prev => [...prev, {
                    id: newId, type: 'realClock', x: 650, y: 250, width: 200, height: 200,
                    stroke: color, rotation: 0, opacity: 1, clockType: 'analog'
                }]);
                setSelectedIds([newId]);
                setActiveTool('select');
                return;
            }


            if (activeTool === 'calculator') {
                setElements(prev => [...prev, {
                    id: newId, type: 'calculator', x: 600, y: 180, width: 280, height: 480,
                    expression: "", result: "", ans: "", calcMode: "LTR", stroke: color, rotation: 0, opacity: 1
                }]);
                setSelectedIds([newId]);
                setActiveTool('select');
                return;
            }

            const registeredTool = getToolDefinition(activeTool);
            if (registeredTool && typeof registeredTool.createDefault === 'function') {
                const newEl = registeredTool.createDefault(newId, color, activeTool);
                setElements(prev => [...prev, newEl]);
                setSelectedIds([newId]);
                setActiveTool('select');
            }
        }
    }, [activeTool, color, setElements, lang]);

    const isElementInBox = (el, box) => {
        const minX = Math.min(box.startX, box.currentX);
        const maxX = Math.max(box.startX, box.currentX);
        const minY = Math.min(box.startY, box.currentY);
        const maxY = Math.max(box.startY, box.currentY);

        const elX = Number(el.x) || (el.points ? Math.min(...el.points.map(p => p.x)) : 0);
        const elY = Number(el.y) || (el.points ? Math.min(...el.points.map(p => p.y)) : 0);
        const elW = Number(el.width) || (el.isRotated ? el.height : 60);
        const elH = Number(el.height) || (el.isRotated ? el.width : 60);

        return (
            elX + elW >= minX &&
            elX <= maxX &&
            elY + elH >= minY &&
            elY <= maxY
        );
    };

    // 3. Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeTag = document.activeElement?.tagName;
            if (
                activeTag === 'INPUT' || 
                activeTag === 'TEXTAREA' || 
                document.activeElement?.isContentEditable ||
                e.target.closest('[contenteditable="true"]') ||
                e.target.closest('math-field')
            ) {
                return;
            }

            const isModifier = e.ctrlKey || e.metaKey;

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
                e.preventDefault();
                setElements(prev => prev.filter(el => !selectedIds.includes(el.id) || el.isPermanent));
                setSelectedIds([]);
                return;
            }

            if (isModifier && e.key.toLowerCase() === 'd' && selectedIds.length > 0) {
                e.preventDefault();
                const offset = 25;
                const newIds = [];
                const duplicatedElements = [];

                elements.forEach(el => {
                    if (!selectedIds.includes(el.id) || el.isPermanent) return;
                    const newId = `dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                    newIds.push(newId);

                    const cloned = {
                        ...JSON.parse(JSON.stringify(el)),
                        id: newId,
                        x: (Number(el.x) || 0) + offset,
                        y: (Number(el.y) || 0) + offset
                    };

                    if (cloned.type === 'line') {
                        cloned.x1 = (cloned.x1 ?? cloned.x) + offset;
                        cloned.y1 = (cloned.y1 ?? cloned.y) + offset;
                        cloned.x2 = (cloned.x2 || 0) + offset;
                        cloned.y2 = (cloned.y2 || 0) + offset;
                    }

                    if (cloned.type === 'path' && Array.isArray(cloned.points)) {
                        cloned.points = cloned.points.map(p => ({ x: p.x + offset, y: p.y + offset }));
                    }

                    duplicatedElements.push(cloned);
                });

                if (duplicatedElements.length > 0) {
                    setElements(prev => [...prev, ...duplicatedElements]);
                    setSelectedIds(newIds);
                }
                return;
            }

            if (isModifier && e.key.toLowerCase() === 'c' && selectedIds.length > 0) {
                const itemsToCopy = elements.filter(el => selectedIds.includes(el.id) && !el.isPermanent);
                if (itemsToCopy.length > 0) {
                    sessionStorage.setItem('canvasClipboard', JSON.stringify(itemsToCopy));
                }
                return;
            }

            if (isModifier && e.key.toLowerCase() === 'v') {
                const raw = sessionStorage.getItem('canvasClipboard');
                if (!raw) return;

                try {
                    const parsed = JSON.parse(raw);
                    const items = Array.isArray(parsed) ? parsed : [parsed];
                    const offset = 30;
                    const newIds = [];

                    const pastedElements = items.map(el => {
                        const newId = `paste_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                        newIds.push(newId);

                        const clone = {
                            ...el,
                            id: newId,
                            x: (Number(el.x) || 0) + offset,
                            y: (Number(el.y) || 0) + offset
                        };

                        if (clone.type === 'line') {
                            clone.x1 = (clone.x1 ?? clone.x) + offset;
                            clone.y1 = (clone.y1 ?? clone.y) + offset;
                            clone.x2 = (clone.x2 || 0) + offset;
                            clone.y2 = (clone.y2 || 0) + offset;
                        }

                        if (clone.type === 'path' && Array.isArray(clone.points)) {
                            clone.points = clone.points.map(p => ({ x: p.x + offset, y: p.y + offset }));
                        }
                        return clone;
                    });

                    sessionStorage.setItem('canvasClipboard', JSON.stringify(pastedElements));
                    setElements(prev => [...prev, ...pastedElements]);
                    setSelectedIds(newIds);
                } catch (err) {
                    console.error("Paste parse error:", err);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, elements, setElements]);

        useEffect(() => {
        if (isOverlay) return; // 🟢 Don't intercept global deselects when acting as a transparent slide overlay
            const handleGlobalDeselect = (e) => {
                const isInput = e.target.tagName?.toLowerCase() === 'input' || e.target.tagName?.toLowerCase() === 'textarea';
                if (e.target.closest('.ui-ignore') || e.target.closest('[contenteditable="true"]') || isInput) return;
                
                const targetNode = e.target.closest('[data-id]');
                if (targetNode) return;

                const hitElement = [...elements].reverse().find(el => isPointInElement(e.clientX, e.clientY, el));
                if (hitElement && editingId === hitElement.id) {
                    return;
                }

                if (activeTool === 'select' && !selectionBoxRef.current) {
                    setSelectedIds([]);
                    setEditingId(null);
                    setInteractionMode(null);
                    setIsDrawing(false);
                }
            };

        window.addEventListener('pointerdown', handleGlobalDeselect);
        return () => window.removeEventListener('pointerdown', handleGlobalDeselect);
    }, [activeTool, elements, editingId]);


    // 4. Fixed Drawer Tool Handler (Switches mode for tools, spawns objects for manipulatives)
    const handleSpawnFromDrawer = (type, payload = {}) => {
        // If it is a drawing/writing tool or mode, ACTIVATE IT in state and close the drawer
        const toolModes = ['pen', 'highlighter', 'eraser', 'line', 'select', 'richText', 'workMode'];
        if (toolModes.includes(type)) {
            setActiveTool(type);
            handleToggleDrawer(null);
            return;
        }

        const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        // 🟢 1. Timer Tool Spawn
        if (type === 'timer') {
            setElements(prev => [...prev, {
                id,
                type: 'timer',
                x: 600,
                y: 250,
                width: 220,
                height: 140,
                timeLeft: 300, // 5 minutes default
                initialTime: 300,
                isRunning: false,
                stroke: color,
                rotation: 0,
                opacity: 1
            }]);
            setSelectedIds([id]);
            return;
        }

        // 🟢 2. Real-Time Clock Tool Spawn
        if (type === 'realClock') {
            setElements(prev => [...prev, {
                id,
                type: 'realClock',
                x: 650,
                y: 250,
                width: 200,
                height: 200,
                stroke: color,
                rotation: 0,
                opacity: 1
            }]);
            setSelectedIds([id]);
            return;
        }

        if (type === 'calculator') {
            const newEl = {
                id,
                type: 'calculator',
                x: 600,
                y: 180,
                width: 280,
                height: 480,
                expression: "",
                result: "",
                ans: "",
                calcMode: "LTR",
                stroke: color,
                rotation: 0,
                opacity: 1
            };
            setElements(prev => [...prev, newEl]);
            setSelectedIds([id]);
            return;
        }

        if (type === 'algebra_tile') {
            const { kind, sign, side = 'VL' } = payload;
            const sideTiles = elements.filter(el => {
                if (el.type !== 'algebra_tile') return false;
                return side === 'HL' ? el.x >= 960 : el.x < 960;
            });
            const col = sideTiles.length % 5;
            const row = Math.floor(sideTiles.length / 5);
            const targetBaseX = side === 'HL' ? 1150 : 380;
            const spawnX = targetBaseX + col * 70;
            const spawnY = 280 + row * 70;

            const newTile = AlgebraTileTool.create(spawnX, spawnY, kind, sign);
            setElements(prev => [...prev, newTile]);
            return;
        }

        if (type.startsWith('3d_')) {
            const shapeName = type.replace('3d_', '');
            setElements(prev => [...prev, {
                id,
                type: 'shapes_3d',
                shape3D: shapeName,
                x: 650,
                y: 300,
                width: 220,
                height: 220,
                stroke: '#0284c7',
                strokeWidth: 3,
                fill: 'rgba(2, 132, 199, 0.08)',
                showInternal: true,
                rotation: 0,
                opacity: 1
            }]);
            return;
        }

        const registered = getToolDefinition(type);
            if (registered && typeof registered.createDefault === 'function') {
                setElements(prev => [...prev, registered.createDefault(id, color, type)]);
                return;
            }

        const isShape = ['rect', 'circle', 'triangle'].includes(type);
        setElements(prev => [...prev, {
            id,
            type,
            x: 600,
            y: 300,
            width: isShape ? 200 : 300,
            height: isShape ? 200 : 250,
            stroke: color,
            strokeWidth: 3,
            fill: isShape ? `${color}15` : 'none',
            rotation: 0,
            opacity: 1,
            ...(type === 'triangle' ? { triangleType: 'right' } : {})
        }]);
    };

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

        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;

        const screenCTM = svg.getScreenCTM();
        if (!screenCTM) return { x: 0, y: 0 };

        const svgP = pt.matrixTransform(screenCTM.inverse());
        let x = svgP.x;
        let y = svgP.y;

        if (shouldSnap && !['pen', 'highlighter', 'eraser', 'protractor', 'ruler', 'select'].includes(activeTool)) {
            x = Math.round(x / 20) * 20;
            y = Math.round(y / 20) * 20;
        }

        return { x, y };
    };

    const deleteElement = (id) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    };

    const duplicateElement = (id) => {
        setElements(prev => {
            const el = prev.find(e => e.id === id);
            if (!el) return prev;
            const newId = Date.now().toString();
            const newEl = { ...el, id: newId, x: (Number(el.x) || 0) + 25, y: (Number(el.y) || 0) + 25 };
            if (newEl.type === 'line') { newEl.x2 += 25; newEl.y2 += 25; }
            if (newEl.type === 'path' && newEl.points) { newEl.points = newEl.points.map(p => ({ x: p.x + 25, y: p.y + 25 })); }
            setSelectedIds([newId]);
            return [...prev, newEl];
        });
    };
    
    const isStrokeIntersecting = (point, element, eraserRadius = 20) => {
        if (element.type === 'path' && element.points?.length) {
            return element.points.some(p => {
                const dx = point.x - p.x;
                const dy = point.y - p.y;
                return Math.sqrt(dx * dx + dy * dy) <= (eraserRadius + (element.strokeWidth || 4) / 2);
            });
        }

        if (element.type === 'line' && !element.isPermanent) {
            const { x1, y1, x2, y2 } = element;
            const A = point.x - x1;
            const B = point.y - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = -1;
            if (lenSq !== 0) param = dot / lenSq;

            let xx, yy;
            if (param < 0) { xx = x1; yy = y1; }
            else if (param > 1) { xx = x2; yy = y2; }
            else { xx = x1 + param * C; yy = y1 + param * D; }

            const dx = point.x - xx;
            const dy = point.y - yy;
            return Math.sqrt(dx * dx + dy * dy) <= (eraserRadius + (element.strokeWidth || 4) / 2);
        }
        return false;
    };

    const isPointInElement = (x, y, el) => {
        const padding = 16;

        if (el.type === 'path' && el.points?.length > 0) {
            return el.points.some(p => Math.abs(x - p.x) < (padding + 8) && Math.abs(y - p.y) < (padding + 8));
        }

        const w = Number(el.width) || 0;
        const h = Number(el.height) || 0;
        const r = w / 2;

        const bounds = [
            'rect', 'coord', 't_chart', 'tchart', 'triangle', 
            'ruler', 'shapes_3d', 'math', 'richText', 'calculator', 
            'dynamicClues', 'volume_cue', 'polygon',
            'algebra_tile', 'frac_rect', 'angle_arc'];
        if (bounds.some(b => el.type.includes(b))) {
            return (
                x >= el.x - padding && 
                x <= el.x + w + padding && 
                y >= el.y - padding && 
                y <= el.y + h + padding
            );
        }

        if (el.type.includes('circle') || ['spinner', 'node', 'protractor', 'clock', 'timer', 'realClock'].includes(el.type)) {
            return Math.sqrt((x - (el.x + r)) ** 2 + (y - (el.y + r)) ** 2) <= (r + padding); 
        }

        if (el.type === 'line') {
            const x1 = el.x1 ?? el.x;
            const y1 = el.y1 ?? el.y;
            const dist = Math.abs((el.y2 - y1) * x - (el.x2 - x1) * y + el.x2 * y1 - el.y2 * x1) / 
                         Math.sqrt((el.y2 - y1) ** 2 + (el.x2 - x1) ** 2);
            return dist < (padding + 8); 
        }

        return false;
    };

    const handlePointerDown = (e) => {
        if (e.cancelable && activeTool !== 'select') e.preventDefault();
        
        const isInput = e.target.tagName?.toLowerCase() === 'input' || e.target.tagName?.toLowerCase() === 'textarea';
        if (
            e.target.closest('.ui-ignore') || 
            e.target.closest('[contenteditable="true"]') || 
            e.target.closest('.interactive-slice') || 
            e.target.closest('.dice-die') ||
            isInput) return;
        
        if (svgRef.current && typeof svgRef.current.setPointerCapture === 'function') {
            try { svgRef.current.setPointerCapture(e.pointerId); } catch (err) {}
        }
        if (e.pointerType === 'pen' && activeTool === 'select') setActiveTool('pen');

        const { x, y } = getCoordinates(e, false);
        dragCoordRef.current = { x, y };

        // 🟢 If clicking directly on a clickable slice or tool action, let the tool handle it
        if (e.target.closest('.interactive-slice') || e.target.closest('.ui-ignore')) {
            return;
        }

        const targetNode = e.target.closest('[data-id]');
        const hitId = targetNode ? targetNode.getAttribute('data-id') : null;
        let hit = hitId ? elements.find(el => el.id === hitId) : null;
        if (!hit) hit = [...elements].reverse().find(el => isPointInElement(x, y, el));

        if (activeTool === 'select') {
            if (hit) {
                if (hit.type === 'richText' && editingId === hit.id) {
                    return;
                }
                if (hit.type === 'richText') {
                    setSelectedIds([hit.id]);
                    return;
                }
                if (e.shiftKey) {
                    setSelectedIds(prev => prev.includes(hit.id) ? prev.filter(id => id !== hit.id) : [...prev, hit.id]);
                } else if (!selectedIds.includes(hit.id)) {
                    setSelectedIds([hit.id]);
                }
                
                setInteractionMode('moving');
                setIsDrawing(true);
            } else {
                if (!e.shiftKey) setSelectedIds([]);
                const initialBox = { startX: x, startY: y, currentX: x, currentY: y };
                selectionBoxRef.current = initialBox;
                setSelectionBox(initialBox);
                setInteractionMode('box-selecting');
                setIsDrawing(true);
            }
            return;
        }

        if (activeTool === 'eraser') {
            setIsDrawing(true);
            setInteractionMode('erasing');
            setElements(prev => prev.filter(el => !isStrokeIntersecting({ x, y }, el, 20)));
            return;
        }

        const dragDrawTools = ['pen', 'highlighter', 'line', 'rect', 'circle', 'triangle', '3d_'];
        if (!dragDrawTools.some(t => activeTool.startsWith(t))) {
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
        } else if (activeTool === 'line') { 
            newEl.x2 = snap.x; 
            newEl.y2 = snap.y; 
        } else if (activeTool === 'triangle') { 
            newEl.triangleType = 'right'; 
        } else if (activeTool.startsWith('3d_')) { 
            newEl.type = 'shapes_3d'; 
            newEl.shape3D = activeTool.replace('3d_', ''); 
            newEl.showInternal = true;
            newEl.stroke = color;
            newEl.strokeWidth = 3;
            newEl.fill = 'none';
        }
        
        setElements(prev => [...prev, newEl]); 
        setSelectedIds([newId]);
    };

    const handlePointerMove = (e) => {
        if (!isDrawing) return;
        const raw = getCoordinates(e, false);

        if (interactionMode === 'erasing' && activeTool === 'eraser') {
            setElements(prev => prev.filter(el => !isStrokeIntersecting(raw, el, 20)));
            return;
        }

        if (interactionMode === 'box-selecting' && selectionBoxRef.current) {
            const updatedBox = { ...selectionBoxRef.current, currentX: raw.x, currentY: raw.y };
            selectionBoxRef.current = updatedBox;
            setSelectionBox(updatedBox);
            return;
        }

        if (interactionMode === 'moving' && selectedIds.length > 0) {
            const dx = raw.x - dragCoordRef.current.x;
            const dy = raw.y - dragCoordRef.current.y;
            dragCoordRef.current = { x: raw.x, y: raw.y };

            setElements(prev => prev.map(el => {
                if (!selectedIds.includes(el.id) || el.isPermanent) return el;

                const nextEl = {
                    ...el,
                    x: (Number(el.x) || 0) + dx,
                    y: (Number(el.y) || 0) + dy
                };

                if (el.type === 'line') {
                    nextEl.x1 = (nextEl.x1 ?? nextEl.x) + dx;
                    nextEl.y1 = (nextEl.y1 ?? nextEl.y) + dy;
                    nextEl.x2 = (nextEl.x2 || 0) + dx;
                    nextEl.y2 = (nextEl.y2 || 0) + dy;
                }

                if (el.type === 'path' && Array.isArray(el.points)) {
                    nextEl.points = el.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                }

                return nextEl;
            }));
            return;
        }

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
            const el = updated.find(item => selectedIds.includes(item.id));
            if (!el) return prev;

            if (interactionMode === 'rotating') {
                const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
                el.rotation = Math.atan2(raw.y - cy, raw.x - cx) * (180 / Math.PI) + 90;
            } else if (interactionMode === 'resizing') {
                el.width = Math.max(50, raw.x - el.x);
                el.height = (el.shape3D === 'cube') ? el.width : Math.max(50, raw.y - el.y);
            } else if (interactionMode === 'drawing') {
                const { x, y } = getCoordinates(e, true);
                if (el.type === 'line') { el.x2 = x; el.y2 = y; }
                else {
                    el.x = Math.min(x, el.startX); el.y = Math.min(y, el.startY);
                    el.width = Math.abs(x - el.startX); el.height = Math.abs(y - el.startY);
                    if (el.shape3D === 'cube') el.height = el.width;
                }
            } 
            return updated;
        });
    };

    const handlePointerUp = (e) => {
        if (svgRef.current && e?.pointerId && typeof svgRef.current.releasePointerCapture === 'function') {
            try { svgRef.current.releasePointerCapture(e.pointerId); } catch (err) {}
        }
        if (!isDrawing) return;

        // 🟢 Reset states unconditionally on mouse up
        setIsDrawing(false); 
        setInteractionMode(null);
        selectionBoxRef.current = null;
        setSelectionBox(null);

        if (interactionMode === 'box-selecting' && selectionBoxRef.current) {
            const box = selectionBoxRef.current;
            const minW = Math.abs(box.currentX - box.startX);
            const minH = Math.abs(box.currentY - box.startY);

            if (minW > 4 || minH > 4) {
                const found = elements.filter(el => !el.isPermanent && isElementInBox(el, box));
                setSelectedIds(found.map(el => el.id));
            }
            selectionBoxRef.current = null;
            setSelectionBox(null);
        }

        if (interactionMode === 'moving' && selectedIds.length > 0) {
            setElements(prev => {
                let workingSet = [...prev];
                selectedIds.forEach(id => {
                    const target = workingSet.find(item => item.id === id);
                    if (target?.type === 'algebra_tile') {
                        const toolDef = getToolDefinition(target.type);
                        if (toolDef && typeof toolDef.snapToNearest === 'function') {
                            const snapped = toolDef.snapToNearest(target, workingSet, 35);
                            workingSet = workingSet.map(item => item.id === id ? { ...item, ...snapped } : item);
                        }
                    }
                });
                return workingSet;
            });
        }

        setIsDrawing(false); 
        setInteractionMode(null);

        if ((activeTool === 'pen' || activeTool === 'highlighter') && activePathRef.current) {
            const finalPath = activePathRef.current; 
            if (finalPath.points.length > 2) {
                setElements(prev => [...prev, finalPath]); 
            }
            activePathRef.current = null; 
        }
    };

    useEffect(() => {
        if (!isDrawing) return;

        const onMove = (e) => handlePointerMove(e);
        const onUp = (e) => handlePointerUp(e);

        window.addEventListener('pointermove', onMove, { passive: false });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
        };
    }, [isDrawing, interactionMode, selectedIds, activeTool]);

    const renderHandles = (el, radius = 0, options = {}) => {
        const { canRotate = true } = typeof radius === 'object' ? radius : options;
        const actualRadius = typeof radius === 'number' ? radius : 0;

        const isC = ['circle', 'frac_circle', 'spinner', 'node', 'clock', 'timer', 'realClock'].includes(el.type);
        const isP = el.type === 'protractor';
        const objHeight = isP ? actualRadius : (isC ? actualRadius * 2 : (Number(el.height) || 200));
        const objWidth = isC || isP ? actualRadius * 2 : (Number(el.width) || 200);
        
        const padding = 16;
        const topY = el.y - 56;
        const botY = el.y + objHeight + 14;
        const cx = (isC || isP) ? el.x + actualRadius : el.x + objWidth / 2;
        const rigX = (isC || isP) ? el.x + actualRadius * 2 : el.x + objWidth;

        const Tool = getToolDefinition(el.type);
        const hasCustomContextMenu = Tool && typeof Tool.renderContextMenu === 'function';

        return (
            <g className="ui-ignore pointer-events-auto">

                {/* 2. Visual Selection Outline */}
                <rect 
                    x={el.x - 4} 
                    y={el.y - 4} 
                    width={objWidth + 8} 
                    height={objHeight + 8} 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="1.5" 
                    strokeDasharray="5 4" 
                    opacity="0.6" 
                    className="pointer-events-none" 
                />
                
                {/* 3. Top-Left System Actions (Move, Copy, Delete) */}
                <foreignObject x={el.x} y={topY - 10} width={260} height={70} className="overflow-visible pointer-events-auto">
                    <div className="flex gap-2 items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border-2 border-slate-200 shadow-xl w-max">
                        <button 
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                setSelectedIds([el.id]);
                                setInteractionMode('moving');
                                setIsDrawing(true);
                                const { x, y } = getCoordinates(e, false);
                                dragCoordRef.current = { x, y };
                            }}
                            className="!bg-white !text-slate-700 border border-slate-200 rounded-xl shadow-xs w-11 h-11 flex items-center justify-center hover:!bg-slate-50 hover:!text-indigo-600 cursor-move pointer-events-auto transition-colors" 
                            title={lang === 'sv' ? 'Flytta' : 'Move'}
                        >
                            <Move size={20} />
                        </button>
                        <button 
                            onClick={() => duplicateElement(el.id)} 
                            className="!bg-white !text-slate-700 border border-slate-200 rounded-xl shadow-xs w-11 h-11 flex items-center justify-center hover:!bg-slate-50 hover:!text-indigo-600 cursor-pointer pointer-events-auto" 
                            title={lang === 'sv' ? 'Kopiera' : 'Copy'}
                        >
                            <Copy size={20}/>
                        </button>
                        <button 
                            onClick={() => deleteElement(el.id)} 
                            className="!bg-white !text-rose-500 border border-rose-200 rounded-xl shadow-xs w-11 h-11 flex items-center justify-center hover:!bg-rose-50 cursor-pointer pointer-events-auto" 
                            title={lang === 'sv' ? 'Ta bort' : 'Delete'}
                        >
                            <Trash2 size={20}/>
                        </button>
                    </div>
                </foreignObject>

                {/* 4. Bottom Context Menu */}
                {hasCustomContextMenu && (
                    <foreignObject x={el.x} y={botY + 6} width={1200} height={100} className="overflow-visible pointer-events-auto">
                        <div 
                            onPointerDown={(e) => e.stopPropagation()} 
                            className="flex items-center gap-4 !bg-white !text-slate-900 px-5 py-3 rounded-2xl border-2 border-slate-200/90 shadow-2xl pointer-events-auto text-3xl font-bold font-sans w-max select-none"
                            style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                        >
                            {Tool.renderContextMenu({
                                el,
                                setElements,
                                lang,
                                t,
                                setEditingId,
                                onUpdate: (updated) => setElements(prev => prev.map(item => item.id === el.id ? updated : item))
                            })}
                        </div>
                    </foreignObject>
                )}

                {/* 5. Adjustment Handles */}
                {/* 🟢 Rotation handle renders only if canRotate is true */}
                {canRotate && el.type !== 'volume_cue' && (
                    <circle cx={cx} cy={el.y - 14} r={8} fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-alias" onPointerDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating'); setIsDrawing(true);}} />
                )}
                
                {/* 🟢 Resize Handle (Bottom-Right) remains active */}
                <rect 
                    x={rigX - 9} 
                    y={el.y + objHeight - 9} 
                    width={18} 
                    height={18} 
                    rx={4} 
                    fill="white" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    className="cursor-nwse-resize" 
                    onPointerDown={(e)=>{e.stopPropagation(); setInteractionMode('resizing'); setIsDrawing(true);}} 
                />
            </g>
        );
    };

    const renderElement = (el) => {
        const isSelected = selectedIds.includes(el.id);
        const showUI = isSelected || hoveredId === el.id;
        const transform = `rotate(${el.rotation || 0}, ${el.x + (el.width || 0)/2}, ${el.y + (el.height || 0)/2})`;
        
        const Tool = getToolDefinition(el.type);
        if (Tool && typeof Tool.render === 'function') {
            const options = {
                el,
                lang,
                t,
                color,
                currentTime,
                livePacket,
                MathDisplay,
                transform,
                isSelected,
                showUI,
                renderHandles,
                setElements,
                setSelectedId: (id) => setSelectedIds(id ? [id] : []),
                setInteractionMode,
                setIsDrawing,
                isDrawing,
                getCoordinates,
                editingId,              
                setEditingId,
                setDragOffset: (pos) => { dragCoordRef.current = pos; },
                onUpdate: (updated) => setElements(prev => prev.map(item => item.id === el.id ? updated : item))
            };

            let renderedContent = null;
            try {
                renderedContent = Tool.render(el, options);
            } catch (e) {
                renderedContent = Tool.render(options);
            }

            return (
                <g key={el.id} data-id={el.id} className={elementPointerClass}>
                    {renderedContent}
                </g>
            );
        }

        // 🟢 Dedicated Angle Geometry Stamped Object
        if (el.type === 'angle_arc') {
            const rad = el.radius || 50;
            const aRad = ((el.angle || 45) * Math.PI) / 180;
            const arcEndX = el.x + rad * Math.cos(-aRad);
            const arcEndY = el.y + rad * Math.sin(-aRad);
            const midAngle = -aRad / 2;
            const labelDist = rad + 24;
            const labelX = el.x + labelDist * Math.cos(midAngle);
            const labelY = el.y + labelDist * Math.sin(midAngle);

            return (
                <g key={el.id} data-id={el.id} className="pointer-events-auto cursor-move">
                    {/* Base Ray */}
                    <line x1={el.x} y1={el.y} x2={el.x + el.rayLength} y2={el.y} stroke={el.stroke || '#0f172a'} strokeWidth={3.5} strokeLinecap="round" />
                    {/* Angled Ray */}
                    <line x1={el.x} y1={el.y} x2={el.x + el.rayLength * Math.cos(-aRad)} y2={el.y + el.rayLength * Math.sin(-aRad)} stroke={el.stroke || '#0f172a'} strokeWidth={3.5} strokeLinecap="round" />
                    {/* Vertex Dot */}
                    <circle cx={el.x} cy={el.y} r={4.5} fill={el.stroke || '#0f172a'} />
                    {/* Angle Arc Indicator */}
                    <path d={`M ${el.x + rad} ${el.y} A ${rad} ${rad} 0 0 0 ${arcEndX} ${arcEndY}`} fill="none" stroke={el.arcColor || '#3b82f6'} strokeWidth={2.5} />
                    {/* Angle Label Pill */}
                    <g transform={`translate(${labelX}, ${labelY})`}>
                        <rect x={-20} y={-14} width={40} height={28} rx={10} fill="#ffffff" stroke="#cbd5e1" strokeWidth={1.5} filter="drop-shadow(0 2px 6px rgba(0,0,0,0.08))" />
                        <text x={0} y={1} textAnchor="middle" dominantBaseline="central" fontSize={el.label === 'x' ? 16 : 13} fontWeight="900" fill={el.label === 'x' ? '#6366f1' : '#0f172a'} fontStyle={el.label === 'x' ? 'italic' : 'normal'} fontFamily="system-ui, sans-serif">
                            {el.label}
                        </text>
                    </g>
                    {showUI && !el.isPermanent && renderHandles(el)}
                </g>
            );
        }

        if (el.type === 'path') {
            const d = getSmoothPathData(el.points);
            return <path key={el.id} data-id={el.id} d={d} stroke={el.stroke} strokeWidth={el.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={el.opacity} className={`${elementPointerClass} cursor-move`} />;
        }

        if (el.type === 'line') {
            return (
                <g key={el.id} data-id={el.id} className={`${elementPointerClass} cursor-move`}>
                    <line 
                        x1={el.x1 ?? el.x} 
                        y1={el.y1 ?? el.y} 
                        x2={el.x2} 
                        y2={el.y2} 
                        stroke={el.stroke || '#94a3b8'} 
                        strokeWidth={el.strokeWidth || 4} 
                        strokeDasharray={el.strokeDasharray || undefined}
                        strokeLinecap="round" 
                    />
                    {isSelected && !el.isPermanent && (
                        <g className="ui-ignore">
                            <circle cx={el.x1 ?? el.x} cy={el.y1 ?? el.y} r={10} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-crosshair pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('move-start'); setIsDrawing(true); }} />
                            <circle cx={el.x2} cy={el.y2} r={10} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-crosshair pointer-events-auto" onPointerDown={(e) => { e.stopPropagation(); setInteractionMode('move-end'); setIsDrawing(true); }} />
                        </g>
                    )}
                    {showUI && !el.isPermanent && renderHandles(el)}
                </g>
            );
        }

        return null;
    };

    return (
        <div className="relative w-full h-full overflow-hidden pointer-events-none">
            <svg 
                ref={svgRef}
                viewBox={`0 0 ${resolution.w} ${resolution.h}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ touchAction: 'none' }}
                className={`absolute inset-0 w-full h-full z-10 ${
                    shouldInterceptEvents ? 'pointer-events-auto' : 'pointer-events-none'
                } ${
                    readOnly ? 'cursor-default' :
                    activeTool === 'eraser' ? 'cursor-cell' :
                    activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'
                }`}
                onPointerDown={readOnly || !shouldInterceptEvents ? undefined : handlePointerDown}
            >
                {Array.isArray(elements) && elements.map(renderElement)}

                {selectionBox && (
                    <rect
                        x={Math.min(selectionBox.startX, selectionBox.currentX)}
                        y={Math.min(selectionBox.startY, selectionBox.currentY)}
                        width={Math.abs(selectionBox.currentX - selectionBox.startX)}
                        height={Math.abs(selectionBox.currentY - selectionBox.startY)}
                        fill="#6366f1"
                        fillOpacity="0.18"
                        stroke="#4f46e5"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="pointer-events-none"
                    />
                )}

                {isDrawing && activePathRef.current && (
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
            
            {/* Unified Toolbar (Only actual buttons intercept clicks, not empty margins) */}
            {toolbarMode !== 'none' && !readOnly && (
                <div className="pointer-events-none [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_.ui-ignore]:pointer-events-auto">
                    <Toolbar 
                        lang={lang} 
                        activeTool={activeTool} 
                        setActiveTool={setActiveTool} 
                        color={color} 
                        setColor={setColor} 
                        onClear={() => onCustomClear ? onCustomClear() : setElements([])} 
                        canUndo={false} 
                        canRedo={false} 
                        bgType={bgType} 
                        onToggleBg={onToggleBg} 
                        mode={toolbarMode}
                        allowedTools={allowedTools}
                        activeDrawer={activeDrawer}
                        onToggleDrawer={handleToggleDrawer}
                    />
                </div>
            )}

            {/* Whiteboard Drawer */}
            {!readOnly && renderDrawer && (
                <div className="pointer-events-none [&>*]:pointer-events-auto">
                    <WhiteboardDrawer
                        activeDrawer={activeDrawer}
                        onClose={() => handleToggleDrawer(null)}
                        onSpawn={handleSpawnFromDrawer}
                        lang={lang}
                        showDividingLine={showDividingLine}
                    />
                </div>
            )}
        </div>
    );
}