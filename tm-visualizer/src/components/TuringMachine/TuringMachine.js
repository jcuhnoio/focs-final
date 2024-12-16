import React, { useState, useEffect, useRef } from "react";
import Tape from "../Tape/Tape";
import TuringMachineClass from "./TuringMachineClass";
import TuringMachineConfig from "../TuringMachineConfig/TuringMachineConfig";
import StateViewer from '../StateViewer/StateViewer';
import PlaybackControls from '../PlaybackControls/PlaybackControls';
import "./TuringMachine.css";

function TuringMachine() {
  const [tape, setTape] = useState([]);
  const [config, setConfig] = useState({});
  const [headPosition, setHeadPosition] = useState(0);
  const [inputValue, setInputValue] = useState("aaabbb");  // Set default value
  const [history, setHistory] = useState([]);
  const [machineState, setMachineState] = useState("initial");
  const [isPlaying, setIsPlaying] = useState(false);
  
  const TM = useRef(null);
  const playbackRef = useRef(null);

  const machine = {
    states: [1, 2, 3, 4, 777, 666],
    alphabet: ["a", "b"],
    tape_alphabet: ["a", "b", "X", "_"],
    start: 1,
    accept: 777,
    reject: 666,
    delta: [
      [1, "a", 2, "X", 1],
      [1, "b", 3, "X", 1],
      [1, "X", 1, "X", 1],
      [1, "_", 777, "_", 1],
      [2, "a", 2, "a", 1],
      [2, "b", 4, "X", -1],
      [2, "X", 2, "X", 1],
      [2, "_", 666, "_", -1],
      [3, "a", 4, "X", -1],
      [3, "b", 3, "b", 1],
      [3, "X", 3, "X", 1],
      [3, "_", 666, "_", -1],
      [4, "a", 4, "a", -1],
      [4, "b", 4, "b", -1],
      [4, "X", 4, "X", -1],
      [4, "_", 1, "_", 1],
    ],
  };

  useEffect(() => {
    // Initialize with default input
    const defaultInput = "aaabbb";
    TM.current = new TuringMachineClass(machine, defaultInput, config);
    const startResult = TM.current.startTM(machine, defaultInput);
    setTape(startResult.tape);
    setConfig(startResult);
    setInputValue(defaultInput);
  }, []);

  const resetMachine = () => {
    if (playbackRef.current) {
      clearInterval(playbackRef.current);
    }
    
    const currentMachine = TM.current.machine;
    // Use current inputValue or default to empty string
    const currentInput = inputValue || "";
    
    TM.current = new TuringMachineClass(currentMachine, currentInput, {});
    const startResult = TM.current.startTM(currentMachine, currentInput);
    setTape(startResult.tape);
    setConfig(startResult);
    setHeadPosition(0);
    setHistory([]);
    setMachineState("initial");
    setIsPlaying(false);
  };

  const handleConfigChange = (newConfig) => {
    console.log("Step 5 - Received new config in TuringMachine:", newConfig);
    TM.current = new TuringMachineClass(newConfig, inputValue, {});
    console.log("Step 6 - Created new TM instance");
    
    // Force a reset with the new machine
    const startResult = TM.current.startTM(newConfig, inputValue);
    console.log("Step 7 - Start result:", startResult);
    
    setTape(startResult.tape);
    setConfig(startResult);
    setHeadPosition(0);
    setHistory([]);
    setMachineState("initial");
    setIsPlaying(false);
  };

  const moveHead = (direction) => {
    if (direction === "L" && headPosition === 0) {
      setTape(["_", ...tape]);
      setHeadPosition(0);
    } else if (direction === "R" && headPosition === tape.length - 1) {
      setTape([...tape, "_"]);
      setHeadPosition(tape.length);
    } else {
      setHeadPosition(headPosition + (direction === "R" ? 1 : -1));
    }
  };

  const handleStep = (direction = "forward") => {
    if (direction === "forward" && machineState !== "accepted" && machineState !== "rejected") {
      try {
        const stepResult = TM.current.stepTM(TM.current.machine, config);
        if (stepResult.length > 0) {
          const result = stepResult[0];
          setHistory(prev => [...prev, { tape, config, headPosition }]);
          setTape(result.tape);
          setConfig(result);
          
          if (result.moveDir === 1) {
            moveHead("R");
          } else {
            moveHead("L");
          }

          if (TM.current.isAcceptTM(TM.current.machine, result)) {
            setMachineState("accepted");
            window.confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            return false;
          } else if (TM.current.isDoneTM(TM.current.machine, result)) {
            setMachineState("rejected");
            return false;
          }
          return true;
        }
      } catch (error) {
        console.error("Step error:", error);
        return false;
      }
    } else if (direction === "backward" && history.length > 0) {
      const previousState = history[history.length - 1];
      setTape(previousState.tape);
      setConfig(previousState.config);
      setHeadPosition(previousState.headPosition);
      setHistory(prev => prev.slice(0, -1));
    }
    return false;
  };

  const handleInputLoad = (newInput) => {
    setInputValue(newInput);
    TM.current = new TuringMachineClass(TM.current.machine, newInput, {});
    const startResult = TM.current.startTM(TM.current.machine, newInput);
    setTape(startResult.tape);
    setConfig(startResult);
    setHeadPosition(0);
    setHistory([]);
    setMachineState("initial");
  };

  return (
    <div className="turing-container">
      <div className="tape-container">
        <Tape tape={tape} headPosition={headPosition} />
      </div>
      
      <div className="columns-container">
        <div className="config-column">
          <TuringMachineConfig 
            onConfigChange={handleConfigChange}
            initialConfig={machine}
          />
        </div>
        
        <div className="controls-column">
          <PlaybackControls
            onStep={handleStep}
            onReset={resetMachine}
            onInputLoad={handleInputLoad}
            machineState={machineState}
            historyLength={history.length}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackRef={playbackRef}
          />

          <StateViewer 
            currentState={config.state}
            tape={tape}
            headPosition={headPosition}
            machine={TM.current ? TM.current.machine : machine}
            machineState={machineState}
          />
        </div>
      </div>
      
      {machineState === "rejected" && (
        <div className="rejection-animation">
          <span className="frowny">☹️</span>
        </div>
      )}
    </div>
  );
}

export default TuringMachine;