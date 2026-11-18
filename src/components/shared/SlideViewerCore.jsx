// src/components/shared/SlideViewerCore.jsx
import React from 'react';
import SlideRenderer from './SlideRenderer';
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import InstructionSlideCard from './InstructionSlideCard';
import { PRESENTATION_THEMES, DEFAULT_THEME } from '../../constants/presentationThemes';

export default function SlideViewerCore({
    slide,
    livePacket = [],
    lang = 'sv',
    bgType = 'blank',
    globalZoom = 1.0,
    authorMode = false,
    compactMode = false,
    theme = DEFAULT_THEME,
    interactiveCanvasProps = {},
    slideRendererProps = {},
    sizeClasses = { 
        desc: 'text-sm', 
        latex: 'text-xl', 
        clue: 'text-sm', 
        headerText: 'text-base', 
        visualClass: 'scale-100 max-h-[180px] mb-2' 
    }
}) {
    const isInstruction = slide?.layout === 'instruction_template';
    const boundQuestionId = slide?.boundQuestionId || (slide?.activeIds && slide.activeIds[0]);
    const boundQuestion = livePacket.find(p => p.id === boundQuestionId) || null;

    const currentTheme = PRESENTATION_THEMES[slide?.theme || theme] || PRESENTATION_THEMES[DEFAULT_THEME];
    const { key: canvasKey, ...safeCanvasProps } = interactiveCanvasProps || {};

    return (
        <div 
            className={`relative w-full flex flex-col items-center rounded-2xl border border-[var(--border-strong)] transition-colors duration-300 overflow-hidden select-none font-sans ${
                compactMode ? 'shadow-sm min-h-[420px] h-full' : 'shadow-2xl'
            } ${currentTheme.wrapperClass.replace(/slide-honeycomb-bg/g, '')}`}
            style={compactMode ? {
                backgroundImage: 'none'
            } : {
                aspectRatio: '16/9',
                height: '100%',
                maxHeight: '100%',
                backgroundImage: 'none'
            }}
        >
            {/* --- BASE CONTENT LAYER (z-10) --- */}
            <div className={`${compactMode && isInstruction ? 'relative flex-1' : 'absolute inset-0'} z-10 w-full h-full pointer-events-auto`}>
                {isInstruction ? (
                    <InstructionSlideCard 
                        key={`instruction_${slide?.id}_${boundQuestionId}_${boundQuestion?.regenVersion || 0}`}
                        question={boundQuestion}
                        lang={lang}
                        readOnly={false}
                        compactMode={compactMode}
                        theme={currentTheme}
                        onRegenerate={slideRendererProps?.onRegenerate}
                    />
                ) : (
                    <SlideRenderer
                        activeIds={slide?.activeIds || []}
                        livePacket={livePacket}
                        lang={lang}
                        sizeClasses={sizeClasses}
                        authorMode={authorMode}
                        compactMode={compactMode}
                        globalZoom={globalZoom}
                        theme={currentTheme}
                        {...slideRendererProps}
                    />
                )}
            </div>

            {/* --- INTERACTIVE CANVAS & TOOLBAR LAYER (z-20) --- */}
            {(!isInstruction || interactiveCanvasProps?.forceActive) && (
                <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
                    <InteractiveCanvas
                        key={canvasKey || slide?.id}
                        elements={safeCanvasProps?.elements || slide?.elements || []}
                        resolution={{ w: 1920, h: 1080 }}
                        lang={lang}
                        bgType={bgType}
                        livePacket={livePacket}
                        {...safeCanvasProps}
                        isOverlay={isInstruction || safeCanvasProps?.isOverlay}
                    />
                </div>
            )}

            {/* --- PERMANENT WATERMARK (Hidden in compact student mode to save footer space) --- */}
            {!compactMode && (
                <div className={`absolute bottom-3 right-5 pointer-events-none select-none z-20 flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase tracking-wider ${currentTheme.watermarkColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    <span>Anpassa Math Platform :: Anpassa.app</span>
                </div>
            )}
        </div>
    );
}