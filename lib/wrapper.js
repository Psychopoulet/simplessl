
"use strict";

// deps

	// natives
	const { spawn } = require("child_process");

	// locals
	const stdToString = require(require("path").join(__dirname, "stdToString.js"));
	const wrapperStdToString = require(require("path").join(__dirname, "wrapperStdToString.js"));

// module

module.exports = (openSSL, tabArgs, options, showCmd) => {

	if ("undefined" === typeof openSSL) {
		return Promise.reject(new ReferenceError("Missing \"openSSL\" paramater"));
	}
		else if ("object" !== typeof openSSL) {
			return Promise.reject(new TypeError("\"openSSL\" paramater is not an object"));
		}

		else if ("undefined" === typeof openSSL.bin) {
			return Promise.reject(new ReferenceError("Missing \"openSSL.bin\" paramater"));
		}
			else if ("string" !== typeof openSSL.bin) {
				return Promise.reject(new TypeError("\"openSSL.bin\" paramater is not a string"));
			}
			else if ("" === openSSL.bin.trim()) {
				return Promise.reject(new Error("\"openSSL.bin\" paramater is empty"));
			}

		else if ("undefined" === typeof openSSL.conf) {
			return Promise.reject(new ReferenceError("Missing \"openSSL.conf\" paramater"));
		}
			else if ("string" !== typeof openSSL.conf) {
				return Promise.reject(new TypeError("\"openSSL.conf\" paramater is not a string"));
			}
			else if ("" === openSSL.conf.trim()) {
				return Promise.reject(new Error("\"openSSL.conf\" paramater is empty"));
			}

	else if ("undefined" === typeof tabArgs) {
		return Promise.reject(new ReferenceError("Missing \"tabArgs\" paramater"));
	}
		else if ("object" !== typeof tabArgs || !(tabArgs instanceof Array)) {
			return Promise.reject(new TypeError("\"tabArgs\" paramater is not an Array"));
		}
		else if (!tabArgs.length) {
			return Promise.reject(new Error("\"tabArgs\" paramater is empty"));
		}

	else if ("undefined" === typeof options) {
		return Promise.reject(new ReferenceError("Missing \"options\" paramater"));
	}
		else if ("object" !== typeof options) {
			return Promise.reject(new TypeError("\"options\" paramater is not an object"));
		}

	else if ("undefined" === typeof showCmd) {
		return Promise.reject(new ReferenceError("Missing \"showCmd\" paramater"));
	}
		else if ("boolean" !== typeof showCmd) {
			return Promise.reject(new TypeError("\"showCmd\" paramater is not a boolean"));
		}

	else {

		return new Promise((resolve, reject) => {

			if (showCmd) {
				(0, console).log(openSSL.bin, tabArgs.join(" "));
			}

			const oSpawn = spawn(openSSL.bin, tabArgs);

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

	}

};
