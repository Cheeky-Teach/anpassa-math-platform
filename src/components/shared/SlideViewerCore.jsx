import React from 'react';
import SlideRenderer from './SlideRenderer'; // 👈 Check that this line is present and not misspelled
import InteractiveCanvas from '../whiteboard/InteractiveCanvas';
import InstructionSlideCard from './InstructionSlideCard';

export default function SlideViewerCore({
    slide,
    livePacket = [],
    lang = 'sv',
    bgType = 'blank',
    globalZoom = 1.0,
    authorMode = false,
    interactiveCanvasProps = {},
    slideRendererProps = {},
    sizeClasses = { 
        desc: 'text-m', 
        latex: 'text-xl', 
        clue: 'text-m', 
        headerText: 'text-l', 
        visualClass: 'scale-100 max-h-[180px] mb-2' 
    }
}) {
    const isInstruction = slide?.layout === 'instruction_template';
    const boundQuestionId = slide?.boundQuestionId || (slide?.activeIds && slide.activeIds[0]);
    const boundQuestion = livePacket.find(p => p.id === boundQuestionId) || null;

    return (
        <div 
            className={`relative w-full flex flex-col items-center shadow-[0_25px_70px_rgba(0,0,0,0.6)] rounded-3xl border-4 border-slate-700/80 transition-colors duration-300 overflow-hidden ${
                bgType === 'grid' ? 'bg-white' : 'bg-[#f9fbf7]'
            }`}
            style={{
                aspectRatio: '16/9',
                height: '100%',
                maxHeight: '100%',
                ...(bgType === 'grid' ? {
                    backgroundImage: 'linear-gradient(#e2e8f0 2px, transparent 2px), linear-gradient(90deg, #e2e8f0 2px, transparent 2px)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '-1px -1px'
                } : {})
            }}
        >
            {isInstruction ? (
                <InstructionSlideCard 
                    key={`instruction_${slide?.id}_${boundQuestionId}`}
                    question={boundQuestion}
                    lang={lang}
                    readOnly={!authorMode}
                    onRegenerate={slideRendererProps?.onRegenerate}
                />
            ) : (
                <>
                    {/* Layer 1: Slide Content / Questions */}
                    <SlideRenderer
                        activeIds={slide?.activeIds || []}
                        livePacket={livePacket}
                        lang={lang}
                        sizeClasses={sizeClasses}
                        authorMode={authorMode}
                        globalZoom={globalZoom}
                        {...slideRendererProps}
                    />

                    {/* Layer 2: Whiteboard / Drawing Layer */}
                    <InteractiveCanvas
                        key={slide?.id}
                        elements={slide?.elements || []}
                        resolution={{ w: 1920, h: 1080 }}
                        lang={lang}
                        bgType={bgType}
                        livePacket={livePacket}
                        {...interactiveCanvasProps}
                    />
                </>
            )}
        </div>
    );
}