import React from 'react';

const SimpleTextLevel = ({ data }) => {
  return (
    <div className="text-content">
      <p>{data.question}</p>
    </div>
  );
};

// We simply don't add the property, or explicitly set it to false
// SimpleTextLevel.requiresCanvas = false; 

export default SimpleTextLevel;