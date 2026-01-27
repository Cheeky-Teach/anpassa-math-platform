import React from 'react';
import 'katex/dist/katex.min.css';

const MathText = ({ text, className = "" }) => {
  if (!text) return null;

  return (
    <span 
      className={`math-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: text }} 
    />
  );
};

export default MathText;