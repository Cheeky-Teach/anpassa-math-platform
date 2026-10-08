import React, { useRef, useEffect } from 'react';

export default function MathDisplay({ content, className = "" }) {
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
}