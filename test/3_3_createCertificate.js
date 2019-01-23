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
		const SERVER_CSR = join(CERTIFICATE_PATH, "server.csr");
		const SERVER_CRT = join(CERTIFICATE_PATH, "server.crt");

// process

	(0, process).env.OPENSSL_BIN = (0, process).env.OPENSSL_BIN || "openssl";
	(0, process).env.OPENSSL_CONF = (0, process).env.OPENSSL_CONF || join(__dirname, "openssl.cnf");

// tests

describe("createCertificate", () => {

	const SSL = new SimpleSSL();

	before(() => {
		return mkdir(CERTIFICATE_PATH);
	});

	after(() => {

		return directoryExists(CERTIFICATE_PATH).then((exists) => {

			return !exists ? Promise.resolve() : unlink(SERVER_KEY).then(() => {
				return unlink(SERVER_CSR);
			}).then(() => {
				return unlink(SERVER_CRT);
			}).then(() => {
				return rmdir(CERTIFICATE_PATH);
			});

		});

	});

	it("should check empty value", (done) => {

		SSL.createCertificate().then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof ReferenceError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check wrong type value", (done) => {

		SSL.createCertificate(false).then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof TypeError, true, "Generated error is not as expected");

			done();

		});

	});

	it("should check empty value", (done) => {

		SSL.createCertificate("").then(() => {
			done(new Error("Does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(typeof err, "object", "Generated error is not as expected");
			assert.strictEqual(err instanceof Error, true, "Generated error is not as expected");

			done();

		});

	});

	it("should create certificate", () => {

		return SSL.createCertificate(SERVER_KEY, SERVER_CSR, SERVER_CRT, {
			"country": "FR",
			"keysize": "small"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "certificate was not generated");
				assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");
				assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");
				assert.strictEqual("object", typeof keys.options, "certificate was not generated");
					assert.strictEqual("string", typeof keys.options.country, "certificate was generated with the wrong country");
						assert.strictEqual("FR", keys.options.country, "certificate was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "certificate was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "certificate was generated with the wrong keysize");

		});

	}).timeout(MAX_TIMEOUT);

});
