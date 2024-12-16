import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, PauseCircle, RotateCcw, StepBack, StepForward } from "lucide-react";
import './PlaybackControls.css';

const PlaybackControls = ({ 
    onStep, 
    onReset, 
    onInputLoad,
    machineState,
    historyLength,
    defaultInput
  }) => {
  const [inputValue, setInputValue] = useState(defaultInput);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playbackRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const loadInput = () => {
    onInputLoad(inputValue);
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
          className="neumorphic-button action-button"
          onClick={loadInput}
        >
          Load
        </button>
      </div>

      <div className="control-panel">
        <div className="playback-controls">
          <button 
            className="neumorphic-button playback-button"
            onClick={() => onStep("backward")}
            disabled={historyLength === 0 || isPlaying}
          >
            <StepBack />
          </button>

          <button 
            className="neumorphic-button playback-button"
            onClick={togglePlayback}
            disabled={machineState === "accepted" || machineState === "rejected"}
          >
            {isPlaying ? <PauseCircle /> : <PlayCircle />}
          </button>

          <button 
            className="neumorphic-button playback-button"
            onClick={() => onStep("forward")}
            disabled={isPlaying || machineState === "accepted" || machineState === "rejected"}
          >
            <StepForward />
          </button>
        </div>

        <button 
          className="neumorphic-button action-button"
          onClick={onReset}
        >
          <RotateCcw /> Reset
        </button>
      </div>

      <div className="speed-control">
        <input
          id="speed-slider"
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="neumorphic-slider"
        />
        <span className="speed-value">{speed} steps/s</span>
      </div>
    </div>
  );
};

export default PlaybackControls;