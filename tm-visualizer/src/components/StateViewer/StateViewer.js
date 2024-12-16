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
      <div>
        <span className="info-label">Machine State:</span>
        Q{currentState}
      </div>
      
      <div>
        <span className="info-label">Reading:</span>
        {tape[headPosition] || '_'}
      </div>

      {transition && (
        <>
          <div>
            <span className="info-label">Transition:</span>
            (Q{transition[0]}, {transition[1]}) → (Q{transition[2]}, {transition[3]}, {transition[4] === 1 ? 'R' : 'L'})
          </div>
          <div>
            <span className="info-label">Next State:</span>
            Q{transition[2]}
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
  );
};

export default StateViewer;