function Calculator() {
    return {
        add:function add(firstNum, secondNum) {
            return firstNum + secondNum;
        }
    };
};

/* istanbul ignore next */
function untested(arg) {
	if (arg > 5) {
		console.log("greater than 5");
	} else {
		console.log("less than 5");
	}
}

module.exports = Calculator;
