import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css'; // Ensure CSS is imported

const MathText = ({ text, className = "", large = false }) => {
    if (!text) return null;

    // 1. Patch common LaTeX color syntax differences if necessary
    const patchedText = text.replace(/\\mathbf\{\\?textcolor\{([^}]+)\}\{([^}]+)\}\}/g, '{\\color{$1}\\mathbf{$2}}');

    // 2. Split by $ delimiters
    const parts = patchedText.split(/(\$[^\$]+\$)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const tex = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(tex, { 
                            throwOnError: false, 
                            displayMode: large 
                        });
                        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch (e) {
                        return <span key={index} className="text-red-500">{part}</span>;
                    }
                } else if (part.includes('\\')) {
                    // Catch-all for stray LaTeX without $ delimiters (legacy support)
                    try {
                        const html = katex.renderToString(part, { 
                            throwOnError: false, 
                            displayMode: false 
                        });
                        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch (e) {
                        return <span key={index}>{part}</span>;
                    }
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default MathText;