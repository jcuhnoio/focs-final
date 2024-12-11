import React, { useState } from "react";
import Tape from "../Tape/Tape";
import TuringMachineClass from "./TuringMachineClass";

function TuringMachine() {
  const [tape, setTape] = useState([]); // Initial tape
  const [config, setConfig] = useState([]);
  const [headPosition, setHeadPosition] = useState(0);

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

  const input = "aaabbb";

  const TM = new TuringMachineClass(machine, input, config);

  const handleStep = (e) => {
    try {
      const stepResult = TM.stepTM(machine, config);
      console.log(stepResult.length);
      if (stepResult.length > 1) {
        console.log("undeterministic machine");
      } else {
        const result = stepResult[0];
        setTape(result.tape);
        setConfig(result);
        if (config.moveDir === 1) {
          moveHead("R");
        } else moveHead("L");
      }
    } catch (error) {
      const startResult = TM.startTM(machine, input);
      setTape(startResult.tape);
      setConfig(startResult);
    }
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

  return (
    <div>
      <h1>Turing Machine Visualizer</h1>
      <Tape tape={tape} headPosition={headPosition} />
      <div>
        <button onClick={handleStep}>Step turing machine</button>
      </div>
    </div>
  );
}

export default TuringMachine;
