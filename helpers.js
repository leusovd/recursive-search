function parse(str) {

	// Empty array
	if ((/^\[\]$/).test(str)) {
		return [];
	}

	// Filled array
	if (/^\[.*\]$/.test(str)) {
		return str
			.slice(1, str.length - 1)
			.split(',')
			.map(str => str.replace(/\'|\"/g, ''));
	}

	// Number
	if (!isNaN(+str)) {
		return +str;
	}

	// String
	return str;
}

exports.getArgs = () => {
	const raw = process.argv;

	return raw.reduce((acc, cur) => {

		if ((/^\-\-/).test(cur)) {
			const entry = cur.split('=');
			const key = entry[0].slice(2);
			let value = entry[1];

			acc[key] = parse(value);
		}
		
		return acc;

	}, {});
};

exports.EXT = () => {
	const raw = process.env.EXT;
	let ext;

	if (raw) {
		ext = parse(raw);
		return Array.isArray(ext) && ext || [];
	}

	return [];
};