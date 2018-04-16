/*
	eslint complexity: 0
*/


"use strict";

// deps

	const stdToString = require(require("path").join(__dirname, "stdToString.js"));

// consts

	const WATING_STDIN = /(.*) \[(.*)\]:$/;

// module

module.exports = (oSpawn, _data, options) => {

	const data = stdToString(_data).trim();

	let result = "";

		if ("" !== data && "." !== data && "+" !== data) {

			try {

				const match = data.match(WATING_STDIN);

				if (match) {

					if (-1 < match[1].indexOf("Country Name")) {

						if (!options.country) {
							options.country = match[2] ? match[2] : ".";
						}

						oSpawn.stdin.write(options.country + "\n");

					}
					else if (-1 < match[1].indexOf("Locality Name")) {

						if (!options.locality) {
							options.locality = match[2] ? match[2] : ".";
						}

						oSpawn.stdin.write(options.locality + "\n");

					}
					else if (-1 < match[1].indexOf("State or Province Name")) {

						if (!options.state) {
							options.state = match[2] ? match[2] : ".";
						}

						oSpawn.stdin.write(options.state + "\n");

					}
					else if (-1 < match[1].indexOf("Organization Name")) {

						if (!options.organization) {
							options.organization = match[2] ? match[2] : ".";
						}

						oSpawn.stdin.write(options.organization + "\n");

					}
					else if (-1 < match[1].indexOf("Common Name")) {

						if (!options.common) {
							options.common = match[2] ? match[2] : ".";
						}

						oSpawn.stdin.write(options.common + "\n");

					}
					else if (-1 < match[1].indexOf("Email Address")) {

						if (!options.email) {
							options.email = match[2] ? match[2] : ".";
						}

						oSpawn.stdin.write(options.email + "\n");

					}
					else {
						oSpawn.stdin.write(".\n");
					}

				}
				else {
					result = data;
				}

			}
			catch (e) {
				result = e.message ? e.message : e;
			}

		}

	return result;

};
