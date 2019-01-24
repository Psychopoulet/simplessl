"use strict";

// deps

	// natives
	const assert = require("assert");

	// locals
	const readFile = require(require("path").join(__dirname, "..", "lib", "readFile.js"));

// tests

describe("readFile", () => {

	it("should check missing value", (done) => {

		readFile().then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof ReferenceError, true, "error generated is not valid");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		readFile(false).then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof TypeError, true, "error generated is not valid");

			done();

		});

	});

	it("should check empty value", (done) => {

		readFile("").then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof Error, true, "error generated is not valid");

			done();

		});

	});

});
