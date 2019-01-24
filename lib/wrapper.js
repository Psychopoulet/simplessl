
"use strict";

// deps

	// natives
	const { spawn } = require("child_process");

	// locals
	const stdToString = require(require("path").join(__dirname, "stdToString.js"));
	const wrapperStdToString = require(require("path").join(__dirname, "wrapperStdToString.js"));

// module

module.exports = (openSSLBinPath, tabArgs, options, showCmd) => {

	return new Promise((resolve, reject) => {

		if (showCmd) {
			(0, console).log(openSSLBinPath, tabArgs.join(" "));
		}

		const oSpawn = spawn(openSSLBinPath, tabArgs);

		let result = "";
		let error = false;

		oSpawn.on("error", (err) => {
			error = true; reject(new Error(stdToString(err)));
		}).on("close", (code) => {

			if (error) {
				return null;
			}
			else {
				return code ? reject(new Error(result)) : resolve();
			}

		});

		oSpawn.stderr.on("data", (data) => {
			result += wrapperStdToString(oSpawn, data, options);
		});

	});

};
