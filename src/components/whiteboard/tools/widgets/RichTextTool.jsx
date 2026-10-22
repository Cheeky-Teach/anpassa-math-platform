// src/components/whiteboard/tools/widgets/RichTextTool.jsx
import React from 'react';
import { 
    Bold, 
    Italic, 
    Underline, 
    List, 
    ListOrdered, 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    GripHorizontal,
    Type
} from 'lucide-react';

const TEXT_COLORS = [
    '#0f172a', // Slate 900
    '#64748b', // Slate 500
    '#ef4444', // Red 500
    '#f97316', // Orange 500
    '#eab308', // Yellow 500
    '#22c55e', // Green 500
    '#06b6d4', // Cyan 500
    '#3b82f6', // Blue 500
    '#6366f1', // Indigo 500
    '#a855f7'  // Purple 500
];

const FONT_SIZES = [16, 20, 24, 32, 40, 48, 60, 72, 96];

// Stores the last valid text selection across toolbar clicks
let savedSelectionRange = null;

const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
        savedSelectionRange = sel.getRangeAt(0).cloneRange();
    }
};

const restoreSelection = () => {
    if (!savedSelectionRange) return;
    const sel = window.getSelection();
    if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRange);
    }
};

export const RichTextTool = {
    type: 'richText',
    hasOptions: true,

    createDefault: (id, color = '#0f172a', type = 'richText') => ({
        id,
        type: 'richText',
        x: 520,
        y: 220,
        width: 520,
        height: 320,
        content: type === 'math' ? '' : 'Skriv din text här...',
        stroke: color,
        showPalette: false,
        showFontSize: false,
        currentFontSize: 40,
        textColor: '#0f172a',
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, onUpdate, setElements, lang = 'sv' }) => {
        const currentFontSize = el.currentFontSize || 40;
        const currentTextColor = el.textColor || '#0f172a';

        const preventFocusLoss = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const applyStyle = (cmd, val = null, extraUpdates = {}) => {
            const editor = document.getElementById(`rich-text-${el.id}`);
            if (!editor) return;

            editor.focus();
            restoreSelection();

            if (cmd === 'fontSize') {
                document.execCommand('fontSize', false, '7');
                const fonts = editor.querySelectorAll('font[size="7"]');
                fonts.forEach(f => {
                    const span = document.createElement('span');
                    span.style.fontSize = `${val}px`;
                    span.style.lineHeight = '1.25';
                    span.innerHTML = f.innerHTML;
                    f.parentNode.replaceChild(span, f);
                });
            } else if (cmd === 'foreColor') {
                document.execCommand('foreColor', false, val);
            } else {
                document.execCommand(cmd, false, val);
            }

            saveSelection();

            const html = editor.innerHTML;
            const scrollH = editor.scrollHeight;

            if (onUpdate) {
                onUpdate({
                    ...el,
                    height: Math.max(el.height || 0, scrollH + 32),
                    content: html,
                    ...extraUpdates
                });
            } else if (setElements) {
                setElements(prev => prev.map(o => o.id === el.id ? {
                    ...o,
                    height: Math.max(o.height || 0, scrollH + 32),
                    content: html,
                    ...extraUpdates
                } : o));
            }
        };

        return (
            <div 
                className="flex items-center gap-1.5 font-sans font-bold text-xs select-none !text-slate-900"
                style={{ color: '#0f172a' }}
                onPointerDown={preventFocusLoss}
                onMouseDown={preventFocusLoss}
            >
                {/* 1. Basic Inline Formatting (Bold, Italic, Underline) */}
                <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('bold')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl font-black text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        title="Fetstil (Bold)"
                    >
                        <Bold size={14} strokeWidth={3} />
                    </button>
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('italic')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer font-serif italic"
                        title="Kursiv (Italic)"
                    >
                        <Italic size={14} />
                    </button>
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('underline')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer underline"
                        title="Understruken (Underline)"
                    >
                        <Underline size={14} />
                    </button>
                </div>

                {/* 2. Lists */}
                <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('insertUnorderedList')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        title="Punktlista (Bullet list)"
                    >
                        <List size={14} />
                    </button>
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('insertOrderedList')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        title="Numrerad lista (Numbered list)"
                    >
                        <ListOrdered size={14} />
                    </button>
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 3. Scalable Font Size Dropdown */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => {
                            if (setElements) {
                                setElements(prev => prev.map(o => o.id === el.id ? { 
                                    ...o, 
                                    showFontSize: !o.showFontSize, 
                                    showPalette: false 
                                } : o));
                            }
                        }} 
                        className="h-8 px-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-black flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                        title="Teckenstorlek"
                    >
                        <Type size={13} className="text-slate-400" />
                        <span>{currentFontSize}px</span>
                    </button>

                    {el.showFontSize && (
                        <div 
                            className="absolute bottom-full left-0 mb-2 py-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col w-20 z-[120] max-h-44 overflow-y-auto custom-scrollbar"
                            onMouseDown={preventFocusLoss}
                        >
                            {FONT_SIZES.map(sz => (
                                <button 
                                    key={sz}
                                    type="button"
                                    onMouseDown={preventFocusLoss}
                                    onClick={() => applyStyle('fontSize', sz, { showFontSize: false, currentFontSize: sz })}
                                    className={`px-3 py-1.5 text-center text-xs font-black transition-colors cursor-pointer ${
                                        currentFontSize === sz ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {sz}px
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Text Color Picker */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => {
                            if (setElements) {
                                setElements(prev => prev.map(o => o.id === el.id ? { 
                                    ...o, 
                                    showPalette: !o.showPalette, 
                                    showFontSize: false 
                                } : o));
                            }
                        }} 
                        className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl shadow-2xs active:scale-95 cursor-pointer"
                        title="Textfärg"
                    >
                        <div 
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs" 
                            style={{ backgroundColor: currentTextColor }} 
                        />
                    </button>

                    {el.showPalette && (
                        <div 
                            className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200 grid grid-cols-5 gap-1.5 w-36 z-[120]"
                            onMouseDown={preventFocusLoss}
                        >
                            {TEXT_COLORS.map(c => (
                                <button 
                                    key={c}
                                    type="button"
                                    onMouseDown={preventFocusLoss}
                                    onClick={() => applyStyle('foreColor', c, { showPalette: false, textColor: c })}
                                    className="w-5 h-5 rounded-full hover:scale-125 transition-transform cursor-pointer shadow-inner border border-black/10"
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-0.5" />

                {/* 5. Text Alignment */}
                <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('justifyLeft')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        title="Vänsterjustera"
                    >
                        <AlignLeft size={14} />
                    </button>
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('justifyCenter')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        title="Centrera"
                    >
                        <AlignCenter size={14} />
                    </button>
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => applyStyle('justifyRight')} 
                        className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 rounded-xl text-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
                        title="Högerjustera"
                    >
                        <AlignRight size={14} />
                    </button>
                </div>
            </div>
        );
    },

    render: (elOrOptions, maybeOptions) => {
        const el = elOrOptions?.el ? elOrOptions.el : elOrOptions;
        const options = (elOrOptions?.el ? elOrOptions : maybeOptions) || {};
        const { 
            showUI = false, 
            renderHandles = null,
            editingId = null,
            setEditingId = null,
            setElements = null,
            setSelectedId = null,
            setInteractionMode = null,
            setIsDrawing = null,
            setDragOffset = null,
            getCoordinates = null
        } = options;

        if (!el) return null;

        const w = Number(el.width) || 520;
        const h = Number(el.height) || 320;
        const isEditing = editingId === el.id;
        const baseFontSize = el.currentFontSize || 40;

        const handleStartEditing = (e) => {
            e.stopPropagation();
            if (setSelectedId) setSelectedId(el.id);
            if (setEditingId) {
                setEditingId(el.id);
                setTimeout(() => {
                    const node = document.getElementById(`rich-text-${el.id}`);
                    if (node) {
                        node.focus();
                        const range = document.createRange();
                        range.selectNodeContents(node);
                        range.collapse(false);
                        const sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(range);
                        saveSelection();
                    }
                }, 30);
            }
        };

        const capturePointer = (e) => {
            e.stopPropagation();
            if (setSelectedId) setSelectedId(el.id);
        };

        return (
            <g 
                key={el.id} 
                data-id={el.id} 
                transform={`translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}, ${w / 2}, ${h / 2})`}
                className="select-none"
            >
                {/* 1. Tactile Tray Drag Handle Bar */}
                <g 
                    className="cursor-move group"
                    style={{ pointerEvents: 'auto' }}
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        if (setSelectedId) setSelectedId(el.id);
                        if (setInteractionMode) setInteractionMode('moving');
                        if (setIsDrawing) setIsDrawing(true);
                        if (getCoordinates && setDragOffset) {
                            setDragOffset(getCoordinates(e, false));
                        }
                    }}
                >
                    <rect 
                        x={w / 2 - 40} 
                        y={-28} 
                        width={80} 
                        height={24} 
                        rx={10} 
                        fill="#f8fafc" 
                        stroke="#cbd5e1" 
                        strokeWidth={1.5}
                        className="group-hover:stroke-indigo-400 group-hover:fill-indigo-50/50 transition-colors shadow-xs" 
                    />
                    <GripHorizontal size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" x={w / 2 - 7} y={-23} />
                </g>

                {/* 2. Extrusion Base Shadow */}
                <rect 
                    x={0} 
                    y={6} 
                    width={w} 
                    height={h} 
                    rx={20} 
                    fill="#0f172a" 
                    fillOpacity="0.08" 
                    className="pointer-events-none" 
                />

                {/* 3. Text Card Chassis */}
                <rect 
                    x={0} 
                    y={0} 
                    width={w} 
                    height={h} 
                    rx={20} 
                    fill="#ffffff" 
                    fillOpacity={isEditing ? 1 : 0.94}
                    stroke={isEditing ? "#4f46e5" : "#cbd5e1"} 
                    strokeWidth={isEditing ? 2.5 : 1.5}
                    filter="drop-shadow(0 6px 16px rgba(15, 23, 42, 0.06))"
                    className="cursor-text pointer-events-auto"
                    onPointerDown={capturePointer}
                    onDoubleClick={handleStartEditing}
                />

                {/* 4. Text Content Layer */}
                <foreignObject 
                    x={0} 
                    y={0} 
                    width={w} 
                    height={h} 
                    className="overflow-visible pointer-events-auto"
                >
                    <div 
                        id={`rich-text-${el.id}`}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        onPointerDown={capturePointer}
                        onKeyUp={saveSelection}
                        onMouseUp={saveSelection}
                        onDoubleClick={handleStartEditing}
                        onInput={(e) => {
                            const html = e.currentTarget.innerHTML;
                            const node = e.currentTarget;
                            // Only grow if the content is truly overflowing the current box
                            const isOverflowing = node.scrollHeight > node.clientHeight;
                            
                            if (setElements) {
                                setElements(prev => prev.map(item => item.id === el.id ? { 
                                    ...item, 
                                    content: html,
                                    ...(isOverflowing ? { height: node.scrollHeight + 16 } : {})
                                } : item));
                            }
                        }}
                        onBlur={(e) => {
                            const html = e.currentTarget.innerHTML;
                            if (setElements) {
                                setElements(prev => prev.map(item => item.id === el.id ? { 
                                    ...item, 
                                    content: html 
                                } : item));
                            }
                        }}
                        ref={(node) => {
                            if (node && !isEditing && node.innerHTML !== (el.content || '')) {
                                node.innerHTML = el.content || '';
                            }
                        }}
                        style={{ 
                            fontSize: `${baseFontSize}px`,
                            lineHeight: '1.25',
                            userSelect: isEditing ? 'text' : 'none'
                        }}
                        className="w-full h-full p-5 outline-none font-sans text-slate-900 overflow-hidden cursor-text select-text break-words [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-8 [&_ol]:ml-8 [&_li]:pl-1"
                    />
                </foreignObject>

                {/* 5. Standard Selection Handles (Without rotation handle) */}
                {showUI && renderHandles && (
                    <g transform={`translate(${-el.x}, ${-el.y})`}>
                        {renderHandles(el, 0, { canRotate: false })}
                    </g>
                )}
            </g>
        );
    }
};

export default RichTextTool;