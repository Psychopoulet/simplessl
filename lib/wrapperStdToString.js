/*
	eslint complexity: 0
*/


"use strict";

// deps

	const stdToString = require(require("path").join(__dirname, "stdToString.js"));

// consts

	const WATING_STDIN = /(.*) \[(.*)\]:$/;

// private

	// methods

	/**
	* Execute method
	* @param {child_process} spawn : std process
	* @param {string} data : data to check
	* @param {object} options : options for execution
	* @returns {any} Cloned data
	*/
	function _execution (spawn, data, options) {

		const match = data.match(WATING_STDIN);

		if (match) {

			if (-1 < match[1].indexOf("Country Name")) {

				if (!options.country) {
					options.country = match[2] ? match[2] : ".";
				}

				spawn.stdin.write(options.country + "\n");

			}
			else if (-1 < match[1].indexOf("Locality Name")) {

				if (!options.locality) {
					options.locality = match[2] ? match[2] : ".";
				}

				spawn.stdin.write(options.locality + "\n");

			}
			else if (-1 < match[1].indexOf("State or Province Name")) {

				if (!options.state) {
					options.state = match[2] ? match[2] : ".";
				}

				spawn.stdin.write(options.state + "\n");

			}
			else if (-1 < match[1].indexOf("Organization Name")) {

				if (!options.organization) {
					options.organization = match[2] ? match[2] : ".";
				}

				spawn.stdin.write(options.organization + "\n");

			}
			else if (-1 < match[1].indexOf("Common Name")) {

				if (!options.common) {
					options.common = match[2] ? match[2] : ".";
				}

				spawn.stdin.write(options.common + "\n");

			}
			else if (-1 < match[1].indexOf("Email Address")) {

				if (!options.email) {
					options.email = match[2] ? match[2] : ".";
				}

				spawn.stdin.write(options.email + "\n");

			}
			else {
				spawn.stdin.write(".\n");
			}

			return "";

		}
		else {
			return data;
		}

	}

// module

module.exports = (spawn, _data, options) => {

	const data = stdToString(_data).trim();

	if ("" === data || "." === data || "+" === data) {
		return "";
	}

	try {
		return _execution(spawn, data, options);
	}
	catch (e) {
		return e.message ? e.message : e;
	}

};
