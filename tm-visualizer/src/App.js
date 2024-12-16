import React from 'react';
import TuringMachine from './components/TuringMachine/TuringMachine';

const App = () => {
  return (
    <div className="app">
      <h1 className="title">Turing Machine Visualizer</h1>
      <TuringMachine />
    </div>
  );
};

export default App;