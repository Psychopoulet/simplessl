"use strict";

// deps

	// natives
	const assert = require("assert");
	const { homedir } = require("os");
	const { join } = require("path");

	// externals
	const { mkdirpProm, rmdirpProm } = require("node-promfs");

	// locals
	const SimpleSSL = require(join(__dirname, "..", "lib", "main.js"));

// consts

	const MAX_TIMEOUT = 30 * 1000;

	const PACKAGE_DIRECTORY = join(homedir(), "simplessl");
		const CERTIFICATE_PATH = join(PACKAGE_DIRECTORY, "crt");
			const SERVER_KEY = join(CERTIFICATE_PATH, "server.key");
			const SERVER_CSR = join(CERTIFICATE_PATH, "server.csr");

// process

	(0, process).env.OPENSSL_BIN = (0, process).env.OPENSSL_BIN || "openssl";
	(0, process).env.OPENSSL_CONF = (0, process).env.OPENSSL_CONF || join(__dirname, "openssl.cnf");

// tests

describe("createCSR", () => {

	const SSL = new SimpleSSL();

	before(() => {
		return SSL.debug(true);
	});

	beforeEach(() => {
		return mkdirpProm(CERTIFICATE_PATH);
	});

	afterEach(() => {
		return rmdirpProm(PACKAGE_DIRECTORY);
	});

	it("should check empty value", (done) => {

		SSL.createCSR().then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		SSL.createCSR(false).then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check empty value", (done) => {

		SSL.createCSR("").then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should create CSR without options", () => {

		return SSL.createCSR(SERVER_KEY, SERVER_CSR).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "CSR was not generated");
				assert.strictEqual("object", typeof keys.options, "CSR was not generated");
					assert.strictEqual("string", typeof keys.options.common, "CSR was generated with the wrong common");
						assert.strictEqual(".", keys.options.common, "CSR was generated with the wrong common");
					assert.strictEqual("string", typeof keys.options.country, "CSR was generated with the wrong country");
						assert.strictEqual("FR", keys.options.country, "CSR was generated with the wrong country");
					assert.strictEqual("string", typeof keys.options.email, "CSR was generated with the wrong email");
						assert.strictEqual(".", keys.options.email, "CSR was generated with the wrong email");
					assert.strictEqual("number", typeof keys.options.keysize, "CSR was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "CSR was generated with the wrong keysize");
					assert.strictEqual("string", typeof keys.options.locality, "CSR was generated with the wrong locality");
						assert.strictEqual(".", keys.options.locality, "CSR was generated with the wrong locality");
					assert.strictEqual("string", typeof keys.options.organization, "CSR was generated with the wrong organization");
						assert.strictEqual("Internet Widgits Pty Ltd", keys.options.organization, "CSR was generated with the wrong organization");
					assert.strictEqual("string", typeof keys.options.state, "CSR was generated with the wrong state");
						assert.strictEqual("Some-State", keys.options.state, "CSR was generated with the wrong state");

		});

	}).timeout(MAX_TIMEOUT);

	it("should create CSR with all options", () => {

		return SSL.createCSR(SERVER_KEY, SERVER_CSR, {
			"common": "Psychopoulet",
			"country": "FR",
			"email": "test@test.com",
			"keysize": "small",
			"locality": "Paris",
			"organization": "Psychopoulet",
			"state": "France"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "CSR was not generated");
				assert.strictEqual("object", typeof keys.options, "CSR was not generated");
					assert.strictEqual("string", typeof keys.options.common, "CSR was generated with the wrong common");
						assert.strictEqual("Psychopoulet", keys.options.common, "CSR was generated with the wrong common");
					assert.strictEqual("string", typeof keys.options.country, "CSR was generated with the wrong country");
						assert.strictEqual("FR", keys.options.country, "CSR was generated with the wrong country");
					assert.strictEqual("string", typeof keys.options.email, "CSR was generated with the wrong email");
						assert.strictEqual("test@test.com", keys.options.email, "CSR was generated with the wrong email");
					assert.strictEqual("number", typeof keys.options.keysize, "CSR was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "CSR was generated with the wrong keysize");
					assert.strictEqual("string", typeof keys.options.locality, "CSR was generated with the wrong locality");
						assert.strictEqual("Paris", keys.options.locality, "CSR was generated with the wrong locality");
					assert.strictEqual("string", typeof keys.options.organization, "CSR was generated with the wrong organization");
						assert.strictEqual("Psychopoulet", keys.options.organization, "CSR was generated with the wrong organization");
					assert.strictEqual("string", typeof keys.options.state, "CSR was generated with the wrong state");
						assert.strictEqual("France", keys.options.state, "CSR was generated with the wrong state");

		});

	}).timeout(MAX_TIMEOUT);

});
