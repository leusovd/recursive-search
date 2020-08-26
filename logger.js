const chalk = require('chalk');
const { getArgs } = require('./helpers.js');

const origFn = console.log;
let { colors } = getArgs();


colors = colors && Array.isArray(colors) && colors.length && colors || ['red', 'green', 'blue'];
let c = 0;

console.log = function(...args) {
	// Replace arguments with colored ones
	args = args.map(arg => chalk.keyword(colors[c])(arg));

	//Call function with colored arguments
	origFn.apply(console, args);

	//Set next color
	c = c === colors.length - 1 ? 0 : c + 1;
};