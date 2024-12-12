import React, { useState } from 'react';
import './TuringMachineConfig.css';

const TuringMachineConfig = ({ onConfigChange, initialConfig }) => {
  // Custom stringification for the config
  const formatConfig = (config) => {
    // Helper to format arrays inline
    const formatInlineArray = (arr) => {
      return `[${arr.map(item => 
        typeof item === 'string' ? `"${item}"` : item
      ).join(', ')}]`;
    };

    // Format the entire config object
    const formatted = Object.entries(config).map(([key, value]) => {
      if (['delta', 'states', 'alphabet', 'tape_alphabet'].includes(key)) {
        if (key === 'delta') {
          return `  "${key}": [\n    ${value.map(transition => 
            `[${transition.map(item => 
              typeof item === 'string' ? `"${item}"` : item
            ).join(', ')}]`
          ).join(',\n    ')}\n  ]`;
        } else {
          return `  "${key}": ${formatInlineArray(value)}`;
        }
      }
      return `  "${key}": ${JSON.stringify(value)}`;
    }).join(',\n');

    return `{\n${formatted}\n}`;
  };

  const [configText, setConfigText] = useState(formatConfig(initialConfig));
  const [error, setError] = useState(null);

  const handleConfigChange = (e) => {
    const newText = e.target.value;
    setConfigText(newText);
    
    try {
      const parsedConfig = Function(`return ${newText}`)();
      
      if (!parsedConfig.states || !parsedConfig.alphabet || !parsedConfig.tape_alphabet || 
          !parsedConfig.delta || !parsedConfig.start || !parsedConfig.accept || !parsedConfig.reject) {
        throw new Error("Missing required fields in configuration");
      }
      
      setError(null);
      onConfigChange(parsedConfig);
    } catch (err) {
      setError("Invalid configuration format");
    }
  };

  return (
    <div className="config-container">
      <h2 className="config-title">Current Machine</h2>
      <textarea
        className="config-editor"
        value={configText}
        onChange={handleConfigChange}
        spellCheck="false"
        placeholder="Enter Turing machine configuration..."
      />
      {error && <div className="config-error">{error}</div>}
    </div>
  );
};

export default TuringMachineConfig;