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
	for(var k in Test.tests) {
		var c = Test.tests[k];
		var r = c.fn();
		if(c.strict)
			Test.results[k] = r === c.exp? Test.passValue: Test.failValue;
		else
			Test.results[k] = r == c.exp? Test.passValue: Test.failValue;
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
