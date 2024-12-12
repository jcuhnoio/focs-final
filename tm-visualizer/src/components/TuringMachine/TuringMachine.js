import React, { useState, useEffect, useRef, useCallback } from "react";
import Tape from "../Tape/Tape";
import TuringMachineClass from "./TuringMachineClass";
import "./TuringMachine.css";
import { PlayCircle, PauseCircle, RotateCcw, StepBack, StepForward } from "lucide-react";

function TuringMachine() {
  const [tape, setTape] = useState([]);
  const [config, setConfig] = useState({});
  const [headPosition, setHeadPosition] = useState(0);
  const [inputValue, setInputValue] = useState("aaabbb");
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [machineState, setMachineState] = useState("initial");
  const [speed, setSpeed] = useState(1); // Now represents steps per second
  const playbackRef = useRef(null);
  const TM = useRef(null);

  useEffect(() => {
    TM.current = new TuringMachineClass(machine, inputValue, config);
    resetMachine();
  }, []);

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

  const resetMachine = () => {
    if (playbackRef.current) {
      clearInterval(playbackRef.current);
    }
    TM.current = new TuringMachineClass(machine, inputValue, {});
    const startResult = TM.current.startTM(machine, inputValue);
    setTape(startResult.tape);
    setConfig(startResult);
    setHeadPosition(0);
    setHistory([]);
    setMachineState("initial");
    setIsPlaying(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const loadInput = () => {
    resetMachine();
  };

  const handleStep = useCallback((direction = "forward") => {
    if (direction === "forward" && machineState !== "accepted" && machineState !== "rejected") {
      try {
        const stepResult = TM.current.stepTM(machine, config);
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

          if (TM.current.isAcceptTM(machine, result)) {
            setMachineState("accepted");
            window.confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            stopPlayback();
            return false;
          } else if (TM.current.isDoneTM(machine, result)) {
            setMachineState("rejected");
            stopPlayback();
            return false;
          }
          return true;
        }
      } catch (error) {
        console.error("Step error:", error);
        stopPlayback();
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
  }, [config, headPosition, history, machineState, tape]);

  const startPlayback = useCallback(() => {
    const intervalTime = 1000 / speed;
    
    // Clear any existing interval
    if (playbackRef.current) {
      clearInterval(playbackRef.current);
    }
    
    // Set up the interval for continuous stepping
    playbackRef.current = setInterval(() => {
      const shouldContinue = handleStep("forward");
      if (!shouldContinue) {
        stopPlayback();
      }
    }, intervalTime);
  }, [speed, handleStep]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    if (playbackRef.current) {
      clearInterval(playbackRef.current);
      playbackRef.current = null;
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (!isPlaying) {
      setIsPlaying(true);
      startPlayback();
    } else {
      stopPlayback();
    }
  }, [isPlaying, startPlayback, stopPlayback]);

  // Handle speed changes
  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    }
  }, [speed, isPlaying, startPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, []);

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

  return (
    <div className="turing-container">
      <h1 className="title">Turing Machine Visualizer</h1>
      
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="tape-input">Tape Input:</label>
          <input
            id="tape-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className="neumorphic-input"
            placeholder="Enter tape input..."
          />
          <button 
            className="neumorphic-button"
            onClick={loadInput}
          >
            Load
          </button>
        </div>
      </div>

      <Tape tape={tape} headPosition={headPosition} />
      
      <div className="control-panel">
        <button 
          className="neumorphic-button"
          onClick={() => handleStep("backward")}
          disabled={history.length === 0 || isPlaying}
        >
          <StepBack />
        </button>

        <button 
          className="neumorphic-button play-button"
          onClick={togglePlayback}
          disabled={machineState === "accepted" || machineState === "rejected"}
        >
          {isPlaying ? <PauseCircle /> : <PlayCircle />}
        </button>

        <button 
          className="neumorphic-button"
          onClick={() => handleStep("forward")}
          disabled={isPlaying || machineState === "accepted" || machineState === "rejected"}
        >
          <StepForward />
        </button>

        <button 
          className="neumorphic-button"
          onClick={resetMachine}
        >
          <RotateCcw /> Reset
        </button>
      </div>

      <div className="speed-control">
        <label htmlFor="speed-slider">Speed:</label>
        <input
          id="speed-slider"
          type="range"
          min="1"
          max="10"
          step="0.25"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="neumorphic-slider"
        />
        <span className="speed-value">{speed} steps/s</span>
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