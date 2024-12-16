// components/TuringMachineConfig/TuringMachineConfig.js
import React, { useState } from 'react';
import './TuringMachineConfig.css';

const TuringMachineConfig = ({ onConfigChange, initialConfig }) => {
  const [configText, setConfigText] = useState(formatConfig(initialConfig));
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentConfig, setCurrentConfig] = useState(initialConfig);

  // Custom stringification for the config
  function formatConfig(config) {
    const formatInlineArray = (arr) => {
      return `[${arr.map(item => 
        typeof item === 'string' ? `"${item}"` : item
      ).join(', ')}]`;
    };

    const formatDeltaTransitions = (transitions) => {
      return transitions.map(transition => 
        `(${transition.map(item => 
          typeof item === 'string' ? `'${item}'` : item
        ).join(', ')})`
      ).join(',\n    ');
    };

    const formatted = Object.entries(config).map(([key, value]) => {
      if (key === 'delta') {
        return `  "${key}": [\n    ${formatDeltaTransitions(value)}\n  ]`;
      } else if (['states', 'alphabet', 'tape_alphabet'].includes(key)) {
        return `  "${key}": ${formatInlineArray(value)}`;
      }
      return `  "${key}": ${JSON.stringify(value)}`;
    }).join(',\n');

    return `{\n${formatted}\n}`;
  }

  const convertTuplesToArrays = (configText) => {
    // First, we'll handle the delta array specifically
    let modifiedText = configText;
    
    // Find the delta section
    const deltaMatch = configText.match(/"delta"\s*:\s*\[([\s\S]*?)\]/);
    if (deltaMatch) {
      const deltaContent = deltaMatch[1];
      
      // Convert each tuple to an array
      const convertedDelta = deltaContent.replace(/\(([^)]+)\)/g, (match, contents) => {
        return `[${contents}]`;
      });
      
      // Replace the original delta content with the converted content
      modifiedText = configText.replace(deltaMatch[0], `"delta": [${convertedDelta}]`);
    }
    
    return modifiedText;
  };

  const loadConfig = () => {
    try {
      setError(null);
      setSuccessMessage(null);
  
      // Convert tuples to arrays before parsing
      const convertedConfig = convertTuplesToArrays(configText);
      console.log("Step 1 - Converted config:", convertedConfig);
  
      // Parse the converted configuration
      let parsedConfig;
      try {
        parsedConfig = Function(`return ${convertedConfig}`)();
        console.log("Step 2 - Parsed config:", parsedConfig);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Invalid configuration format. Please check your syntax.");
      }
  
      // Validate the configuration
      validateConfig(parsedConfig);
      console.log("Step 3 - Validation passed");
      
      // Update the current configuration
      setCurrentConfig(parsedConfig);
      console.log("Step 4 - Calling onConfigChange with:", parsedConfig);
      onConfigChange(parsedConfig);
      
      setSuccessMessage("Machine configuration loaded successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(`Configuration error: ${err.message}`);
    }
  };

  const validateConfig = (config) => {
    try {
      // Check if config is an object
      if (typeof config !== 'object' || config === null) {
        throw new Error("Configuration must be an object");
      }

      // Check required fields
      const requiredFields = ['states', 'alphabet', 'tape_alphabet', 'delta', 'start', 'accept', 'reject'];
      for (const field of requiredFields) {
        if (!(field in config)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Check that arrays are arrays and not empty
      ['states', 'alphabet', 'tape_alphabet', 'delta'].forEach(field => {
        if (!Array.isArray(config[field])) {
          throw new Error(`${field} must be an array`);
        }
        if (config[field].length === 0) {
          throw new Error(`${field} cannot be empty`);
        }
      });

      // Check that start, accept, and reject states are in states array
      if (!config.states.includes(config.start)) {
        throw new Error(`Start state ${config.start} must be in states array`);
      }
      if (!config.states.includes(config.accept)) {
        throw new Error(`Accept state ${config.accept} must be in states array`);
      }
      if (!config.states.includes(config.reject)) {
        throw new Error(`Reject state ${config.reject} must be in states array`);
      }

      // Validate delta transitions
      config.delta.forEach((transition, index) => {
        if (!Array.isArray(transition) || transition.length !== 5) {
          throw new Error(`Invalid transition at index ${config.tape_alphabet}: must be array of length 5, it is length ${transition.length}`);
        }
        const [state, symbol, nextState, writeSymbol, move] = transition;
        
        if (!config.states.includes(state)) {
          throw new Error(`Invalid state ${state} in transition ${index}`);
        }
        if (!config.states.includes(nextState)) {
          throw new Error(`Invalid next state ${nextState} in transition ${index}`);
        }
        if (!config.tape_alphabet.includes(symbol)) {
          throw new Error(`Invalid symbol ${symbol} in transition ${index}`);
        }
        if (!config.tape_alphabet.includes(writeSymbol)) {
          throw new Error(`Invalid write symbol ${writeSymbol} in transition ${index}`);
        }
        if (![1, -1].includes(move)) {
          throw new Error(`Invalid move direction ${move} in transition ${index}: must be 1 (right) or -1 (left)`);
        }
      });

    } catch (err) {
      throw new Error(err.message);
    }
  };

  const handleConfigTextChange = (e) => {
    setConfigText(e.target.value);
    // Clear messages when user starts typing
    setError(null);
    setSuccessMessage(null);
  };

  const resetConfig = () => {
    setConfigText(formatConfig(initialConfig));
    setCurrentConfig(initialConfig);
    onConfigChange(initialConfig);
    setError(null);
    setSuccessMessage("Configuration reset to initial machine");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="config-container">
      <h2 className="config-title">Machine Configuration</h2>
      <div className="config-instructions">
        <p>Format your machine configuration with the following fields:</p>
        <ul>
          <li>states: array of state numbers</li>
          <li>alphabet: array of input symbols</li>
          <li>tape_alphabet: array of tape symbols</li>
          <li>start: starting state number</li>
          <li>accept: accepting state number</li>
          <li>reject: rejecting state number</li>
          <li>delta: array of transitions as tuples (currentState, readSymbol, nextState, writeSymbol, moveDirection)</li>
        </ul>
        <p className="config-example">Example transition: (1, 'a', 2, 'X', 1)</p>
      </div>
      <textarea
        className="config-editor"
        value={configText}
        onChange={handleConfigTextChange}
        spellCheck="false"
        placeholder="Enter Turing machine configuration..."
      />
      <div className="config-buttons">
        <button
          className="config-button load-button"
          onClick={loadConfig}
        >
          Load Configuration
        </button>
        <button
          className="config-button reset-button"
          onClick={resetConfig}
        >
          Reset to Initial
        </button>
      </div>
      {error && <div className="config-error">{error}</div>}
      {successMessage && <div className="config-success">{successMessage}</div>}
    </div>
  );
};

export default TuringMachineConfig;