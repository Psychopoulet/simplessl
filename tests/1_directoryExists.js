"use strict";

// deps

	const assert = require("assert");

	const directoryExists = require(require("path").join(__dirname, "..", "lib", "directoryExists.js"));

// tests

describe("directoryExists", () => {

	it("should check missing value", (done) => {

		directoryExists().then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof ReferenceError, true, "error generated is not valid");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		directoryExists(false).then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof TypeError, true, "error generated is not valid");

			done();

		});

	});

	it("should check empty value", (done) => {

		directoryExists("").then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof Error, true, "error generated is not valid");

			done();

		});

	});

});
