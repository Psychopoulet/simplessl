"use strict";

// deps

	// natives
	const assert = require("assert");
	const { join } = require("path");

	// locals
	const SimpleSSL = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("setOpenSSLBinPath", () => {

	const SSL = new SimpleSSL();

	it("should check missing value", (done) => {

		SSL.debug().then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		SSL.debug("").then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check good value", () => {
		return SSL.debug(true);
	});

});
