var Test = {};
Test.tests = {};
Test.failValue = "Failed";
Test.passValue = "Passed";

Test.addTest = function(name, fn, exp, strict) {
	Test.tests[name] = {fn: fn, exp: exp, strict: strict == undefined? true: strict};
}

Test.runTests = function(names) {
	Test.results = {};
	for(var i = 0; i < names.length; i++) {
		var k = names[i];
		var c = Test.tests[k];
		var r = c.fn();
		if(c.strict)
			Test.results[k] = r === c.exp? Test.passValue: Test.failValue;
		else
			Test.results[k] = r == c.exp? Test.passValue: Test.failValue;
	}
	return Test.results;
}

Test.runAllTests = function() {
	Test.results = {};
	var all = {};
	for(var k in Test.tests) {
		var c = Test.tests[k];
		var r = c.fn();
		var o = {
			expected: c.exp,
			result: r
		};
		var s;
		if(c.strict)
			s = r === c.exp? Test.passValue: Test.failValue;
		else
			s = r == c.exp? Test.passValue: Test.failValue;
		o.passed = s;
		all[k] = s;
		Test.results[k] = o;
		Test.results._all = all;
	}
	return Test.results;
}

// Tests
Test.addTest("Basic 1", function() {
	return Brainlove.load("+>++>+++").run().tape.tape.toString();
}, [1, 2, 3].toString());
Test.addTest("Basic 2", function() {
	return Brainlove.load("+++[->+<]").run().tape.tape.toString();
}, [0, 3].toString());
Test.addTest("Basic 3", function() {
	return Brainlove.load("+++[>+<-]").run().tape.tape.toString();
}, [0, 3].toString());
Test.addTest("Basic 4", function() {
	return Brainlove.load("+++$[->![->+<]<]>>$[-]>!").run().tape.tape.toString();
}, [0, 0, 0, 9].toString());
Test.addTest("Basic 5", function() {
	return Brainlove.load("++>++>++<<[[-]>]").run().tape.tape.toString();
}, [0, 0, 0, 0].toString());
Test.addTest("Function 1", Brainlove.function("+>++>+++"), 3);
Test.addTest("Function 2", function() {
	return Brainlove.function("$[->![->+<]<]>>")(3);
}, 9);
Test.addTest("Function 3", function() {
	return Brainlove.function("[->+<]>[->+<]>")(1, 2, 3);
}, 6);
Test.addTest("addCommand/deleteCommand", function() {
	Brainlove.addCommand("a", {
		action: function(state) {
			state.tape.setCell("a");
		}
	});
	var r = Brainlove.function("+>a")();
	Brainlove.deleteCommand("a");
	return r;
}, "a");
Test.addTest("Null 1", Brainlove.function("~"), null);
Test.addTest("Null 2", Brainlove.function("~~"), 0);
Test.addTest("Null 3", Brainlove.function("{~}"), null);
Test.addTest("Null 4", function() {
	return Brainlove.load("+>++>+++>~").run().tape.tape.toString();
}, [1, 2, 3, null].toString());
Test.addTest("Null 5", Brainlove.function("~{~}"), null);
Test.addTest("Null 6", function() {
	var x = Brainlove.load("+>++>+++>~<<<{~>}").run();
	return x.tape.tape.toString();
}, [null, null, null, null].toString());
