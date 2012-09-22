// Tape object
var Tape = function(tape, ptr) {
	this.tape = tape || [0];
	this.ptr = ptr || 0;
};

Tape.prototype.extendCheck = function(i) {
	if(i >= this.tape.length)
		this.extend(i - this.tape.length + 1);
}

Tape.prototype.extend = function(n) {
	for(var i = 0; i < n; i++)
		this.tape.push(0);
	return this.tape.length;
};

Tape.prototype.getTapeLength = function() {return this.tape.length};

Tape.prototype.move = function(n) {
	var n = n || 1;
	if(n > 0)
		return this.moveRight(n);
	else
		return this.moveLeft(-n);
}

Tape.prototype.moveLeft = function(n) {
	var n = n || 1;
	this.ptr -= n;
	this.ptr = this.ptr < 0? 0: this.ptr;
	return this.ptr;
};

Tape.prototype.moveRight = function(n) {
	var n = n || 1;
	this.ptr += n;
	this.extendCheck(this.ptr);
	return this.ptr;
};

Tape.prototype.getPointer = function() {return this.ptr};

Tape.prototype.getCell = function() {return this.tape[this.ptr]};

Tape.prototype.addToCell = function(n, i) {
	var i = i || this.ptr;
	this.extendCheck(i);
	this.tape[i] += n;
}

Tape.prototype.setCell = function(n, i) {
	var i = i || this.ptr;
	this.extendCheck(i);
	this.tape[i] = n;
}

// Brainlove
var Brainlove = {};

// Commands
Brainlove.commands = {};
Brainlove.hiddenCommands = {};
Brainlove.addCommand = function(cmd, obj) {
	if(obj.hidden === false || obj.hidden === undefined)
		Brainlove.commands[cmd] = obj;
	else
		Brainlove.hiddenCommands[cmd] = obj;
};

// CompilerRules
Brainlove.compilerRules = {};
Brainlove.compilerRulesKeys = [];
Brainlove.addCompilerRule = function(target, repl) {
	Brainlove.compilerRules[target] = repl;
	Brainlove.compilerRulesKeys.push(target);
};

Brainlove.regexRulesBefore = [];
Brainlove.regexRulesAfter = [];
Brainlove.addRegexRule = function(reg, repl, after) {
	if(after)
		Brainlove.regexRulesAfter.push({reg: reg, repl: repl});
	else
		Brainlove.regexRulesBefore.push({reg: reg, repl: repl});
}

// Compiling
Brainlove.nextBracket = function(script, index, openb, closeb) {
	var n = 1;
	for(var i = index+1; i < script.length; i++) {
		var c = script[i];
		if(c.command === openb) {
			n++;
		} else if(c.command === closeb) {
			n--;
			if(n === 0)
				return i;
		}
	}
};

Brainlove.prevBracket = function(script, index, openb, closeb) {
	var n = 1;
	for(var i = index-1; i >= 0; i--) {
		var c = script[i];
		if(c.command === openb) {
			n--;
			if(n === 0)
				return i; 
		} else if(c.command === closeb) {
			n++;
		}
	}
};

Brainlove.cleanScript = function(script) {
	var coms = [];
	for(var c in Brainlove.commands) {
		coms.push(c);
	}
	var r = "";
	for(var i in script) {
		var c = script[i];
		if(coms.indexOf(c) != -1)
			r += c;
	}
	return r;
};

Brainlove.commandCopy = function(c, i, cmd) {
	return {
		command: c,
		index: i,
		action: cmd.action || false,
		hidden: cmd.hidden || false,
		count: 1,
		afterOpt: cmd.afterOpt || false,
		creation: cmd.creation || false,
		stack: cmd.stack == undefined? true: cmd.stack
	};
}

Brainlove.runRegexRules = function(ar, script) {
	var s = script;
	for(var i = 0; i < ar.length; i++)
		s = s.replace(ar[i].reg, ar[i].repl);
	return s;
}

Brainlove.compile = function(script) {
	var compScript = [];
	var script = Brainlove.runRegexRules(Brainlove.regexRulesBefore, script);
	var reScript = Brainlove.cleanScript(script);
	reScript = Brainlove.runRegexRules(Brainlove.regexRulesAfter, reScript);
	for(var i = 0; i < reScript.length; i++) {
		var c = reScript[i];
		var a = Brainlove.commands[c];
		if(a !== undefined) {
			var n = Brainlove.commandCopy(c, i, a);
			if(n.creation !== false)
				n.creation(n, reScript);
			compScript.push(n);
		}
	}
	return compScript;
};

Brainlove.optimize = function(script) {
	// compiler rules
	function match(s) {
		for(var i = 0; i < Brainlove.compilerRulesKeys.length; i++) {
			if(s === Brainlove.compilerRulesKeys[i].substring(0, s.length))
				return i;
		}
		return -1;
	};
	var str = "";
	for(var i = 0; i < script.length; i++) {
		str += script[i].command;
		var mt = match(str);
		if(mt >= 0) {
			if(str === Brainlove.compilerRulesKeys[mt]) {
				var len = str.length;
				var from = i-len+1;
				var fnm = Brainlove.compilerRules[str];
				if(Array.isArray(fnm)) {
					var tot = [];
					for(var j = 0; j < fnm.length; j++) {
						var cur = fnm[j];
						var fnt = (cur.hidden? Brainlove.hiddenCommands: Brainlove.commands)[cur.command];
						var cmd = Brainlove.commandCopy(cur.command, from+j, fnt);
						tot.push(cmd);
					}
					var res = [from, len].concat(tot);
					script.splice.apply(script, res);
					i -= tot.length;
				} else {
					var fnt = (fnm.hidden? Brainlove.hiddenCommands: Brainlove.commands)[fnm.command];
					var cmd = Brainlove.commandCopy(fnm.command, from, fnt);
					script.splice(from, len, cmd);
					i--;
				}
				if(i < script.length)
					str = script[i].command;
			}
		} else
			str = script[i].command;
	}
	// optimize count
	var ao = [];
	var ct = "";
	for(var i = 0; i < script.length; i++) {
		var co = script[i];
		co.index = i;
		if(co.afterOpt !== false)
			ao.push(co);
		if(co.stack && ct === co.command) {
			script[i-1].count++;
			script.splice(i, 1);
			i--;
		}
		ct = co.command; 
	}
	// afterOpt
	for(var i = 0; i < ao.length; i++)
		ao[i].afterOpt(ao[i], script)
	return script;
};


// Running/loading
Brainlove.run = function(script, state) {
	state.script = script;
	for(state.i = 0; state.i < script.length; state.i++) {
		var cur = script[state.i];
		for(var c = 0; c < cur.count; c++)
			cur.action(state);
	}
	return state;
};

Brainlove.load = function(script) {
	var r = {};
	r.script = script;
	r.compiled = Brainlove.optimize(Brainlove.compile(script));
	r.state = {tape: new Tape()};
	r.run = function() {return Brainlove.run(r.compiled, r.state)};
	return r;
};

// standard commands/rules
Brainlove.addCommand("+", {
	action: function(state) {
		state.tape.addToCell(1);
	}
});
Brainlove.addCommand("-", {
	action: function(state) {
		state.tape.addToCell(-1);
	}
});
Brainlove.addCommand(">", {
	action: function(state) {
		state.tape.moveRight(1);
	}
});
Brainlove.addCommand("<", {
	action: function(state) {
		state.tape.moveLeft(1);
	}
});
Brainlove.addCommand("[", {
	action: function(state) {
		state.i = state.tape.getCell() === 0? state.script[state.i].corBracket: state.i;
	},
	afterOpt: function(self, script) {
		self.corBracket = Brainlove.nextBracket(script, self.index, "[", "]");
	},
	stack: false
});
Brainlove.addCommand("]", {
	action: function(state) {
		state.i = state.tape.getCell() !== 0? state.script[state.i].corBracket: state.i;
	},
	afterOpt: function(self, script) {
		self.corBracket = Brainlove.prevBracket(script, self.index, "[", "]");
	},
	stack: false
});
Brainlove.addCommand("$", {
	action: function(state) {
		state.reg = state.tape.getCell();
	}
});
Brainlove.addCommand("!", {
	action: function(state) {
		state.tape.setCell(state.reg);
	}
});

Brainlove.addCommand("clearCell", {
	action: function(state) {
		state.tape.setCell(0);
	},
	hidden: true
});
Brainlove.addCommand("addToNext", {
	action: function(state) {
		state.tape.addToCell(state.tape.getCell(), state.tape.getPointer()+1);
		state.tape.setCell(0);
	},
	hidden: true
});

Brainlove.addCompilerRule("[-]", {command: "clearCell", hidden: true});
Brainlove.addCompilerRule("[->+<]", {command: "addToNext", hidden: true});
