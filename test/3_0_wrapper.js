"use strict";

// deps

	// natives
	const assert = require("assert");
	const { join } = require("path");

	// locals
	const wrapper = require(join(__dirname, "..", "lib", "wrapper.js"));

// process

	(0, process).env.OPENSSL_BIN = (0, process).env.OPENSSL_BIN || "openssl";
	(0, process).env.OPENSSL_CONF = (0, process).env.OPENSSL_CONF || join(__dirname, "openssl.cnf");

// tests

describe("wrapper", () => {

	describe("missing data", () => {

		it("should check missing openSSL", (done) => {

			wrapper().then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check missing openSSL.bin", (done) => {

			wrapper({}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check missing openSSL.conf", (done) => {

			wrapper({
				"bin": "test"
			}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check missing tabArgs", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check missing options", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}, [ "test" ]).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check missing showCmd", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}, [ "test" ], {}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

				done();

			});

		});

	});

	describe("wrong data", () => {

		it("should check wrong openSSL", (done) => {

			wrapper(false).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check wrong openSSL.bin", (done) => {

			wrapper({
				"bin": false,
				"conf": "test"
			}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check wrong openSSL.bin", (done) => {

			wrapper({
				"bin": "test",
				"conf": false
			}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check wrong tabArgs", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}, false).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check wrong options", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}, [ "test" ], false).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check wrong showCmd", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}, [ "test" ], {}, "test").then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

				done();

			});

		});

	});

	describe("empty data", () => {

		it("should check empty openSSL.bin", (done) => {

			wrapper({
				"bin": "",
				"conf": "test"
			}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check empty openSSL.conf", (done) => {

			wrapper({
				"bin": "test",
				"conf": ""
			}).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

				done();

			});

		});

		it("should check empty tabArgs", (done) => {

			wrapper({
				"bin": "test",
				"conf": "test"
			}, []).then(() => {
				done(new Error("Does not throw an error"));
			}).catch((err) => {

				assert.strictEqual(typeof err, "object", "Generated error is not as expected");
				assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

				done();

			});

		});

	});

});
