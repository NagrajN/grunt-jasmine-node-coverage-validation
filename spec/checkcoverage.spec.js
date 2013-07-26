var CheckCoverage = require('../tasks/CheckCoverage.js');

describe("CheckCoverage", function() {

	var summarizeCoverageFake;
	var optionsFake;

	beforeEach(function(){

		summarizeCoverageFake = {
			branches : {
				pct : 0
			},
			functions : {
				pct : 0
			},
			lines : {
				pct : 0
			},
			statements : {
				pct : 0
			}

		}

		optionsFake = {
			branches : 0,
			functions : 0,
			lines : 0,
			statements :0
		} 

	})

	it("should return true if options is undefined", function(){
		expect(CheckCoverage({})).toBe(true);
	})	

	it("should return false if coverage is undefined", function(){
		expect(CheckCoverage()).toBe(false);
	})		

	it("should return true if branches functions \
		lines statements in options is undefined", function(){
		expect(CheckCoverage({},{})).toBe(true);
	})

	it("should return true if opt failTask is undefined", function(){
		optionsFake.branches = 100;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(true);
	})

	it("should return false if cov branches < opt branches", function(){
		optionsFake.failTask = true;
		summarizeCoverageFake.branches.pct = 0;
		optionsFake.branches = 100;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(false);
	})

	it("should return false if cov functions < opt functions", function(){
		optionsFake.failTask = true;		summarizeCoverageFake.functions.pct = 0;
		optionsFake.functions = 100;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(false);
	})

	it("should return false if cov lines < opt lines ", function(){
		optionsFake.failTask = true;		summarizeCoverageFake.lines.pct = 0;
		optionsFake.lines = 100;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(false);
	})

	it("should return false if cov statements < opt statements", function(){
		optionsFake.failTask = true;		summarizeCoverageFake.statements.pct = 0;
		optionsFake.statements = 100;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(false);
	})			

	it("should return false if all options compare incorrectly", function(){
		optionsFake.failTask = true;		summarizeCoverageFake.branches.pct = 0;
		optionsFake.branches = 100;
		summarizeCoverageFake.functions.pct = 0;
		optionsFake.functions = 100;
		summarizeCoverageFake.lines.pct = 0;
		optionsFake.lines = 100;
		summarizeCoverageFake.statements.pct = 0;
		optionsFake.statements = 100;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(false);
	})		

	it("should return true if all options compare correctly", function(){
		optionsFake.failTask = true;
		summarizeCoverageFake.branches.pct = 100;
		optionsFake.branches = 0;
		summarizeCoverageFake.functions.pct = 100;
		optionsFake.functions = 0;
		summarizeCoverageFake.lines.pct = 100;
		optionsFake.lines = 0;
		summarizeCoverageFake.statements.pct = 100;
		optionsFake.statements = 0;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(true);
	})					

	it("should return false if some options compare incorrectly", function(){
		optionsFake.failTask = true;		
		summarizeCoverageFake.branches.pct = 0;
		optionsFake.branches = 100;
		summarizeCoverageFake.functions.pct = 100;
		optionsFake.functions = 0;
		summarizeCoverageFake.lines.pct = 0;
		optionsFake.lines = 100;
		summarizeCoverageFake.statements.pct = 100;
		optionsFake.statements = 0;
		expect(CheckCoverage(summarizeCoverageFake,optionsFake)).toBe(false);
	})	

})