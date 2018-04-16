
"use strict";

// deps

	const { unlink } = require("fs");

	const fileExists = require(require("path").join(__dirname, "..", "lib", "fileExists.js"));

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

		return fileExists(file).then((exists) => {

			return !exists ? Promise.resolve() : new Promise((resolve, reject) => {

				unlink(file, (err) => {
					return err ? reject(err) : resolve();
				});

			});

		});

	}

};
