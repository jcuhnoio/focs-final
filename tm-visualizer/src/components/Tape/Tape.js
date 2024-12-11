import React from "react";
import "./Tape.css"; // Add styling for the tape

function Tape({ tape, headPosition }) {
  return (
    <div className="tape">
      {tape.map((cell, index) => (
        <div
          key={index}
          className={`cell ${index === headPosition ? "active" : ""}`}
        >
          {cell || "_"} {/* Display underscore for empty cells */}
        </div>
      ))}
    </div>
  );
}

export default Tape;
