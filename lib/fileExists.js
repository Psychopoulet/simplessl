
"use strict";

// deps

	const { stat } = require("fs");

// module

module.exports = (file) => {

	if ("undefined" === typeof file) {
		return Promise.reject(new ReferenceError("Missing \"file\" parameter"));
	}
	else if ("string" !== typeof file) {
		return Promise.reject(new TypeError("\"file\" parameter is not a string"));
	}
	else if ("" === file.trim()) {
		return Promise.reject(new Error("\"file\" parameter is empty"));
	}

	else {

		return new Promise((resolve) => {

			stat(file, (err, stats) => {
				resolve(err ? false : stats.isFile());
			});

		});

	}

};
