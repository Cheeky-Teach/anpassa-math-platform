// src/components/whiteboard/InteractiveCanvas.jsx
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Toolbar from './Toolbar';
import WhiteboardDrawer from './WhiteboardDrawer';
import { Trash2, Copy, Move, Download } from 'lucide-react';
import 'mathlive';
import { getToolDefinition } from './tools/registry';
import { downloadSvgAsImage, downloadElementAsImage } from './utils/exportSVG';


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
                ], 
                throwOnError: false, 
                trust: true
            });
        }
    }, [content]);
    return <div ref={containerRef} className={`math-content leading-relaxed whitespace-pre-wrap text-inherit ${className}`} />;
};

function InteractiveCanvas({ 
    lang = 'sv', 
    bgType: controlledBgType, 
    onToggleBg: controlledOnToggleBg,
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
}, ref) {
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

    const [internalBgType, setInternalBgType] = useState('blank');
    const bgType = controlledBgType !== undefined ? controlledBgType : internalBgType;
    const onToggleBg = controlledOnToggleBg || (() => {
        setInternalBgType(prev => prev === 'blank' ? 'grid' : 'blank');
    });

    const isDrawingTool = activeTool !== 'select';
    const shouldInterceptEvents = !isOverlay || isDrawingTool;
    const elementPointerClass = (!isOverlay || isDrawingTool || selectedIds.length > 0) ? 'pointer-events-auto' : 'pointer-events-none';

    const dragCoordRef = useRef({ x: 0, y: 0 });
    const selectionBoxRef = useRef(null);
    const svgRef = useRef(null);
    const activePathRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const interactionModeRef = useRef(null);

     // Expose the SVG element to parent components
    useImperativeHandle(ref, () => ({
        getSvg: () => svgRef.current
    }));

    // 1. Master Timer & Clock Interval
    useEffect(() => {
        if (readOnly || typeof setElements !== 'function') return;
        const interval = setInterval(() => {
            setCurrentTime(new Date()); 
            setElements(prev => {
                if (!Array.isArray(prev) || !prev.some(el => el.type === 'timer' && el.isRunning)) return prev;
                return prev.map(el => {
                    if (el.type === 'timer' && el.isRunning) {
                        if (el.timerMode === 'stopwatch') {
                            return { ...el, timeLeft: (el.timeLeft || 0) + 1 };
                        }
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


    const isElementInBox = (el, box) => {
        if (!el || !box) return false;

        const boxLeft = Math.min(box.startX, box.currentX);
        const boxRight = Math.max(box.startX, box.currentX);
        const boxTop = Math.min(box.startY, box.currentY);
        const boxBottom = Math.max(box.startY, box.currentY);

        // 1. Freehand paths
        if (el.type === 'path' && Array.isArray(el.points) && el.points.length > 0) {
            return el.points.some(p => p.x >= boxLeft && p.x <= boxRight && p.y >= boxTop && p.y <= boxBottom);
        }

        // 2. Lines
        if (el.type === 'line') {
            const x1 = el.x1 ?? el.x ?? 0;
            const y1 = el.y1 ?? el.y ?? 0;
            const x2 = el.x2 ?? 0;
            const y2 = el.y2 ?? 0;
            const lineMinX = Math.min(x1, x2);
            const lineMaxX = Math.max(x1, x2);
            const lineMinY = Math.min(y1, y2);
            const lineMaxY = Math.max(y1, y2);
            return !(lineMaxX < boxLeft || lineMinX > boxRight || lineMaxY < boxTop || lineMinY > boxBottom);
        }

        // 3. All dimensional objects (counters, shapes, tiles, widgets)
        const elX = Number(el.x) || 0;
        const elY = Number(el.y) || 0;
        
        // Integer counter fallback is 64x64; general fallback is 60x60
        const defaultDim = el.type === 'integer_counter' ? 64 : 60;
        const elW = Number(el.width) || (el.isRotated ? Number(el.height) || defaultDim : defaultDim);
        const elH = Number(el.height) || (el.isRotated ? Number(el.width) || defaultDim : defaultDim);

        const elLeft = elX;
        const elRight = elX + elW;
        const elTop = elY;
        const elBottom = elY + elH;

        // AABB Collision Detection (Axis-Aligned Bounding Box)
        const intersects = !(
            elRight < boxLeft ||
            elLeft > boxRight ||
            elBottom < boxTop ||
            elTop > boxBottom
        );

        return intersects;
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
        if (isOverlay) return;
        const handleGlobalDeselect = (e) => {
            const isInput = e.target.tagName?.toLowerCase() === 'input' || e.target.tagName?.toLowerCase() === 'textarea';
            if (
                e.target.closest('.ui-ignore') || 
                e.target.closest('[data-whiteboard-interactive="true"]') ||
                e.target.closest('[data-interactive="true"]') ||
                e.target.closest('[contenteditable="true"]') || 
                isInput
            ) return;
            
            // 🟢 If clicking inside the whiteboard SVG canvas, let handlePointerDown / handlePointerUp 
            // handle selection and box-selection! Do NOT reset here!
            if (svgRef.current && svgRef.current.contains(e.target)) {
                return;
            }

            const targetNode = e.target.closest('[data-id]');
            if (targetNode) return;

            if (activeTool === 'select' && !selectionBoxRef.current) {
                setSelectedIds([]);
                setEditingId(null);
                setInteractionMode(null);
                setIsDrawing(false);
            }
        };

        window.addEventListener('pointerdown', handleGlobalDeselect);
        return () => window.removeEventListener('pointerdown', handleGlobalDeselect);
    }, [activeTool, elements, editingId, isOverlay]);

    // 4. Decoupled Drawer Tool Spawner
    const handleSpawnFromDrawer = (type, payload = {}) => {
        // Non-element canvas mode switches (pen, eraser, etc.)
        const toolModes = ['pen', 'highlighter', 'eraser', 'line', 'select'];
        if (toolModes.includes(type)) {
            setActiveTool(type);
            handleToggleDrawer(null);
            return;
        }

        const toolDef = getToolDefinition(type);
        if (!toolDef || typeof toolDef.createDefault !== 'function') return;

        const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Transparent pass-through: Canvas does not know or care what tool or payload this is
        const newElement = toolDef.createDefault(id, color, { type, ...payload });
        
        setElements(prev => {
            // Pass the live elements list so the spawner knows how many tiles already exist
            const newElement = toolDef.createDefault(id, color, { 
                type, 
                ...payload, 
                existingElements: prev 
            });
            return [...prev, newElement];
        });

        setSelectedIds([id]);
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
        if (!el) return false;
        const padding = 16;

        // 1. Freehand Path Hit-Test
        if (el.type === 'path' && Array.isArray(el.points) && el.points.length > 0) {
            return el.points.some(p => Math.abs(x - p.x) < (padding + 8) && Math.abs(y - p.y) < (padding + 8));
        }

        // 2. Line Hit-Test
        if (el.type === 'line') {
            const x1 = el.x1 ?? el.x ?? 0;
            const y1 = el.y1 ?? el.y ?? 0;
            const x2 = el.x2 ?? 0;
            const y2 = el.y2 ?? 0;
            const dist = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / 
                         (Math.hypot(x2 - x1, y2 - y1) || 1);
            return dist < (padding + 8);
        }

        const w = Number(el.width) || 64;
        const h = Number(el.height) || 64;
        const r = w / 2;

        // 3. Radial Hit-Test for circular tools
        const isCircular = el.type === 'circle' || el.type === 'spinner' || el.type === 'frac_circle';
        if (isCircular) {
            return Math.hypot(x - (el.x + r), y - (el.y + r)) <= (r + padding);
        }

        // 4. Universal Bounding Box (Agnostic fallback for all dimensional tools)
        return (
            x >= el.x - padding &&
            x <= el.x + w + padding &&
            y >= el.y - padding &&
            y <= el.y + h + padding
        );
    };

    const handlePointerDown = (e) => {
        if (e.cancelable && activeTool !== 'select') e.preventDefault();
        
        const isInput = e.target.tagName?.toLowerCase() === 'input' || e.target.tagName?.toLowerCase() === 'textarea';
        
        // 🟢 UNIVERSAL INTERACTIVE GUARD: Let children handle their own clicks/state
        if (
            e.target.closest('.ui-ignore') || 
            e.target.closest('[data-whiteboard-interactive="true"]') ||
            e.target.closest('[data-interactive="true"]') ||
            e.target.closest('.interactive-slice') ||
            e.target.closest('.dice-die') ||
            e.target.closest('[contenteditable="true"]') || 
            isInput
        ) {
            return;
        }
        
        if (svgRef.current && typeof svgRef.current.setPointerCapture === 'function') {
            try { svgRef.current.setPointerCapture(e.pointerId); } catch (err) {}
        }
        if (e.pointerType === 'pen' && activeTool === 'select') setActiveTool('pen');

        const { x, y } = getCoordinates(e, false);
        dragCoordRef.current = { x, y };

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
                
                interactionModeRef.current = 'moving';
                setInteractionMode('moving');
                setIsDrawing(true);
            } else {
                // Clicked empty canvas: clear selection unless holding shift
                if (!e.shiftKey) setSelectedIds([]);
                
                const initialBox = { startX: x, startY: y, currentX: x, currentY: y };
                selectionBoxRef.current = initialBox;
                setSelectionBox(initialBox);
                
                interactionModeRef.current = 'box-selecting';
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
        const currentMode = interactionModeRef.current || interactionMode;

        if (currentMode === 'erasing' && activeTool === 'eraser') {
            setElements(prev => prev.filter(el => !isStrokeIntersecting(raw, el, 20)));
            return;
        }

        // 🟢 Box-Selecting: update marquee coordinates immediately
        if (currentMode === 'box-selecting' && selectionBoxRef.current) {
            const updatedBox = { ...selectionBoxRef.current, currentX: raw.x, currentY: raw.y };
            selectionBoxRef.current = updatedBox;
            setSelectionBox(updatedBox);
            return;
        }

        if (currentMode === 'moving' && selectedIds.length > 0) {
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

        const currentMode = interactionModeRef.current || interactionMode;
        const rawCoords = e ? getCoordinates(e, false) : null;

        setIsDrawing(false);
        interactionModeRef.current = null;
        setInteractionMode(null);

        // 🟢 Box-Selecting Finalization
        if (currentMode === 'box-selecting' && selectionBoxRef.current) {
            const rawBox = selectionBoxRef.current;
            // Use current mouse release position if available for accurate boundary
            const box = rawCoords 
                ? { ...rawBox, currentX: rawCoords.x, currentY: rawCoords.y }
                : rawBox;

            const minW = Math.abs(box.currentX - box.startX);
            const minH = Math.abs(box.currentY - box.startY);

            if (minW > 4 || minH > 4) {
                // Read from latest elements array
                const found = (elements || []).filter(el => !el.isPermanent && isElementInBox(el, box));
                const foundIds = found.map(el => el.id);

                if (e?.shiftKey) {
                    // Holding shift adds to existing selection
                    setSelectedIds(prev => Array.from(new Set([...prev, ...foundIds])));
                } else {
                    setSelectedIds(foundIds);
                }
            } else if (!e?.shiftKey) {
                // If it was just a tiny click with no drag, clear selection
                setSelectedIds([]);
            }

            selectionBoxRef.current = null;
            setSelectionBox(null);
        }

        // Snap algorithm for moving a single counter/tile
        if (currentMode === 'moving' && selectedIds.length === 1) {
            setElements(prev => {
                let workingSet = [...prev];
                const targetId = selectedIds[0];
                const target = workingSet.find(item => item.id === targetId);
                if (target) {
                    const toolDef = getToolDefinition(target.type);
                    const snapFn = toolDef?.snapToNearest || toolDef?.snapAlgorithm;
                    if (typeof snapFn === 'function') {
                        const snapped = snapFn(target, workingSet, 35);
                        workingSet = workingSet.map(item => item.id === targetId ? { ...item, ...snapped } : item);
                    }
                }
                return workingSet;
            });
        }

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

        const isC = ['circle', 'frac_circle', 'spinner', 'node', 'clock', 'timer', 'realClock', 'integer_counter'].includes(el.type);
        const isP = el.type === 'protractor';
        const objHeight = isP ? actualRadius : (isC ? actualRadius * 2 : (Number(el.height) || 200));
        const objWidth = isC || isP ? actualRadius * 2 : (Number(el.width) || 200);
        
        const topY = el.y - 56;
        const botY = el.y + objHeight + 14;
        const cx = (isC || isP) ? el.x + actualRadius : el.x + objWidth / 2;
        const rigX = (isC || isP) ? el.x + actualRadius * 2 : el.x + objWidth;

        const Tool = getToolDefinition(el.type);
        const hasCustomContextMenu = Tool && typeof Tool.renderContextMenu === 'function';

        return (
            <g className="ui-ignore pointer-events-auto">
                {/* Visual Selection Outline */}
                <rect 
                    data-ui="true"
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
                
                {/* System Actions (Move, Copy, Delete) */}
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
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadElementAsImage(svgRef.current, el.id, {
                                    fileName: `${el.type}-${Date.now()}.png`,
                                    backgroundColor: 'transparent' // Transparent background makes it ideal for slides & worksheets
                                });
                            }}
                            className="!bg-white !text-slate-700 border border-slate-200 rounded-xl shadow-xs w-11 h-11 flex items-center justify-center hover:!bg-slate-50 hover:!text-indigo-600 cursor-pointer pointer-events-auto transition-colors" 
                            title={lang === 'sv' ? 'Ladda ner objekt som bild' : 'Download object as image'}
                        >
                            <Download size={20} />
                        </button>

                        <div className="w-px h-5 bg-slate-200 mx-0.5" />
                        <button 
                            onClick={() => deleteElement(el.id)} 
                            className="!bg-white !text-rose-500 border border-rose-200 rounded-xl shadow-xs w-11 h-11 flex items-center justify-center hover:!bg-rose-50 cursor-pointer pointer-events-auto" 
                            title={lang === 'sv' ? 'Ta bort' : 'Delete'}
                        >
                            <Trash2 size={20}/>
                        </button>
                    </div>
                </foreignObject>

                {/* Custom Context Menu */}
                {hasCustomContextMenu && (
                    <foreignObject x={el.x} y={botY + 6} width={1200} height={100} className="overflow-visible pointer-events-auto">
                        <div 
                            onPointerDown={(e) => e.stopPropagation()} 
                            data-whiteboard-interactive="true"
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

                {/* Rotation Handle */}
                {canRotate && el.type !== 'volume_cue' && (
                    <circle 
                        cx={cx} 
                        cy={el.y - 14} 
                        r={8} 
                        fill="white" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                        className="cursor-alias" 
                        onPointerDown={(e) => {
                            e.stopPropagation(); 
                            setInteractionMode('rotating'); 
                            setIsDrawing(true);
                        }} 
                    />
                )}
                
                {/* Resize Handle */}
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
                    onPointerDown={(e) => {
                        e.stopPropagation(); 
                        setInteractionMode('resizing'); 
                        setIsDrawing(true);
                    }} 
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
                selectedIds,
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
                onPointerMove={readOnly || !shouldInterceptEvents ? undefined : handlePointerMove}
                onPointerUp={readOnly || !shouldInterceptEvents ? undefined : handlePointerUp}
            >
                {/* 🟢 SVG Grid Background Pattern Definitions */}
                <defs>
                    <pattern id="whiteboard-small-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#a7adb4" strokeWidth="0.75" opacity="0.6" />
                    </pattern>
                    <pattern id="whiteboard-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <rect width="100" height="100" fill="url(#whiteboard-small-grid)" />
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#676969" strokeWidth="2" opacity="0.8" />
                    </pattern>
                </defs>

                {/* 🟢 Render Base Color & Dynamic Grid Layer */}
                {/* Dynamic Grid Layer (transparent background by default) */}
                {bgType === 'grid' && (
                    <rect 
                        x="0" 
                        y="0" 
                        width={resolution.w} 
                        height={resolution.h} 
                        fill="url(#whiteboard-grid)" 
                        className="pointer-events-none" 
                    />
                )}

                {Array.isArray(elements) && elements.map(renderElement)}

                {/* Multi-Selection Group Outline */}
                {selectedIds.length > 1 && (() => {
                    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
                    if (selectedElements.length <= 1) return null;

                    const minX = Math.min(...selectedElements.map(el => Number(el.x) || 0));
                    const maxX = Math.max(...selectedElements.map(el => (Number(el.x) || 0) + (Number(el.width) || 64)));
                    const minY = Math.min(...selectedElements.map(el => Number(el.y) || 0));
                    const maxY = Math.max(...selectedElements.map(el => (Number(el.y) || 0) + (Number(el.height) || 64)));

                    const padding = 12;

                    return (
                        <g className="pointer-events-none">
                            <rect
                                x={minX - padding}
                                y={minY - padding}
                                width={maxX - minX + padding * 2}
                                height={maxY - minY + padding * 2}
                                fill="none"
                                stroke="#6366f1"
                                strokeWidth={2}
                                strokeDasharray="6 4"
                                rx={16}
                                opacity={0.8}
                            />
                            <rect
                                x={minX - padding}
                                y={minY - padding - 22}
                                width={70}
                                height={18}
                                rx={6}
                                fill="#6366f1"
                            />
                            <text
                                x={minX - padding + 35}
                                y={minY - padding - 10}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#ffffff"
                                fontSize={10}
                                fontWeight="900"
                                fontFamily="sans-serif"
                            >
                                {selectedElements.length} {lang === 'sv' ? "valda" : "selected"}
                            </text>
                        </g>
                    );
                })()}

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
            
            {/* Unified Toolbar */}
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
                        onSpawn={handleSpawnFromDrawer}
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
                        elements={elements}
                        setElements={setElements}
                    />
                </div>
            )}
        </div>
    );
}

export default forwardRef(InteractiveCanvas);