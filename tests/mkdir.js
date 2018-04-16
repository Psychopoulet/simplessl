
"use strict";

// deps

	const { mkdir } = require("fs");

	const directoryExists = require(require("path").join(__dirname, "..", "lib", "directoryExists.js"));

// module

module.exports = (directory) => {

	if ("undefined" === typeof directory) {
		return Promise.reject(new ReferenceError("Missing \"directory\" parameter"));
	}
	else if ("string" !== typeof directory) {
		return Promise.reject(new TypeError("\"directory\" parameter is not a string"));
	}
	else if ("" === directory.trim()) {
		return Promise.reject(new Error("\"directory\" parameter is empty"));
	}

	else {

		return directoryExists(directory).then((exists) => {

			return exists ? Promise.resolve() : new Promise((resolve, reject) => {

				mkdir(directory, (err) => {
					return err ? reject(err) : resolve();
				});

			});

		});

	}

};
