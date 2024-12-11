class TuringMachineClass{
  constructor(machine, input, config) {
    this.machine = machine;
    this.input = input;
    this.config = config;
  }

  startTM(machine, input) {
    return {
      state: machine.start,
      tape: input.split(""),
      head: 0,
    };
  }

  isAcceptTM(machine, config) {
    return config.state === machine.accept;
  }

  isDoneTM(machine, config) {
    return config.state === machine.accept || config.state === machine.reject;
  }

  stepTM(machine, config) {
    const results = [];
    const currentTape = [...config.tape];
  
    // Extend tape to the right if needed
    if (config.head === currentTape.length) {
      currentTape.push("_");
    }
  
    // Extend tape to the left if needed
    if (config.head < 0) {
      currentTape.unshift("_");
      config.head = 0;
    }
  
    // Process transitions
    for (const transition of machine.delta) {
      const [currentState, readSymbol, nextState, writeSymbol, moveDirection] =
        transition;
  
      if (
        currentState === config.state &&
        readSymbol === currentTape[config.head]
      ) {
        const newTape = [...currentTape];
        newTape[config.head] = writeSymbol;
  
        const newHead = config.head + moveDirection;
  
        results.push({
          state: nextState,
          tape: newTape,
          head: newHead,
          moveDir: moveDirection
        });
      }
    }
  
    // If no valid transitions, return reject state
    if (results.length === 0) {
      this.printConfig(results.config)
      return [
        {
          state: machine.reject,
          tape: currentTape,
          head: config.head + 1, // Arbitrary move for reject
        },
      ];
    }
  
    return results;
  }

  printConfig(config) {
    console.log(
      `State: ${config.state}, Tape: ${config.tape}, Head: ${config.head + 1}`
    );
  }
}

export default TuringMachineClass
