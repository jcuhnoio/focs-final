import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, PauseCircle, RotateCcw, StepBack, StepForward } from "lucide-react";
import './PlaybackControls.css';

const PlaybackControls = ({
    onStep, 
    onReset, 
    onInputLoad,
    machineState,
    historyLength,
    defaultInput = "aaabbb"  // Add default value
  }) => {
    const [inputValue, setInputValue] = useState(defaultInput);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1);
    const playbackRef = useRef(null);
  
    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };
  
    const loadInput = () => {
      // If input is empty or undefined, use an empty array
      const input = inputValue?.trim() || "";
      onInputLoad(input);
    };

  const startPlayback = useCallback(() => {
    const intervalTime = 1000 / speed;
    
    if (playbackRef.current) {
      clearInterval(playbackRef.current);
    }
    
    playbackRef.current = setInterval(() => {
      const shouldContinue = onStep("forward");
      if (!shouldContinue) {
        stopPlayback();
      }
    }, intervalTime);
  }, [speed, onStep]);

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

  useEffect(() => {
    if (isPlaying) {
      startPlayback();
    }
  }, [speed, isPlaying, startPlayback]);

  useEffect(() => {
    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, []);

  return (
    <div className="controls-container">
      <div className="input-group">
        <input
          id="tape-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="neumorphic-input"
          placeholder="Tape Input"
        />
        <button 
          className="controls-button action-button"
          onClick={loadInput}
        >
          Load
        </button>
      </div>

      <div className="control-panel">
        <div className="playback-controls">
          <button 
            className="controls-button playback-button"
            onClick={() => onStep("backward")}
            disabled={historyLength === 0 || isPlaying}
          >
            <StepBack />
          </button>

          <button 
            className="controls-button playback-button"
            onClick={togglePlayback}
            disabled={machineState === "accepted" || machineState === "rejected"}
          >
            {isPlaying ? <PauseCircle /> : <PlayCircle />}
          </button>

          <button 
            className="controls-button playback-button"
            onClick={() => onStep("forward")}
            disabled={isPlaying || machineState === "accepted" || machineState === "rejected"}
          >
            <StepForward />
          </button>
        </div>

        <button 
          className="controls-button action-button"
          onClick={onReset}
        >
          <RotateCcw /> Reset
        </button>
      </div>

      <div className="speed-control">
        <input
          id="speed-slider"
          type="range"
          min="1"
          max="15"
          step="0.05"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="neumorphic-slider"
        />
      </div>
    </div>
  );
};

export default PlaybackControls;