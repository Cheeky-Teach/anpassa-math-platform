// src/components/whiteboard/tools/widgets/RichTextTool.jsx
import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from 'lucide-react';

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

export const RichTextTool = {
    type: 'richText',
    hasOptions: true,

    createDefault: (id, color, type) => ({
        id,
        type: 'richText',
        x: 550,
        y: 250,
        width: 400,
        height: 120,
        content: type === 'math' ? '$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$' : 'Skriv din text här...',
        stroke: color,
        showPalette: false, // 🟢 Track palette state here instead of a hook
        rotation: 0,
        opacity: 1
    }),

    renderContextMenu: ({ el, onUpdate, setElements }) => {
        const applyStyle = (cmd, val = null) => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            if (cmd === 'fontSize') {
                const range = selection.getRangeAt(0);
                if (range.collapsed) return;
                const span = document.createElement('span');
                span.style.fontSize = `${val}px`;
                span.style.lineHeight = 'normal';
                try {
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } catch (err) {}
            } else if (cmd === 'foreColor') {
                const range = selection.getRangeAt(0);
                if (!range.collapsed) {
                    const span = document.createElement('span');
                    span.style.color = val;
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            } else {
                document.execCommand(cmd, false, val);
            }

            const node = document.getElementById(`rich-text-${el.id}`);
            if (node) {
                const html = node.innerHTML;
                const scrollH = node.scrollHeight;
                onUpdate({ ...el, height: Math.max(el.height || 0, scrollH), content: html });
            }
        };

        const preventFocusLoss = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const togglePalette = () => {
            if (setElements) {
                setElements(prev => prev.map(item => item.id === el.id ? { ...item, showPalette: !item.showPalette } : item));
            }
        };

        const closePalette = () => {
            if (setElements) {
                setElements(prev => prev.map(item => item.id === el.id ? { ...item, showPalette: false } : item));
            }
        };

        return (
            <div 
                className="relative flex items-center gap-2 font-sans font-bold text-xs select-none text-slate-900 ui-ignore pointer-events-auto bg-white px-3 py-2 rounded-2xl shadow-xl border-2 border-slate-200"
                onPointerDown={preventFocusLoss}
                onMouseDown={preventFocusLoss}
            >
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('bold')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg font-bold cursor-pointer">B</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('italic')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg italic font-serif cursor-pointer">I</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('underline')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg underline cursor-pointer">U</button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('insertUnorderedList')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Bullet List">
                    <List size={16} />
                </button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('insertOrderedList')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Numbered List">
                    <ListOrdered size={16} />
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1" />

                {/* Custom Font Size Toggle */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => {
                            if (setElements) {
                                setElements(prev => prev.map(item => item.id === el.id ? { ...item, showFontSize: !item.showFontSize, showPalette: false } : item));
                            }
                        }} 
                        className="bg-white border border-slate-300 text-slate-800 text-xs h-8 rounded-lg px-2 cursor-pointer font-bold hover:bg-slate-50 flex items-center justify-center"
                        title="Font Size"
                    >
                        Size
                    </button>

                    {/* Pop-up Font Size Menu */}
                    {el.showFontSize && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-1.5 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col w-[60px] z-[100] max-h-[160px] overflow-y-auto custom-scrollbar">
                            {[14, 18, 24, 28, 36, 48, 64, 80, 96, 120].map(sz => (
                                <button 
                                    key={sz}
                                    type="button"
                                    onMouseDown={preventFocusLoss}
                                    onClick={() => {
                                        applyStyle('fontSize', sz);
                                        if (setElements) {
                                            setElements(prev => prev.map(item => item.id === el.id ? { ...item, showFontSize: false } : item));
                                        }
                                    }}
                                    className="px-2 py-1.5 text-center text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer transition-colors"
                                >
                                    {sz}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                {/* Custom Color Palette Toggle */}
                <div className="relative">
                    <button 
                        type="button" 
                        onMouseDown={preventFocusLoss} 
                        onClick={() => {
                            if (setElements) {
                                setElements(prev => prev.map(item => item.id === el.id ? { ...item, showPalette: !item.showPalette, showFontSize: false } : item));
                            }
                        }} 
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" 
                        title="Text Color"
                    >
                        <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: '#0f172a' }} />
                    </button>

                    {/* Pop-up Color Grid */}
                    {el.showPalette && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-xl shadow-lg border border-slate-200 grid grid-cols-5 gap-1.5 w-[140px] z-[100]">
                            {TEXT_COLORS.map(c => (
                                <button 
                                    key={c}
                                    type="button"
                                    onMouseDown={preventFocusLoss}
                                    onClick={() => {
                                        applyStyle('foreColor', c);
                                        closePalette();
                                    }}
                                    className="w-5 h-5 rounded-full hover:scale-125 transition-transform cursor-pointer shadow-inner border border-black/10"
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('justifyLeft')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Align Left">
                    <AlignLeft size={16} />
                </button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('justifyCenter')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Align Center">
                    <AlignCenter size={16} />
                </button>
                <button type="button" onMouseDown={preventFocusLoss} onClick={() => applyStyle('justifyRight')} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer" title="Align Right">
                    <AlignRight size={16} />
                </button>
            </div>
        );
    },

    render: (options) => {
        const { el, transform, isSelected, showUI, renderHandles, setElements, editingId, setEditingId } = options;
        const isEditing = editingId === el.id;

        const capturePointer = (e) => {
            e.stopPropagation();
            if (!isSelected && typeof options.setSelectedId === 'function') {
                options.setSelectedId(el.id);
            }
        };

        const handleStartEditing = (e) => {
            e.stopPropagation();
            if (typeof setEditingId === 'function') {
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
                    }
                }, 30);
            }
        };

        return (
            <g key={el.id} data-id={el.id} transform={transform} className="pointer-events-auto">
                <rect 
                    x={el.x} y={el.y} width={el.width} height={el.height} 
                    fill="white" fillOpacity={isEditing ? 1 : 0.95} 
                    stroke={isSelected ? "#3b82f6" : "#e2e8f0"} strokeWidth={isSelected ? 3 : 1} rx="8"
                    className="cursor-text"
                    onPointerDown={capturePointer}
                    onDoubleClick={handleStartEditing}
                />
                
                <foreignObject 
                    x={el.x} y={el.y} width={el.width} height={el.height} 
                    style={{ pointerEvents: 'auto' }}
                >
                    <div 
                        id={`rich-text-${el.id}`}
                        contentEditable={isEditing}
                        suppressContentEditableWarning
                        className="w-full h-full p-4 outline-none font-sans text-slate-800 overflow-hidden cursor-text select-text [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:ml-8 [&_ol]:ml-8 [&_li]:pl-2"
                        style={{ 
                            whiteSpace: 'pre-wrap', 
                            wordBreak: 'break-word', 
                            overflowWrap: 'break-word', 
                            lineHeight: '1.25', 
                            fontSize: '28px', 
                            userSelect: isEditing ? 'text' : 'none' 
                        }}
                        ref={(node) => {
                            if (node && node.getAttribute('data-init') !== 'true') {
                                node.innerHTML = el.content || '';
                                node.setAttribute('data-init', 'true');
                            }
                        }}
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
                        onPointerDown={capturePointer}
                        onDoubleClick={handleStartEditing}
                    />
                </foreignObject>

                {showUI && renderHandles && renderHandles(el)}
            </g>
        );
    }
};