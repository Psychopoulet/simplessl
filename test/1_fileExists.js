"use strict";

// deps

	const assert = require("assert");

	const fileExists = require(require("path").join(__dirname, "..", "lib", "fileExists.js"));

// tests

describe("fileExists", () => {

	it("should check missing value", (done) => {

		fileExists().then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof ReferenceError, true, "error generated is not valid");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		fileExists(false).then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof TypeError, true, "error generated is not valid");

			done();

		});

	});

	it("should check empty value", (done) => {

		fileExists("").then(() => {
			done(new Error("Does not generate an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "error generated is not valid");
			assert.strictEqual(err instanceof Error, true, "error generated is not valid");

			done();

		});

	});

});
