"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");

	const directoryExists = require(join(__dirname, "..", "lib", "directoryExists.js"));
	const SimpleSSL = require(join(__dirname, "..", "lib", "main.js"));

	const mkdir = require(join(__dirname, "mkdir.js"));
	const unlink = require(join(__dirname, "unlink.js"));
	const rmdir = require(join(__dirname, "rmdir.js"));

// consts

	const MAX_TIMEOUT = 5 * 1000;

	const CERTIFICATE_PATH = join(__dirname, "crt");
		const SERVER_KEY = join(CERTIFICATE_PATH, "server.key");

// process

	(0, process).env.OPENSSL_BIN = (0, process).env.OPENSSL_BIN || "openssl";
	(0, process).env.OPENSSL_CONF = (0, process).env.OPENSSL_CONF || join(__dirname, "openssl.cnf");

// tests

describe("createPrivateKey", () => {

	const SSL = new SimpleSSL();

	beforeEach(() => {
		return mkdir(CERTIFICATE_PATH);
	});

	afterEach(() => {

		return directoryExists(CERTIFICATE_PATH).then((exists) => {

			return !exists ? Promise.resolve() : unlink(SERVER_KEY).then(() => {
				return rmdir(CERTIFICATE_PATH);
			});

		});

	});

	it("should check empty value", (done) => {

		SSL.createPrivateKey().then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		SSL.createPrivateKey(false).then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check empty value", (done) => {

		SSL.createPrivateKey("").then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should create private key with wrong keysize", () => {

		return SSL.createPrivateKey(SERVER_KEY, {
			"keysize": 6581681681
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with string option", () => {

		return SSL.createPrivateKey(SERVER_KEY, "small").then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with number option", () => {

		return SSL.createPrivateKey(SERVER_KEY, 2048).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with \"small\" keysize", () => {

		return SSL.createPrivateKey(SERVER_KEY, {
			"keysize": "small"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with \"medium\" keysize", () => {

		return SSL.createPrivateKey(SERVER_KEY, {
			"keysize": "medium"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(3072, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with \"large\" keysize", () => {

		return SSL.createPrivateKey(SERVER_KEY, {
			"keysize": "large"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(4096, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with no options", () => {

		return SSL.createPrivateKey(SERVER_KEY).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "private key was generated with the wrong keysize");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

	it("should create private key with all options", () => {

		return SSL.createPrivateKey(SERVER_KEY, {
			"common": "Psychopoulet",
			"country": "FR",
			"email": "test@test.com",
			"keysize": "small",
			"locality": "Paris",
			"organization": "Psychopoulet",
			"state": "France"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("object", typeof keys.options, "private key was not generated");
					assert.strictEqual("string", typeof keys.options.common, "private key was generated with the wrong common");
						assert.strictEqual("Psychopoulet", keys.options.common, "private key was generated with the wrong common");
					assert.strictEqual("string", typeof keys.options.country, "private key was generated with the wrong country");
						assert.strictEqual("FR", keys.options.country, "private key was generated with the wrong country");
					assert.strictEqual("string", typeof keys.options.email, "private key was generated with the wrong email");
						assert.strictEqual("test@test.com", keys.options.email, "private key was generated with the wrong email");
					assert.strictEqual("number", typeof keys.options.keysize, "private key was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "private key was generated with the wrong keysize");
					assert.strictEqual("string", typeof keys.options.locality, "private key was generated with the wrong locality");
						assert.strictEqual("Paris", keys.options.locality, "private key was generated with the wrong locality");
					assert.strictEqual("string", typeof keys.options.organization, "private key was generated with the wrong organization");
						assert.strictEqual("Psychopoulet", keys.options.organization, "private key was generated with the wrong organization");
					assert.strictEqual("string", typeof keys.options.state, "private key was generated with the wrong state");
						assert.strictEqual("France", keys.options.state, "private key was generated with the wrong state");

			return Promise.resolve();

		});

	}).timeout(MAX_TIMEOUT);

});
