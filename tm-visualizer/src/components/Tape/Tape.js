import React from 'react';
import './Tape.css';

const Tape = ({ tape, headPosition }) => {
  const EXTRA_CELLS = 10;
  const leftPadding = Array(EXTRA_CELLS).fill('_');
  const rightPadding = Array(EXTRA_CELLS).fill('_');
  const fullTape = [...leftPadding, ...tape, ...rightPadding];
  
  const cellWidth = 76; // 60px width + 16px margin
  const transformStyle = {
    transform: `translateX(calc(50vw - ${(headPosition + EXTRA_CELLS + 0.5) * cellWidth}px - ${cellWidth/2}px))`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
  };

  return (
    <div className="tape">
      <div className="tape-content" style={transformStyle}>
        {fullTape.map((cell, index) => (
          <div
            key={index}
            className={`cell ${index === headPosition + EXTRA_CELLS ? 'active' : ''}`}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tape;