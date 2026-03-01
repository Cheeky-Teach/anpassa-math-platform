import React, { useState, useRef, useEffect } from 'react';
import Toolbar from './Toolbar';
import 'mathlive';
import { MathfieldElement } from 'mathlive';
import * as htmlToImage from 'html-to-image';
import { 
    ChevronLeft, Hash, Plus, Minus, Grid3X3, 
    CircleDot, Square as SquareIcon, RotateCw, 
    Play, Share2, RefreshCw, LayoutTemplate, Type, Trash2, Triangle,
    BarChart2, List, Clock as ClockIcon, Timer as TimerIcon, Pause, Printer,
    Disc2, Save, Copy
} from 'lucide-react';


const WhiteboardView = ({ onBack, lang }) => {
    // --- 0. TRANSLATIONS ---
    const t = {
        sv: {
            stepX: "Steg X:",
            stepY: "Steg Y:",
            quad1: "1:a Kvadr.",
            addRow: "+ Rad",
            remRow: "- Rad",
            graph: "GRAF",
            equation: "Ekvation",
            right: "Rät",
            isosceles: "Liksid",
            whole: "Heltal",
            decimal: "Decimal",
            fraction: "Bråk",
            parts: "Delar",
            size: "Storlek:",
            dice: "Tärningar",
            sides: "Sidor",
            rollAll: "SLÅ ALLA",
            diceHelp: "Klicka på en tärning för att färglägga den med vald färg.",
            min: "Min:",
            max: "Max:",
            calc: "Räkna:",
            eg: "t.ex. 10-3",
            subnotches: "Visa delstreck",
            headerTitle: "Anpassa",
            headerSub: "Whiteboard",
            saveImage: "Spara som bild",
            copyImage: "Kopiera bild",
            printCanvas: "Skriv ut (Landskap)"
        },
        en: {
            stepX: "Step X:",
            stepY: "Step Y:",
            quad1: "1st Quad",
            addRow: "+ Row",
            remRow: "- Row",
            graph: "GRAPH",
            equation: "Equation",
            right: "Right",
            isosceles: "Isosceles",
            whole: "Whole",
            decimal: "Decimal",
            fraction: "Fraction",
            parts: "Parts",
            size: "Size:",
            dice: "Dice",
            sides: "Sides",
            rollAll: "ROLL ALL",
            diceHelp: "Click a die to color it with the selected color.",
            min: "Min:",
            max: "Max:",
            calc: "Calc:",
            eg: "e.g. 10-3",
            subnotches: "Show subnotches",
            headerTitle: "Anpassa",
            headerSub: "Whiteboard",
            saveImage: "Save as image",
            copyImage: "Copy to clipboard",
            printCanvas: "Print (Landscape)",
        }
    }[lang || 'sv'];

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

        
    const [toast, setToast] = useState({ show: false, message: '' });
    const toastTimeoutRef = useRef(null);

    const showNotification = (message) => {
        // Clear any existing timer so they don't overlap
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        
        setToast({ show: true, message });

        toastTimeoutRef.current = setTimeout(() => {
            setToast({ show: false, message: '' });
            toastTimeoutRef.current = null;
        }, 3000);
    };

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
        
        // Disable snapping for measuring tools to allow precision
        if (shouldSnap && !['pen', 'highlighter', 'protractor', 'ruler'].includes(activeTool)) {
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
            setElements(prev => prev.map(el => {
                if (el.id !== id) return el;
                const newDice = (el.diceData || [{ value: 1, color: '#ffffff' }]).map(d => ({
                    ...d,
                    value: Math.floor(Math.random() * (parseInt(el.sides) || 6)) + 1
                }));
                return { ...el, diceData: newDice, isRolling: true };
            }));
            iterations++;
            if (iterations > 12) {
                clearInterval(interval);
                setElements(prev => prev.map(el => el.id === id ? { ...el, isRolling: false } : el));
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
    }    
    
    const copySelectedObject = async (id) => {
        if (!containerRef.current) return;

        try {
            const targetNode = containerRef.current.querySelector(`[data-id="${id}"]`);
            if (!targetNode) return;

            const bbox = targetNode.getBBox();
            const padding = 20;
            const width = bbox.width + (padding * 2);
            const height = bbox.height + (padding * 2);
            const svgMatrix = containerRef.current.getScreenCTM().inverse();
            const nodeClone = targetNode.cloneNode(true);
            
            // --- SURGICAL MAPPING (T-Chart, Math, & Rich Text) ---
            const allForeignObjects = nodeClone.querySelectorAll('foreignObject');

            allForeignObjects.forEach((fo, index) => {
                // In this function, we look at targetNode to get real values
                const realFo = targetNode.querySelectorAll('foreignObject')[index];
                if (!realFo) return;

                // 1. FIX MATH TOOL (MathLive)
                const mathField = realFo.querySelector('math-field');
                if (mathField) {
                    const mathDiv = document.createElement('div');
                    mathDiv.style.cssText = "color:black; font-family:serif; font-size:24px; display:flex; align-items:center; justify-content:center; height:100%; width:100%;";
                    mathDiv.textContent = mathField.value; 
                    fo.innerHTML = '';
                    fo.appendChild(mathDiv);
                    return;
                }

                // 2. FIX RICH TEXT TOOL (Wordpad)
                const richEditor = realFo.querySelector('[contenteditable="true"]');
                if (richEditor) {
                    const staticDiv = document.createElement('div');
                    staticDiv.className = "prose prose-sm font-sans text-slate-800";
                    staticDiv.style.cssText = "color:black; padding:16px; white-space:pre-wrap; word-break:break-word; width:100%; height:100%; text-align:left;";
                    staticDiv.innerHTML = richEditor.innerHTML;
                    fo.innerHTML = '';
                    fo.appendChild(staticDiv);
                    return;
                }

                // 3. FIX T-CHART / STANDARD INPUTS
                const realInputs = realFo.querySelectorAll('input');
                if (realInputs.length > 0) {
                    const targetRect = targetNode.getBoundingClientRect();
                    realInputs.forEach((input) => {
                        if (!input.value) return;
                        const iRect = input.getBoundingClientRect();
                        const screenCenterX = iRect.left + iRect.width / 2;
                        const screenCenterY = iRect.top + iRect.height / 2;
                        const pt = containerRef.current.createSVGPoint();
                        pt.x = screenCenterX; pt.y = screenCenterY;
                        const svgPt = pt.matrixTransform(svgMatrix);

                        const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        svgText.setAttribute("x", (svgPt.x + 2).toString());
                        svgText.setAttribute("y", (svgPt.y + 4).toString());
                        svgText.setAttribute("text-anchor", "middle");
                        svgText.setAttribute("dominant-baseline", "central");
                        svgText.setAttribute("font-family", "sans-serif");
                        svgText.setAttribute("font-weight", "900");
                        svgText.setAttribute("font-size", "16px");
                        const isBlue = input.classList.contains('text-blue-600');
                        svgText.setAttribute("fill", isBlue ? '#2563eb' : '#000000');
                        svgText.textContent = input.value;
                        nodeClone.appendChild(svgText);
                    });
                    fo.remove();
                }
            });

            nodeClone.querySelectorAll('.ui-ignore').forEach(el => el.remove());

            const booth = document.createElement('div');
            booth.style.cssText = `position: fixed; top: 0; left: -10000px; width: ${width}px; height: ${height}px;`;
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            tempSvg.setAttribute("width", width.toString());
            tempSvg.setAttribute("height", height.toString());
            tempSvg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
            
            const defs = containerRef.current.querySelector('defs')?.cloneNode(true);
            if (defs) tempSvg.appendChild(defs);
            
            tempSvg.appendChild(nodeClone);
            booth.appendChild(tempSvg);
            document.body.appendChild(booth);

            await new Promise(r => setTimeout(r, 60));
            const dataUrl = await htmlToImage.toPng(tempSvg, { pixelRatio: 3, backgroundColor: null, skipFonts: true, copyDefaultStyles: true });
            document.body.removeChild(booth);

            const parts = dataUrl.split(';base64,');
            const blob = new Blob([new Uint8Array(window.atob(parts[1]).split('').map(c => c.charCodeAt(0)))], { type: 'image/png' });
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            showNotification(lang === 'sv' ? "Objekt kopierat!" : "Object copied!");

        } catch (err) {
            console.error("Smart Copy Failed:", err);
        }
    };

    const exportCanvas = async (mode) => {
        const svgElement = containerRef.current;
        if (!svgElement) return;

        try {
            const rect = svgElement.getBoundingClientRect();
            const vbW = viewBox.w / zoom;
            const vbH = viewBox.h / zoom;
            const ctm = svgElement.getScreenCTM().inverse();
            const boardClone = svgElement.cloneNode(true);

            // --- SURGICAL MAPPING (T-Chart & Rich Text) ---
            const allForeignObjects = boardClone.querySelectorAll('foreignObject');
            allForeignObjects.forEach((fo, index) => {
                const realFo = svgElement.querySelectorAll('foreignObject')[index];
                
                // 1. Handle Rich Text (Quill)
                const quillEditor = realFo.querySelector('.ql-editor');
                if (quillEditor) {
                    const richTextDiv = document.createElement('div');
                    richTextDiv.className = "ql-editor";
                    richTextDiv.innerHTML = quillEditor.innerHTML;
                    richTextDiv.style.cssText = "color:black; background:transparent; font-family:sans-serif;";
                    fo.innerHTML = '';
                    fo.appendChild(richTextDiv);
                } 
                // 2. Handle T-Chart Inputs
                else {
                    const realInputs = realFo.querySelectorAll('input');
                    realInputs.forEach((input) => {
                        if (!input.value) return;
                        const iRect = input.getBoundingClientRect();
                        const screenCenterX = iRect.left + iRect.width / 2;
                        const screenCenterY = iRect.top + iRect.height / 2;
                        const pt = svgElement.createSVGPoint();
                        pt.x = screenCenterX; pt.y = screenCenterY;
                        const svgPt = pt.matrixTransform(ctm);

                        const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        svgText.setAttribute("x", (svgPt.x + 2).toString());
                        svgText.setAttribute("y", (svgPt.y + 4).toString());
                        svgText.setAttribute("text-anchor", "middle");
                        svgText.setAttribute("dominant-baseline", "central");
                        svgText.setAttribute("font-family", "sans-serif");
                        svgText.setAttribute("font-weight", "900");
                        svgText.setAttribute("font-size", "16px");
                        
                        const isBlue = input.classList.contains('text-blue-600');
                        svgText.setAttribute("fill", isBlue ? '#2563eb' : '#000000');
                        svgText.textContent = input.value;
                        boardClone.appendChild(svgText);
                    });
                    fo.remove();
                }
            });

            boardClone.querySelectorAll('.ui-ignore').forEach(el => el.remove());

            const booth = document.createElement('div');
            booth.style.cssText = `position: fixed; top: 0; left: -10000px; width: ${rect.width}px; height: ${rect.height}px;`;
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            tempSvg.setAttribute("width", rect.width);
            tempSvg.setAttribute("height", rect.height);
            tempSvg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${vbW} ${vbH}`);
            
            const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            bgRect.setAttribute("width", "1000%"); bgRect.setAttribute("height", "1000%");
            bgRect.setAttribute("x", "-500%"); bgRect.setAttribute("y", "-500%");
            bgRect.setAttribute("fill", bgType === 'blank' ? '#ffffff' : (bgType === 'grid' ? 'url(#grid)' : 'url(#dot)'));
            
            const defs = svgElement.querySelector('defs')?.cloneNode(true);
            if (defs) tempSvg.appendChild(defs);
            tempSvg.appendChild(bgRect);
            tempSvg.appendChild(boardClone);
            booth.appendChild(tempSvg);
            document.body.appendChild(booth);

            await new Promise(r => setTimeout(r, 100));
            const dataUrl = await htmlToImage.toPng(tempSvg, {
                pixelRatio: 2, backgroundColor: bgType === 'blank' ? '#ffffff' : '#f8fafc',
                skipFonts: true, copyDefaultStyles: true
            });
            document.body.removeChild(booth);

            const parts = dataUrl.split(';base64,');
            const blob = new Blob([new Uint8Array(window.atob(parts[1]).split('').map(c => c.charCodeAt(0)))], { type: 'image/png' });

            if (mode === 'image') {
                const link = document.createElement('a');
                link.download = `whiteboard-export-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            } else if (mode === 'copy') {
                await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
                showNotification(lang === 'sv' ? "Tavlan kopierad!" : "Board copied!");
            } else if (mode === 'print') {
                const printWin = window.open('', '_blank');
                printWin.document.write(`<html><body style="margin:0;display:flex;justify-content:center;"><img src="${dataUrl}" style="max-width:100%;height:auto;"></body></html>`);
                printWin.document.close();
                setTimeout(() => { printWin.print(); printWin.close(); }, 300);
            }
        } catch (err) {
            console.error("Export Failed:", err);
        }
    };

    // --- 4. INTERACTION HANDLERS ---
    const handleMouseDown = (e) => {
        // 1. If we are clicking inside the Wordpad area or its toolbar, stop board logic immediately
        if (e.target.closest('[contenteditable="true"], .ui-ignore')) {
            return; 
        }

        const { x, y } = getCoordinates(e);
        const hit = [...elements].reverse().find(el => isPointInElement(x, y, el));

        // 2. Standard Selection Logic
        if (e.target.closest('foreignObject')) {
            if (hit) {
                setSelectedId(hit.id);
                // Allow T-charts and Math fields to focus, but keep richText draggable via center
                if (editingId === hit.id || hit.type !== 'richText') return;
            }
        }

        // 2. Ignore clicks on standard UI (like the Toolbar) if we didn't hit an element
        if (e.target.closest('.ui-ignore') && !hit) return;

        // 3. Prevent starting a "Drawing" if we are clicking a context menu
        if (selectedId && e.target.closest('.ui-ignore')) return;

        // --- INSTANT SPAWN TOOLS ---
        if (['timer', 'clock', 'ruler', 'coord', 'dice', 'math', 'richText'].includes(activeTool)) {
            const newId = Date.now();
            const centerX = viewBox.x + (viewBox.w / zoom) / 2;
            const centerY = viewBox.y + (viewBox.h / zoom) / 2;
            
            let newEl = { 
                id: newId, 
                type: activeTool, 
                x: centerX - 150, 
                y: centerY - 150, 
                width: activeTool === 'math' ? 300 : (activeTool === 'richText' ? 500 : 200), 
                height: activeTool === 'math' ? 80 : (activeTool === 'richText' ? 300 : 200), 
                stroke: color, 
                rotation: 0, 
                opacity: 1 
            };
            
            if (activeTool === 'timer') { newEl.duration = 60; newEl.timeLeft = 60; newEl.isRunning = false; }
            else if (activeTool === 'clock') { newEl.hourRotation = 300; newEl.minRotation = 0; }
            else if (activeTool === 'ruler') { 
                newEl.x = centerX-400; newEl.width = 800; newEl.height = 100; 
                newEl.min = "0"; newEl.max = "10"; newEl.stepValue = 1; 
                newEl.unitType = 'whole'; newEl.denom = 4; newEl.showSubnotches = true;
                newEl.equation = "";
            }
            else if (activeTool === 'coord') { newEl.stepX = "1"; newEl.stepY = "1"; newEl.gridSize = 40; newEl.isFirstQuadrant = false; newEl.showLabels = true; newEl.fontSize = 20; newEl.equation = ""; }
            else if (activeTool === 'dice') { newEl.sides = "6"; newEl.diceData = [{ value: 1, color: '#ffffff' }]; newEl.isRolling = false; }
            else if (activeTool === 'math') { newEl.label = ""; newEl.fontSize = 32; }
            else if (activeTool === 'richText') { newEl.content = "<p>Skriv här...</p>"; }

            const updated = [...elements, newEl];
            setElements(updated);
            commitToHistory(updated);
            setSelectedId(newId);
            setActiveTool('select');
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
                setEditingId(null); // Click background to exit editing mode
                setInteractionMode('panning'); 
                setIsDrawing(true);
                setPanStart({ x: e.clientX, y: e.clientY });
            }
            return;
        }

        // --- DRAWING TOOLS ---
        setIsDrawing(true); 
        setInteractionMode('drawing');
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
        
        setElements(prev => [...prev, newEl]); 
        setSelectedId(newId);
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

            // 1. Clock Rotations
            if (interactionMode === 'rotating-hour' || interactionMode === 'rotating-min') {
                const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
                const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
                if (interactionMode === 'rotating-hour') el.hourRotation = angle; else el.minRotation = angle;
            } 
            // 2. Standard Rotation
            else if (interactionMode === 'rotating') {
                const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
                el.rotation = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 90;
            } 
            
            // --- 3. NEW: LINE POINT ADJUSTMENTS ---
            else if (interactionMode === 'move-start') {
                el.x = x;
                el.y = y;
            } 
            else if (interactionMode === 'move-end') {
                el.x2 = x;
                el.y2 = y;
            } 

            // 4. Moving Elements
            else if (interactionMode === 'moving') {
                const dx = x - (el.x + dragOffset.x); 
                const dy = y - (el.y + dragOffset.y);
                
                if (el.type === 'path') el.points = el.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
                
                // For the line, we update the second point by the same delta 
                // so the whole line moves as one piece when dragged from the middle.
                if (el.type === 'line') { el.x2 += dx; el.y2 += dy; }
                
                el.x = x - dragOffset.x; 
                el.y = y - dragOffset.y;
            } 
            
            // 5. Scaling (Coordinate Plane / T-Chart)
            else if (interactionMode === 'scaling') {
                const dx = x - el.x;
                const dy = (el.y + el.height) - y;
                const newGridSize = Math.max(20, Math.min(100, Math.max(dx, dy) / 10));
                el.gridSize = newGridSize;
            } 
            
            // 6. Resizing (Rectangles / Boxes)
            else if (interactionMode === 'resizing') {
                el.width = Math.max(50, x - el.x);
                el.height = (el.shape3D === 'cube') ? el.width : Math.max(50, y - el.y);
                // Removed old line logic from here to avoid conflicts
            } 
            
            // 7. Initial Drawing
            else if (interactionMode === 'drawing') {
                if (el.type === 'path') el.points.push({ x, y });
                // This remains so the initial "click and drag" to create a line works
                else if (el.type === 'line') { el.x2 = x; el.y2 = y; }
                else if (['node', 'spinner'].includes(el.type)) {
                    const r = Math.sqrt((x - el.startX) ** 2 + (y - el.startY) ** 2);
                    el.width = r * 2; el.height = r * 2; el.x = el.startX - r; el.y = el.startY - r;
                } else {
                    el.x = Math.min(x, el.startX); 
                    el.y = Math.min(y, el.startY);
                    el.width = Math.abs(x - el.startX); 
                    el.height = Math.abs(y - el.startY);
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
        // 1. Path detection (for pen/highlighter)
        if (el.type === 'path' && el.points && el.points.length > 0) {
            return Math.abs(x - el.points[0].x) < 30 && Math.abs(y - el.points[0].y) < 30;
        }

        const r = el.width / 2;

        // 2. Rectangular bounds detection
        // Added 'richText' to this list to allow selection of the Wordpad box
        const bounds = ['rect', 'coord', 'triangle', 'ruler', 'shapes_3d', 'tchart', 'math', 'dice', 'richText'];
        if (bounds.some(b => el.type.includes(b))) {
            return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
        }

        // 3. Circular/Radial detection
        if (el.type.includes('circle') || ['spinner', 'node', 'protractor', 'clock', 'timer'].includes(el.type)) {
            return Math.sqrt((x - (el.x + r))**2 + (y - (el.y + r))**2) <= r;
        }

        // 4. Line detection
        if (el.type === 'line') {
            const d = Math.abs((el.y2-el.y)*x - (el.x2-el.x)*y + el.x2*el.y - el.y2*el.x) / Math.sqrt((el.y2-el.y)**2 + (el.x2-el.x)**2);
            return d < 15;
        }

        return false;
    };

    const getGraphLinePoints = (el) => {
        if (!el.equation) return null;

        // 1. Parse Equation (y = mx + c)
        const cleanEq = el.equation.replace(/\s+/g, '').toLowerCase();
        const match = cleanEq.match(/y=([-+]?\d*\.?\d*)x?([-+]?\d*\.?\d*)?/);
        if (!match) return null;

        let m = match[1] === "" ? 1 : (match[1] === "-" ? -1 : parseFloat(match[1]));
        if (isNaN(m)) m = 0; 
        const c = parseFloat(match[2] || 0);

        // 2. Internal Grid Constants
        const s = el.gridSize || 40;
        const stepX = parseFloat(el.stepX) || 1;
        const stepY = parseFloat(el.stepY) || 1;

        // 3. Local Origin (Relative to the top-left of the box)
        const localOX = el.isFirstQuadrant ? 0 : el.width / 2;
        const localOY = el.isFirstQuadrant ? el.height : el.height / 2;

        // 4. Boundary Math (Logical Units)
        const logicXLeft = (-localOX / s) * stepX;
        const logicXRight = ((el.width - localOX) / s) * stepX;

        const logicYLeft = m * logicXLeft + c;
        const logicYRight = m * logicXRight + c;

        // 5. Return Local Coordinates (Relative to 0,0 of the tool)
        return {
            x1: 0,
            y1: localOY - (logicYLeft / stepY) * s,
            x2: el.width,
            y2: localOY - (logicYRight / stepY) * s
        };
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
            const isSelected = selectedId === el.id;

            return (
                <g key={el.id} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                    {/* The Main Line */}
                    <line 
                        x1={el.x} 
                        y1={el.y} 
                        x2={el.x2} 
                        y2={el.y2} 
                        stroke={el.stroke} // Uses current picker color
                        strokeWidth={el.strokeWidth || 4} 
                        strokeLinecap="round" 
                    />
                    
                    {/* Start and End Handles - Only visible when selected */}
                    {isSelected && (
                        <g className="ui-ignore">
                            {/* Start Point Handle */}
                            <circle 
                                cx={el.x} 
                                cy={el.y} 
                                r={10} 
                                fill="white" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                className="cursor-crosshair"
                                onMouseDown={(e) => { 
                                    e.stopPropagation(); 
                                    setInteractionMode('move-start'); 
                                    setIsDrawing(true); 
                                }}
                            />
                            {/* End Point Handle */}
                            <circle 
                                cx={el.x2} 
                                cy={el.y2} 
                                r={10} 
                                fill="white" 
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                className="cursor-crosshair"
                                onMouseDown={(e) => { 
                                    e.stopPropagation(); 
                                    setInteractionMode('move-end'); 
                                    setIsDrawing(true); 
                                }}
                            />
                        </g>
                    )}

                    {/* Render Context UI (Delete/Copy) */}
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
            const s = el.gridSize || 40;
            const stepX = parseFloat(el.stepX) || 1;
            const stepY = parseFloat(el.stepY) || 1;
            
            // Internal Local Origin
            const localOX = el.isFirstQuadrant ? 0 : el.width / 2;
            const localOY = el.isFirstQuadrant ? el.height : el.height / 2;
            
            const lns = [], lbs = [];
            const graphLine = getGraphLinePoints(el);

            // Generate grid lines relative to Local Origin
            for (let i = -20; i <= 20; i++) {
                const lp = i * s; // Local pixel offset
                
                // Vertical lines
                if (localOX + lp >= 0 && localOX + lp <= el.width) {
                    lns.push(<line key={`v-${i}`} x1={localOX + lp} y1={0} x2={localOX + lp} y2={el.height} stroke="#cbd5e1" strokeWidth="1" />);
                    if (el.showLabels && i !== 0) {
                        lbs.push(<text key={`tx-${i}`} x={localOX + lp} y={localOY + 25} textAnchor="middle" fontSize={el.fontSize} fontWeight="900" fill="black">{(i * stepX).toLocaleString()}</text>);
                    }
                }
                // Horizontal lines
                if (localOY - lp >= 0 && localOY - lp <= el.height) {
                    lns.push(<line key={`h-${i}`} x1={0} y1={localOY - lp} x2={el.width} y2={localOY - lp} stroke="#cbd5e1" strokeWidth="1" />);
                    if (el.showLabels && i !== 0) {
                        lbs.push(<text key={`ty-${i}`} x={localOX - 10} y={localOY - lp + 5} textAnchor="end" fontSize={el.fontSize} fontWeight="900" fill="black">{(i * stepY).toLocaleString()}</text>);
                    }
                }
            }

            return (
                <g key={el.id} transform={`translate(${el.x}, ${el.y}) ${transform.replace(/translate\([^)]+\)/, '')}`} onClick={e => { e.stopPropagation(); setSelectedId(el.id); }}>
                    {/* The Background (Now at 0,0) */}
                    <rect x={0} y={0} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke="black" strokeWidth="1" />
                    
                    {/* The Clipping Window */}
                    <svg width={el.width} height={el.height} style={{ overflow: 'hidden' }}>
                        {lns}
                        {graphLine && (
                            <line 
                                x1={graphLine.x1} y1={graphLine.y1} 
                                x2={graphLine.x2} y2={graphLine.y2} 
                                stroke={el.stroke || "#3b82f6"} 
                                strokeWidth="4" 
                                strokeLinecap="round"
                            />
                        )}
                    </svg>

                    {/* Main Axes */}
                    <line x1={0} y1={localOY} x2={el.width} y2={localOY} stroke="black" strokeWidth="3" />
                    <line x1={localOX} y1={0} x2={localOX} y2={el.height} stroke="black" strokeWidth="3" />
                    
                    {lbs}
                    <text x={localOX - 10} y={localOY + 25} fontSize={el.fontSize} fontWeight="900" fill="black">0</text>
                    
                    {/* Context UI handles still need global coordinates, so we wrap them back */}
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {showUI && renderHandles(el)}
                    </g>
                </g>
            );
        }

        if (el.type === 'richText') {
            const isEditing = editingId === el.id;
            const isSelected = selectedId === el.id;

            // Helper to apply styles without losing focus
            const applyStyle = (cmd, val = null) => {
                if (cmd === 'fontSize') {
                    // Map the dropdown values (1, 3, 5, 7) to real Whiteboard pixel sizes
                    const sizeMap = {
                        "1": "12px",
                        "3": "18px",
                        "5": "32px",
                        "7": "64px"
                    };
                    const pixelSize = sizeMap[val] || "18px";
                    
                    // We use 'formatBlock' or manual span injection for modern sizing
                    document.execCommand('styleWithCSS', false, true);
                    document.execCommand('fontSize', false, "7"); // Set to a marker size
                    
                    // Find the elements we just touched and swap legacy size for real pixels
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const span = document.createElement("span");
                        span.style.fontSize = pixelSize;
                        const range = selection.getRangeAt(0);
                        range.surroundContents(span);
                    }
                } else {
                    document.execCommand(cmd, false, val);
                }
            };

            return (
                <g key={el.id} transform={transform}>
                    <rect 
                        x={el.x} y={el.y} 
                        width={el.width} height={el.height} 
                        fill="white" 
                        fillOpacity={isEditing ? 1 : 0.8} 
                        stroke={isSelected ? "#3b82f6" : "#e2e8f0"} 
                        strokeWidth={isSelected ? 3 : 1}
                        rx="8"
                        style={{ cursor: isEditing ? 'default' : 'move' }}
                        onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id); }}
                    />

                    <foreignObject 
                        x={el.x} y={el.y} 
                        width={el.width} height={el.height}
                        style={{ pointerEvents: isEditing ? 'auto' : 'none' }}
                    >
                        <div 
                            contentEditable={isEditing}
                            suppressContentEditableWarning
                            className="w-full h-full p-4 outline-none prose prose-m overflow-y-auto font-sans text-slate-800"
                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                            onBlur={(e) => {
                                const newContent = e.currentTarget.innerHTML;
                                setElements(prev => prev.map(item => item.id === el.id ? { ...item, content: newContent } : item));
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            dangerouslySetInnerHTML={{ __html: el.content || '' }}
                        />
                    </foreignObject>

                    {/* --- ADVANCED WORDPAD TOOLBAR --- */}
                    {isEditing && (
                        <foreignObject 
                            x={el.x} 
                            y={el.y - 85} 
                            width={Math.max(el.width, 420)} 
                            height={85} 
                            className="ui-ignore"
                        >
                            <div 
                                className="flex flex-col gap-1 bg-slate-900 p-2 rounded-xl shadow-2xl pointer-events-auto border border-slate-700" 
                                // CRITICAL: Stop the whiteboard from ever seeing clicks on the toolbar
                                onMouseDown={(e) => e.stopPropagation()} 
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Top Row: Formatting */}
                                <div className="flex items-center gap-1">
                                    <button onClick={() => applyStyle('bold')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded font-bold">B</button>
                                    <button onClick={() => applyStyle('italic')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded italic">I</button>
                                    <button onClick={() => applyStyle('underline')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded underline">U</button>
                                    <div className="w-px h-4 bg-slate-700 mx-1" />
                                    <button onClick={() => applyStyle('insertUnorderedList')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded"><List size={14}/></button>
                                    <button onClick={() => applyStyle('insertOrderedList')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded text-[10px]">1.</button>
                                    <div className="w-px h-4 bg-slate-700 mx-1" />
                                    <button onClick={() => applyStyle('justifyLeft')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded text-xs align-left text-left">L</button>
                                    <button onClick={() => applyStyle('justifyCenter')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded text-xs align-center text-center">C</button>
                                    <button onClick={() => applyStyle('justifyRight')} className="w-8 h-8 flex items-center justify-center text-white hover:bg-slate-700 rounded text-xs align-right text-right">R</button>
                                    <button onClick={() => setEditingId(null)} className="ml-auto px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-600 transition-colors">Klar</button>
                                </div>

                                {/* Bottom Row: Size & Color */}
                                <div className="flex items-center gap-2 mt-1">
                                    {/* Fixed Font Size Select */}
                                    <select 
                                        // onPointerDown is more reliable in SVG contexts for dropdowns
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onChange={(e) => applyStyle('fontSize', e.target.value)} 
                                        className="bg-slate-800 text-white text-[20px] rounded px-1 outline-none border border-slate-700 cursor-pointer"
                                    >
                                        <option value="1">Liten</option>
                                        <option value="3" selected>Normal</option>
                                        <option value="5">Stor</option>
                                        <option value="7">Extra Stor</option>
                                    </select>

                                    <div className="flex gap-1 items-center">
                                        {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ffffff'].map(c => (
                                            <button 
                                                key={c} 
                                                onClick={() => applyStyle('foreColor', c)} 
                                                className="w-4 h-4 rounded-full border border-slate-600" 
                                                style={{ background: c }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </foreignObject>
                    )}
                    
                    {isSelected && !isEditing && renderHandles(el)}
                </g>
            );
        }

        if (el.type === 'ruler') {
            const ticks = [], rng = el.max - el.min, pxU = el.width / rng;
            const subStep = el.unitType === 'fraction' ? 1/el.denom : (el.unitType === 'decimal' ? 0.1 : 0.5);
            const labelStep = (el.unitType === 'fraction' || el.unitType === 'whole') ? 1 : (el.stepValue || 1);

            for (let i = 0; i <= rng + 0.001; i += subStep) {
                const val = parseFloat(el.min) + i;
                const xp = el.x + i * pxU;
                const isLabelTick = Math.abs(i % labelStep) < 0.001 || Math.abs((i % labelStep) - labelStep) < 0.001;
                if (isLabelTick) {
                    ticks.push(<line key={`m-${i}`} x1={xp} y1={el.y + 30} x2={xp} y2={el.y + 70} stroke="black" strokeWidth="4" />);
                    const lbl = el.unitType === 'decimal' ? val.toFixed(1) : Math.round(val).toString();
                    ticks.push(<text key={`l-${i}`} x={xp} y={el.y + 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="black">{lbl}</text>);
                } else if (el.showSubnotches) {
                    ticks.push(<line key={`s-${i}`} x1={xp} y1={el.y + 40} x2={xp} y2={el.y + 60} stroke="black" strokeWidth="2" opacity="0.5" />);
                }
            }

            // --- Calculation Hops Logic ---
            const hops = [];
            const match = el.equation?.match(/(\d+)\s*([+-])\s*(\d+)/);
            if (match) {
                const startVal = parseInt(match[1]), op = match[2], count = parseInt(match[3]);
                const dir = op === '+' ? 1 : -1;
                const totalWidth = count * pxU;
                const startX = el.x + (startVal - el.min) * pxU;
                
                for (let j = 0; j < count; j++) {
                    const x1 = startX + (j * dir * pxU);
                    const x2 = x1 + (dir * pxU);
                    const midX = (x1 + x2) / 2;
                    const h = 40; // Arc height
                    const d = `M ${x1} ${el.y + 30} Q ${midX} ${el.y - h} ${x2} ${el.y + 30}`;
                    hops.push(<path key={j} d={d} fill="none" stroke={el.stroke} strokeWidth="3" strokeDasharray="6,4" />);
                    
                    // Add arrow to final hop
                    if (j === count - 1) {
                        hops.push(<path key="arrow" d={`M ${x2-5*dir} ${el.y+20} L ${x2} ${el.y+30} L ${x2-5*dir} ${el.y+40}`} fill="none" stroke={el.stroke} strokeWidth="3" />);
                    }
                }
                
                // Centered Equation Label
                const labelX = startX + (totalWidth / 2) * dir;
                hops.push(
                    <g key="lbl">
                        <rect x={labelX - 25} y={el.y - 75} width="50" height="35" fill="white" rx="4" />
                        <text x={labelX} y={el.y - 50} textAnchor="middle" fontSize="22" fontWeight="black" fill={el.stroke}>{op}{count}</text>
                    </g>
                );
            }

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                        <line x1={el.x} y1={el.y+50} x2={el.x+el.width} y2={el.y+50} stroke="black" strokeWidth="5" />
                        {ticks}
                        {hops}
                    </g>
                    {showUI && renderHandles(el)}
                </React.Fragment>
            );
        }

        if (el.type === 'tchart') {
            // 1. ADD SCALING LOGIC HERE
            // We treat gridSize 40 as the '100%' scale. 
            // If you drag the yellow handle, this multiplier grows or shrinks.
            const scaleFactor = (el.gridSize || 40) / 40; 
            
            const tableW = el.width * 0.4;
            const graphW = el.width * 0.55;
            
            // 2. APPLY SCALE TO graphH
            // This makes the bars grow/shrink without changing the white box size
            const graphH = (el.height - 130) * scaleFactor; 

            // --- rest of your existing logic ---
            const dataValues = el.rows.map(r => parseFloat(r.value) || 0);
            const rawMax = Math.max(...dataValues, 5);
            
            const getNiceStep = (max) => {
                const targetSteps = 5;
                const rawStep = max / targetSteps;
                const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
                const residual = rawStep / magnitude;
                let niceResidual;
                if (residual < 1.5) niceResidual = 1;
                else if (residual < 3.5) niceResidual = 2;
                else if (residual < 7.5) niceResidual = 5;
                else niceResidual = 10;
                return niceResidual * magnitude;
            };

            const stepSize = getNiceStep(rawMax);
            const tickCount = Math.ceil(rawMax / stepSize);
            const niceMax = tickCount * stepSize;
            const barColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
            const yTicks = [];
            
            for (let j = 0; j <= tickCount; j++) {
                const val = j * stepSize;
                const py = -(val / niceMax) * graphH;
                yTicks.push(
                    <g key={j}>
                        <line x1="-5" y1={py} x2="0" y2={py} stroke="black" strokeWidth="1" />
                        <text x="-10" y={py} textAnchor="end" alignmentBaseline="middle" fontSize="14" fontWeight="bold" fill="black">{val}</text>
                    </g>
                );
            }

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                        {/* Main Container Rect */}
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.95" stroke="black" strokeWidth="3" rx="8" />
                        
                        {/* Table Section */}
                        <g transform={`translate(${el.x + 10}, ${el.y + 10})`}>
                            <line x1={tableW/2} y1="0" x2={tableW/2} y2={el.height - 20} stroke="black" strokeWidth="4" />
                            <line x1="0" y1="50" x2={tableW} y2="50" stroke="black" strokeWidth="4" />
                            <foreignObject x={0} y={0} width={tableW} height={50} className="ui-ignore">
                                <div className="flex w-full h-full pointer-events-auto">
                                    <input className="w-1/2 text-center font-black bg-transparent outline-none text-xl border-none" value={el.xLabel} onChange={e => setElements(p => p.map(o => o.id === el.id ? {...o, xLabel: e.target.value} : o))} />
                                    <input className="w-1/2 text-center font-black bg-transparent outline-none text-xl border-none" value={el.yLabel} onChange={e => setElements(p => p.map(o => o.id === el.id ? {...o, yLabel: e.target.value} : o))} />
                                </div>
                            </foreignObject>
                            {el.rows.map((row, i) => (
                                <foreignObject key={i} x={0} y={65 + i*40} width={tableW} height={40} className="ui-ignore">
                                    <div className="flex w-full h-full border-b border-slate-100 hover:bg-slate-50 pointer-events-auto">
                                        <input className="w-1/2 text-center text-m font-bold bg-transparent outline-none text-black border-none" value={row.label} onChange={e => { const newRows = [...el.rows]; newRows[i].label = e.target.value; setElements(p => p.map(o => o.id === el.id ? {...o, rows: newRows} : o)); }} />
                                        <input className="w-1/2 text-center text-m font-black bg-transparent outline-none text-blue-600 border-none" value={row.value} onChange={e => { const newRows = [...el.rows]; newRows[i].value = e.target.value; setElements(p => p.map(o => o.id === el.id ? {...o, rows: newRows} : o)); }} />
                                    </div>
                                </foreignObject>
                            ))}
                        </g>

                        {/* Graph Section - Notice graphH is now dynamic based on scale */}
                        {el.showGraph && (
                            <g transform={`translate(${el.x + tableW + 40}, ${el.y + el.height - 90})`}>
                                <line x1="0" y1="0" x2={graphW} y2="0" stroke="black" strokeWidth="2" />
                                <line x1="0" y1="0" x2="0" y2={-graphH} stroke="black" strokeWidth="2" />
                                {yTicks}
                                {el.rows.map((row, i) => {
                                    const numVal = parseFloat(row.value) || 0;
                                    const barWidth = (graphW / el.rows.length) * 0.7;
                                    const barH = (numVal / niceMax) * graphH;
                                    const px = i * (graphW / el.rows.length) + (graphW / el.rows.length) / 2;
                                    return (
                                        <g key={i}>
                                            {el.chartType === 'bar' ? (
                                                <rect x={px - barWidth/2} y={-barH} width={barWidth} height={barH} fill={barColors[i % barColors.length]} fillOpacity="0.7" stroke="black" strokeWidth="1" />
                                            ) : (
                                                i < el.rows.length - 1 && (
                                                    <line x1={px} y1={-(numVal/niceMax)*graphH} x2={(i+1)*(graphW/el.rows.length)+graphW/el.rows.length/2} y2={-(parseFloat(el.rows[i+1].value || 0)/niceMax)*graphH} stroke={el.stroke} strokeWidth="4" />
                                                )
                                            )}
                                            <g transform={`translate(${px}, 10) rotate(-45)`}>
                                                <text x="0" y="0" textAnchor="end" alignmentBaseline="middle" fontSize="18" fontWeight="900" fill="black">{row.label}</text>
                                            </g>
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

        if (el.type === 'clock') {
            const r = el.width / 2, cx = el.x + r, cy = el.y + r;
            const ticks = [];
            
            // Generate 60 notches (minutes) and 12 numbers
            for (let i = 0; i < 60; i++) {
                const angle = i * 6 * (Math.PI / 180);
                const isHour = i % 5 === 0;
                const tickLen = isHour ? 15 : 7;
                const x1 = cx + (r - tickLen) * Math.sin(angle);
                const y1 = cy - (r - tickLen) * Math.cos(angle);
                const x2 = cx + r * Math.sin(angle);
                const y2 = cy - r * Math.cos(angle);
                
                ticks.push(
                    <line 
                        key={`t-${i}`} 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke="black" 
                        strokeWidth={isHour ? 3 : 1} 
                    />
                );

                if (isHour) {
                    const num = i === 0 ? 12 : i / 5;
                    const tx = cx + (r - 40) * Math.sin(angle);
                    const ty = cy - (r - 40) * Math.cos(angle) + 8;
                    ticks.push(
                        <text key={`n-${i}`} x={tx} y={ty} textAnchor="middle" fontSize="22" fontWeight="bold" fill="black" className="select-none pointer-events-none">
                            {num}
                        </text>
                    );
                }
            }

            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}>
                        <circle cx={cx} cy={cy} r={r} fill="white" stroke="black" strokeWidth="6" />
                        {ticks}
                        
                        {/* Hour Hand with Arrow Handle */}
                        <g transform={`rotate(${el.hourRotation}, ${cx}, ${cy})`}>
                            <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.55} stroke="black" strokeWidth="10" strokeLinecap="round" />
                            <path 
                                d={`M ${cx - 10} ${cy - r * 0.55} L ${cx} ${cy - r * 0.65} L ${cx + 10} ${cy - r * 0.55} Z`} 
                                fill="black" 
                                className="cursor-pointer ui-ignore"
                                onMouseDown={(e) => { e.stopPropagation(); setInteractionMode('rotating-hour'); setIsDrawing(true); }}
                            />
                        </g>

                        {/* Minute Hand with Arrow Handle */}
                        <g transform={`rotate(${el.minRotation}, ${cx}, ${cy})`}>
                            <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.8} stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                            <path 
                                d={`M ${cx - 8} ${cy - r * 0.8} L ${cx} ${cy - r * 0.9} L ${cx + 8} ${cy - r * 0.8} Z`} 
                                fill="#475569" 
                                className="cursor-pointer ui-ignore"
                                onMouseDown={(e) => { e.stopPropagation(); setInteractionMode('rotating-min'); setIsDrawing(true); }}
                            />
                        </g>
                        
                        <circle cx={cx} cy={cy} r="6" fill="black" />
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
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={e=>{e.stopPropagation(); setSelectedId(el.id);}}>
                        <path d={`M ${el.x} ${cy} A ${r} ${r} 0 0 1 ${el.x+el.width} ${cy} Z`} fill="white" fillOpacity="0.5" stroke="black" strokeWidth="2" />
                        {ticks}
                        <circle cx={cx} cy={cy} r="5" fill="black" />
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
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
            const isEditing = editingId === el.id;
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} 
                       onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                       onDoubleClick={() => setEditingId(el.id)}>
                        {/* Background Rect - This is what you actually "grab" to move */}
                        <rect x={el.x} y={el.y} width={el.width} height={el.height} fill="white" fillOpacity="0.9" stroke={isSelected ? "#3b82f6" : "transparent"} strokeWidth="2" rx="8" />
                        
                        <foreignObject 
                            x={el.x} y={el.y} width={el.width} height={el.height} 
                            className="ui-ignore"
                            style={{ pointerEvents: isEditing ? 'auto' : 'none' }} // Pass-through when not editing
                        >
                            <math-field
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    background: 'transparent',
                                    fontSize: `${el.fontSize}px`,
                                    border: 'none',
                                    color: 'black'
                                }}
                                onInput={e => setElements(prev => prev.map(n => n.id === el.id ? {...n, label: e.target.value} : n))}
                                ref={(elDom) => { if (elDom && elDom.value !== el.label) elDom.value = el.label; }}
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
            const dice = el.diceData || [];
            const cols = Math.ceil(Math.sqrt(dice.length));
            const cellSize = el.width / cols;
            
            return (
                <React.Fragment key={el.id}>
                    <g transform={transform} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }} onDoubleClick={() => rollDice(el.id)}>
                        {dice.map((d, i) => {
                            const r_idx = Math.floor(i / cols), c_idx = i % cols;
                            const dx = el.x + c_idx * cellSize, dy = el.y + r_idx * cellSize;
                            const dSize = cellSize * 0.85;
                            const isSelectedDie = hoveredId === `${el.id}-${i}`;
                            
                            return (
                                <g key={i} 
                                   onMouseEnter={() => setHoveredId(`${el.id}-${i}`)} 
                                   onMouseLeave={() => setHoveredId(null)}
                                   onClick={(e) => { 
                                       e.stopPropagation(); 
                                       setElements(prev => prev.map(o => o.id === el.id ? {
                                           ...o, 
                                           diceData: o.diceData.map((dd, idx) => idx === i ? { ...dd, color: color } : dd) 
                                       } : o));
                                   }}
                                >
                                    <rect x={dx + cellSize * 0.075} y={dy + cellSize * 0.075} width={dSize} height={dSize} 
                                          fill={d.color || 'white'} stroke="black" strokeWidth="3" rx={dSize * 0.2} 
                                          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
                                          className={el.isRolling ? "animate-pulse" : "cursor-pointer"} />
                                    <text x={dx + cellSize/2} y={dy + cellSize/2 + (dSize*0.15)} textAnchor="middle" 
                                          fontSize={dSize * 0.5} fontWeight="900" fill="black" className="select-none pointer-events-none">
                                        {d.value}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                    {showUI && renderHandles(el, r)}
                </React.Fragment>
            );
        }
        
        return null;
    };

    const renderHandles = (el, radius = 0) => {
        const isC = ['circle', 'frac_circle', 'spinner', 'node', 'clock', 'timer'].includes(el.type);
        const isP = el.type === 'protractor';
        
        // --- 1. COORDINATE CALCULATION ---
        const botY = isP ? el.y + radius : (isC ? el.y + radius*2 : el.y + el.height);
        const cx = (isC || isP) ? el.x + radius : el.x + el.width/2;
        const rigX = (isC || isP) ? el.x + radius*2 : el.x + el.width;

        // --- 2. CONTEXT MENU VISIBILITY ---
        const hasOptions = ['ruler', 'shapes_3d', 'triangle', 'tchart', 'frac_rect', 'frac_circle', 'spinner', 'coord', 'math', 'dice'].includes(el.type);

        return (
            <g className="ui-ignore">
                {/* Selection Bounding Box */}
                <rect x={el.x-5} y={el.y-5} width={(isC || isP ? radius*2 : el.width)+10} height={(isP ? radius : (isC ? radius*2 : el.height))+10} fill="none" stroke="#3b82f6" strokeDasharray="5" opacity="0.4" />
                
                {/* Action Buttons (Delete & Smart Copy) */}
                <foreignObject x={el.x - 95} y={el.y - 45} width={100} height={45}>
                    <div className="flex gap-2">
                        <button onClick={() => copySelectedObject(el.id)} className="text-blue-500 bg-white border-2 border-blue-500 rounded-xl shadow-lg w-10 h-10 flex items-center justify-center hover:bg-blue-50 transition-transform active:scale-90" title={lang === 'sv' ? "Kopiera" : "Copy"}>
                            <Copy size={20}/>
                        </button>
                        <button onClick={() => deleteElement(el.id)} className="text-rose-500 bg-white border-2 border-rose-500 rounded-xl shadow-lg w-10 h-10 flex items-center justify-center hover:bg-rose-50 transition-transform active:scale-90">
                            <Trash2 size={22}/>
                        </button>
                    </div>
                </foreignObject>
                
                {/* Rotation Handle */}
                <circle cx={cx} cy={el.y-55} r={12} fill="white" stroke="#3b82f6" strokeWidth="2" className="cursor-alias" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('rotating'); setIsDrawing(true);}} />
                
                {/* STANDARD RESIZE HANDLE (White Square) */}
                <rect x={rigX-5} y={botY-5} width={20} height={20} fill="white" stroke="#3b82f6" strokeWidth={2} className="cursor-nwse-resize" onMouseDown={(e)=>{e.stopPropagation(); setInteractionMode('resizing'); setIsDrawing(true);}} />

                {/* YELLOW SCALING HANDLE (Internal Density) - Only for Charts/Grids */}
                {(el.type === 'coord' || el.type === 'tchart') && (
                    <circle 
                        cx={rigX + 25} cy={botY - 10} r={10} 
                        fill="#eab308" stroke="#854d0e" strokeWidth="2" 
                        className="cursor-zoom-in"
                        onMouseDown={(e) => { e.stopPropagation(); setInteractionMode('scaling'); setIsDrawing(true); }} 
                    />
                )}
                
                {/* --- EXHAUSTIVE CONTEXT MENUS --- */}
                {hasOptions && (
                    <foreignObject x={el.x} y={botY+20} width={700} height={350}>
                        <div className="flex flex-wrap gap-4 bg-white rounded-2xl shadow-2xl border-2 border-emerald-500 p-5 pointer-events-auto text-[18px] font-black uppercase items-center">
                            
                            {/* 1. Coordinate Plane */}
                            {el.type === 'coord' && (
                                <>
                                    {t.stepX}<input type="text" className="w-14 border-b text-center outline-none" value={el.stepX} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepX:e.target.value}:o))} />
                                    {t.stepY}<input type="text" className="w-14 border-b text-center outline-none" value={el.stepY} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, stepY:e.target.value}:o))} />
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, isFirstQuadrant:!o.isFirstQuadrant}:o))} className={`px-2 py-1 rounded ${el.isFirstQuadrant?'bg-emerald-500 text-white':'bg-slate-100'}`}>{t.quad1}</button>
                                    {/* --- SMART EQUATION INPUT --- */}
                                    <div className="flex items-center gap-2 border-l pl-4 border-slate-200 ml-2">
                                        <span className="text-[12px] text-slate-500 font-black lowercase">y =</span>
                                        <input 
                                            type="text" 
                                            placeholder="2x + 1"
                                            className="w-28 border-b-2 border-blue-500 outline-none text-center font-bold lowercase bg-blue-50/30 rounded-t"
                                            // Extract current equation string (stripping 'y=' for the user)
                                            value={el.equation ? el.equation.replace('y=', '') : ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                // Prepend 'y=' automatically so the parser in renderElement works
                                                setElements(prev => prev.map(o => o.id === el.id ? { ...o, equation: val ? `y=${val}` : "" } : o));
                                            }}
                                        />
                                        {/* Optional: Clear button for the equation */}
                                        {el.equation && (
                                            <button 
                                                onClick={() => setElements(prev => prev.map(o => o.id === el.id ? { ...o, equation: "" } : o))}
                                                className="text-slate-400 hover:text-rose-500 px-1"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}

                            {/* 2. T-Chart */}
                            {el.type === 'tchart' && (
                                <div className="flex gap-2">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: [...o.rows, {label:'?', value:'0'}]}:o))} className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-black uppercase shadow-sm">{t.addRow}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, rows: o.rows.length > 1 ? o.rows.slice(0, -1) : o.rows}:o))} className="px-3 py-2 bg-rose-100 text-rose-600 rounded-lg text-xs font-black uppercase">{t.remRow}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, chartType: o.chartType==='bar'?'line':'bar'}:o))} className="px-3 py-2 bg-slate-100 rounded-lg">{el.chartType==='bar'?<BarChart2 size={18}/>:<List size={18}/>}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showGraph:!o.showGraph}:o))} className={`px-4 py-2 rounded-lg text-xs font-black ${el.showGraph ? 'bg-emerald-600 text-white':'bg-slate-100'}`}>{t.graph}</button>
                                </div>
                            )}

                            {/* 3. Ruler / Number Line (RESTORED) */}
                            {el.type === 'ruler' && (
                                <div className="flex flex-wrap gap-4 items-center">
                                    {t.min}<input type="text" className="w-14 border-b text-center outline-none" value={el.min} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, min:e.target.value}:o))} />
                                    {t.max}<input type="text" className="w-14 border-b text-center outline-none" value={el.max} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, max:e.target.value}:o))} />
                                    {t.calc}<input type="text" placeholder={t.eg} className="w-24 border-b border-emerald-500 text-center outline-none font-bold text-emerald-700" value={el.equation} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, equation:e.target.value}:o))} />
                                    <select className="bg-slate-100 rounded-lg p-2 text-xs font-bold" value={el.unitType} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, unitType:e.target.value}:o))}>
                                        <option value="whole">{t.whole}</option><option value="decimal">{t.decimal}</option><option value="fraction">{t.fraction}</option>
                                    </select>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showSubnotches: !o.showSubnotches}:o))} className={`p-2 rounded-lg ${el.showSubnotches ? 'bg-emerald-500 text-white' : 'bg-slate-50'}`}><Hash size={20}/></button>
                                </div>
                            )}

                            {/* 4. Dice (RESTORED) */}
                            {el.type === 'dice' && (
                                <div className="flex items-center gap-4">
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, diceData: (o.diceData||[]).slice(0,-1)}:o))} className="w-8 h-8 bg-slate-100 rounded-lg font-black">-</button>
                                    <span className="text-xs font-black">{(el.diceData||[]).length} {t.dice}</span>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, diceData: [...(o.diceData||[]), {value:1, color:'#ffffff'}]}:o))} className="w-8 h-8 bg-slate-100 rounded-lg font-black">+</button>
                                    <select className="bg-slate-50 border rounded p-1 text-xs" value={el.sides||"6"} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, sides:e.target.value}:o))}>
                                        {[4,6,8,10,12,20].map(s=><option key={s} value={s}>{s} {t.sides}</option>)}
                                    </select>
                                    <button onClick={()=>rollDice(el.id)} className="bg-emerald-500 text-white rounded-xl px-4 py-2 font-black text-xs">{t.rollAll}</button>
                                </div>
                            )}

                            {/* 5. Math Tool */}
                            {el.type === 'math' && (
                                <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-500">
                                    {t.size} <input type="text" className="w-16 border-b-2 border-emerald-500 text-center outline-none" value={el.fontSize} onChange={e=>setElements(p=>p.map(o=>o.id===el.id?{...o, fontSize: e.target.value}:o))} />
                                </div>
                            )}

                            {/* 6. Triangle (RESTORED) */}
                            {el.type === 'triangle' && (
                                <>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'right'}:o))} className={`px-3 py-1 rounded text-xs ${el.triangleType==='right'?'bg-emerald-500 text-white':'bg-slate-100'}`}>{t.right}</button>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, triangleType:'isosceles'}:o))} className={`px-3 py-1 rounded text-xs ${el.triangleType==='isosceles'?'bg-emerald-500 text-white':'bg-slate-100'}`}>{t.isosceles}</button>
                                </>
                            )}

                            {/* 7. 3D Shapes (RESTORED) */}
                            {el.type === 'shapes_3d' && (
                                <>
                                    <span className="text-emerald-600 font-black">{el.shape3D}</span>
                                    <button onClick={()=>setElements(p=>p.map(o=>o.id===el.id?{...o, showInternal:!o.showInternal}:o))} className={`p-2 rounded border ${el.showInternal?'bg-emerald-500 text-white':'bg-slate-50'}`}><Hash size={18}/></button>
                                </>
                            )}

                            {/* 8. Divisions / Fractions / Spinner */}
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

    return (
        <div className="fixed inset-0 bg-[#f8fafc] flex flex-col overflow-hidden z-[100] font-sans">
            {/* --- PRINT & EXPORT STYLES --- */}
            <style>{`
                @media print {
                    @page { size: landscape; margin: 0; }
                    
                    /* Hide EVERYTHING on the page first */
                    body > * { display: none !important; }
                    
                    /* Resurrect only the Whiteboard div and the 'main' content */
                    .fixed.inset-0 { 
                        display: block !important; 
                        position: static !important; 
                        background: white !important;
                    }
                    
                    main { 
                        display: block !important; 
                        position: absolute !important;
                        top: 0; left: 0;
                        width: 100% !important; 
                        height: 100% !important; 
                        background: white !important;
                    }

                    header, .Toolbar-container, .ui-ignore { 
                        display: none !important; 
                    }
                }
                
                .rich-text-container .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e2e8f0;
                    background: #f8fafc;
                    padding: 4px;
                }
                .rich-text-container .ql-container.ql-snow {
                    border: none;
                    font-size: 16px;
                    height: calc(100% - 42px); /* Leaves room for the toolbar */
                }
                /* Ensure the editor is always visible */
                .rich-text-container .ql-editor {
                    min-height: 100%;
                }

                @keyframes toast-in-out {
                    0% { transform: translate(-50%, 20px); opacity: 0; }
                    10% { transform: translate(-50%, 0); opacity: 1; }
                    80% { transform: translate(-50%, 0); opacity: 1; }
                    100% { transform: translate(-50%, -10px); opacity: 0; }
                }
                .animate-toast {
                    animation: toast-in-out 3s ease-in-out forwards;
                }
            `}</style>
            <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-[150]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"><ChevronLeft size={24} /></button>
                    <h1 className="text-sm font-black uppercase italic tracking-tighter text-slate-800">{t.headerTitle} <span className="text-emerald-600">{t.headerSub}</span></h1>
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
                    <div className="flex items-center gap-2 border-l pl-4 ml-2 border-slate-200 ui-ignore">
                        <button onClick={() => exportCanvas('image')} title={t.saveImage} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors">
                            <Save size={18} />
                        </button>
                        <button onClick={() => exportCanvas('copy')} title={t.copyImage} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors">
                            <Copy size={18} />
                        </button>
                        <button onClick={() => exportCanvas('print')} title={t.printCanvas} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-orange-600 transition-colors">
                            <Printer size={18} />
                    </button>
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
                        {elements.map(el => (
                            <g key={el.id} data-id={el.id}>
                                {renderElement(el)}
                            </g>
                        ))}
                    </svg>
                </main>
                <Toolbar lang={lang} activeTool={activeTool} setActiveTool={setActiveTool} color={color} setColor={setColor} onUndo={undo} onRedo={redo} canUndo={historyIndex > 0} canRedo={historyIndex < history.length - 1} onClear={() => { commitToHistory([]); setSelectedId(null); }} />
            </div>
            {/* --- TOAST NOTIFICATION --- */}
            {toast.show && (
                <div 
                    key={toast.message} // Use the message string, not Date.now()
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] pointer-events-none animate-toast"
                >
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
                        <div className="bg-emerald-500 p-1 rounded-full">
                            <Copy size={16} className="text-white" />
                        </div>
                        <span className="font-black uppercase tracking-wider text-sm">
                            {toast.message}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhiteboardView;