const EventEmitter = require('events');
const path = require('path');
const { homedir } = require('os');
const fs = require('fs');
const { promisify } = require('util');
const readdirp = promisify(fs.readdir);

const INTERVAL = 2000;

module.exports = class Finder extends EventEmitter {
	constructor(dir, deep, ext, entry) {
		super();

		this.dir =
			(typeof dir === 'string' &&
				(path.isAbsolute(dir) ? dir : path.join(__dirname, dir))) || 
			homedir();
		this.deep = (typeof deep === 'number' && deep) || 0;
		this.ext = (Array.isArray(ext) && ext) || [];
		this.entry = typeof entry === 'string' && entry || '';

		this.timePassed = 0;
		this.i = 100;
		this.timer = null;

		this.dirsChecked = 0;
		this.filesChecked = 0;

		// Emit events after listeners have been added
		process.nextTick(() => {
			this.emit('started');
			console.time('Search Time');
		});
	}

	parse() {
		this.setTimer();

		// Main logic
		try {
			await this.recursive(this.dir);
		} catch(e) {
			this.emit('error', e);
		}

		// Parsing has been finished
		clearTimeout(this.timer);
		this.emit('finished');
		console.timeEnd('Search Time');
	}

	async recursive(currentPath, level = 0) {
		let checked = false;
		
		// Get promise with a list of dirents
		const direntList = await readdirp(currentPath, {withFileTypes: true});

		for (let dirent of direntList) {

			if (
				dirent.isFile() &&
				(this.ext.includes(path.extname(dirent.name)) || !this.ext.length)
			) {

				if (dirent.name.includes(this.entry)) {
					this.setTimer();

					// Increment count of checked files that accept defined criterias
					this.filesChecked++;

					// Increment count of checked directories that accept defined criterias
					if (!checked) this.dirsChecked++;

					this.emit('file', {
						filePath: path.join(currentPath, dirent.name)
					});

					this.timePassed = 0;
				}

			} else if (dirent.isDirectory() && ++level !== this.deep) {

				try {
					await this.recursive(path.join(currentPath, dirent.name), level++);
				} catch (err) {
					this.emit('error', e);
					return;
				}

			}
		}		
	}

	setTimer() {
		if (this.timer) {
			clearTimeout(this.timer);
		} else {
			this.timer = setTimeout(() => {
			this.emit('processing', {
					dirsChecked: this.dirsChecked,
					filesChecked: this.filesChecked
				});
			this.setTimer();
		}, INTERVAL);
		}	
	}
}