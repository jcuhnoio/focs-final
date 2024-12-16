import React, { useState, useEffect, useRef } from 'react';
import './StateViewer.css';

const StateViewer = ({ currentState, tape, headPosition, machine, machineState, historyLength }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState('initial');
  const [isReversing, setIsReversing] = useState(false);
  const lastMachineState = useRef(null);
  const previousHistoryLength = useRef(historyLength);
  const previousDisplayContent = useRef(displayContent);

  useEffect(() => {
    // Check if we're stepping backward (history length decreased)
    const steppingBackward = historyLength < previousHistoryLength.current;
    previousHistoryLength.current = historyLength;
    
    // Handle stepping backward from final state
    if (steppingBackward && previousDisplayContent.current === 'final') {
      setIsReversing(true);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setDisplayContent('initial');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(false);
            setIsReversing(false);
            lastMachineState.current = null;
          });
        });
      }, 600);
    }
    // Handle entering final state
    else if (machineState === "accepted" || machineState === "rejected") {
      lastMachineState.current = machineState;
      setIsReversing(false);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setDisplayContent('final');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(false);
          });
        });
      }, 600);
    }
    // Handle leaving final state (reset or new input)
    else if (previousDisplayContent.current === 'final') {
      setIsReversing(true);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setDisplayContent('initial');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(false);
            setIsReversing(false);
            lastMachineState.current = null;
          });
        });
      }, 600);
    }
    // Regular state updates
    else {
      setIsTransitioning(false);
      setDisplayContent('initial');
      setIsReversing(false);
      lastMachineState.current = null;
    }

    previousDisplayContent.current = displayContent;
  }, [machineState, historyLength, displayContent]);

  const getCurrentTransition = () => {
    const currentSymbol = tape[headPosition] || '_';
    return machine.delta.find(([state, symbol]) => 
      state === currentState && symbol === currentSymbol
    );
  };

  const transition = getCurrentTransition();

  const renderStateContent = () => (
    <div className={`state-viewer ${isTransitioning ? 'transitioning' : ''} ${isReversing ? 'reversing' : ''}`}>
      <div className="state-content">
        <div>
          <span className="info-label">Machine State:</span>
          State {currentState}
        </div>
        
        <div>
          <span className="info-label">Reading:</span>
          {tape[headPosition] || '_'}
        </div>

        <div>
          <span className="info-label">Transition:</span>
          {machineState === "accepted" || machineState === "rejected" ? 
            `State ${machineState === "accepted" ? "Accepted" : "Rejected"}` : 
            transition ? 
              `(State ${transition[0]}, ${transition[1]}) → (State ${transition[2]}, ${transition[3]}, ${transition[4] === 1 ? 'Right' : 'Left'})` :
              null
          }
        </div>

        <div>
          <span className="info-label">Next State:</span>
          {machineState === "accepted" || machineState === "rejected" ? 
            `State ${machineState === "accepted" ? "Accepted" : "Rejected"}` : 
            transition ? 
              `State ${transition[2]}` :
              null
          }
        </div>
      </div>
    </div>
  );

  const renderFinalContent = () => (
    <div className={`state-viewer final-state ${isTransitioning ? 'transitioning' : ''} ${isReversing ? 'reversing' : ''}`}>
      <div className="neumorphic-text">
        {lastMachineState.current === "accepted" ? "ACCEPT" : "REJECT"}
      </div>
    </div>
  );

  return displayContent === 'final' ? renderFinalContent() : renderStateContent();
};

export default StateViewer;