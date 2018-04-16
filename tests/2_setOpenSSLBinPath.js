"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");

	const SimpleSSL = require(join(__dirname, "..", "lib", "main.js"));

// tests

describe("setOpenSSLBinPath", () => {

	const SSL = new SimpleSSL();

	it("should check missing value", (done) => {

		SSL.setOpenSSLBinPath().then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		SSL.setOpenSSLBinPath(false).then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check empty value", (done) => {

		SSL.setOpenSSLBinPath("").then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check wrong value", (done) => {

		SSL.setOpenSSLBinPath(join(__dirname, "qsrjhrdsthrthr")).then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check good value", () => {
		return SSL.setOpenSSLBinPath("openssl");
	});

});
