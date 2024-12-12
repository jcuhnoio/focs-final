import React from 'react';
import './StateViewer.css';

const StateViewer = ({ currentState, tape, headPosition, machine, machineState }) => {
  const getCurrentTransition = () => {
    if (machineState === "accepted" || machineState === "rejected") {
      return null;
    }

    const currentSymbol = tape[headPosition] || '_';
    return machine.delta.find(([state, symbol]) => 
      state === currentState && symbol === currentSymbol
    );
  };

  const transition = getCurrentTransition();

  return (
    <div className={`state-viewer ${
      machineState === "accepted" ? "accepted" : 
      machineState === "rejected" ? "rejected" : ""
    }`}>
      <h3 className="viewer-title">Current State</h3>
      <div className="state-info">
        <div className="info-row">
          <span className="info-label">Machine State:</span>
          <span className="info-value">Q{currentState}</span>
        </div>
        
        <div className="info-row">
          <span className="info-label">Reading:</span>
          <span className="info-value">{tape[headPosition] || '_'}</span>
        </div>

        {transition && (
          <>
            <div className="info-row">
              <span className="info-label">Transition:</span>
              <span className="info-value">
                (Q{transition[0]}, {transition[1]}) → (Q{transition[2]}, {transition[3]}, {transition[4] === 1 ? 'R' : 'L'})
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Next State:</span>
              <span className="info-value">Q{transition[2]}</span>
            </div>
          </>
        )}

        {machineState === "accepted" && (
          <div className="state-message">Machine Accepted!</div>
        )}
        {machineState === "rejected" && (
          <div className="state-message">Machine Rejected</div>
        )}
      </div>
    </div>
  );
};

export default StateViewer;