Brainlove
=========

A Brainfuck derivative in JavaScript.

# The language
## Commands
```
+		add 1 to the current cell
- 	decrease 1 to the current cell
> 	move right on the tape
< 	move left on the tape
[] 	while the current cell is not 0, do the things in between the brackets
{} 	while the current cell is not null, do the things in between the brackets
~ 	if the cell contains null then change to 0, else null.
$ 	set the register to the current cell's value
! 	set the current cell to the register's value
```
## Basic Usage
```javascript
var script = "+>++>+++<<[[-]>]";
var loaded = Brainlove.load(script);
var finalState = loaded.run();

var fn = Brainlove.function("+>++>+++");
fn(); // 3
Brainlove.function("$[->![->+<]<]>>")(3); // 9
```

# Extending Brainlove
## Adding commands
```javascript
Brainlove.addCommand("@", {
	action: function(state) {
		console.log(state);	
	}
});
```

## Adding optimalizations
```javascript
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
```

More information coming soon!
