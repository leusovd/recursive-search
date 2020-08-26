require('./logger.js');
const { getArgs, getExtEnv } = require('./helpers.js');
const Finder = require('./finder.js');

const { path, deep, s } = getArgs();
const ext = getExtEnv();

const finder = new Finder(path, deep, ext, s);

finder.on('started', () => {
	console.log('FINDER STARTED!');
	finder.parse();
});

finder.on('file', data => {
	console.log(data.filePath);
});

finder.on('processing', data => {
	const { dirsChecked, filesChecked } = data;
	console.log(`PROCESSING... Dirs checked: ${dirsChecked}, Files checked: ${filesChecked}`);
});

finder.on('finished', () => {
	console.log('FINDER FINISHED');
});