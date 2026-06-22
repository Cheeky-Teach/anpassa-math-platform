import React from 'react';
import { VISUAL_TOKENS } from './VisualTokens';

export const BaseCanvas = ({ children }) => {
    return (
        <div className="w-full h-full flex items-center justify-center p-2">
            <svg 
                viewBox={VISUAL_TOKENS.CANVAS.VIEWBOX}
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full block overflow-visible drop-shadow-sm font-sans"
            >
                {/* Every component inside just renders <g> (groups), 
                  <path>, <rect>, etc. No more nested SVGs! 
                */}
                {children}
            </svg>
        </div>
    );
};