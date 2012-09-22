Brainlove
=========

A Brainfuck derivative in JavaScript.

# Usage
## Basic Usage
	var script = "+>++>+++<<[[-]>]";
	var loaded = Brainlove.load(script);
	var finalState = loaded.run();
Load will load a script and compile it to an intermediate form, some small optimalizations will also be done.
Run will run the compiled script and returns an object containing the final state (pointer, tape etc.) of the program.

## Adding commands
	Brainlove.addCommand("@", {
		action: function(state) {
			console.log(state);	
		}
	});

## Adding optimalizations
	Brainlove.addCommand("addToPrev", {
		action: function(state) {
			var curCellAmount = state.tape.getCell();
			state.tape.addToCell(curCellAmount, state.tape.getPointer()-1);
			state.tape.setCell(0);
		},
		hidden: true
	})
	Brainlove.addCompilerRule("[-<+>]", {
		command: "addToPrev",
		hidden: true
	});

More information coming soon!
