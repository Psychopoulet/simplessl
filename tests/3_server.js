"use strict";

// deps

	const { join } = require("path");
	const assert = require("assert");
	const https = require("https");
	const tls = require("tls");

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

describe("server", () => {

	const SSL = new SimpleSSL();

	(0, process).env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

	it("https", () => {

		return SSL.createCertificate(SERVER_KEY, SERVER_CSR, SERVER_CRT, {
			"country": "FR",
			"keysize": "small"
		}).then((keys) => {

			assert.strictEqual("object", typeof keys, "keys were not generated");
				assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
				assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");
				assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");
				assert.strictEqual("object", typeof keys.options, "certificate was not generated");
					assert.strictEqual("string", typeof keys.options.country, "certificatey was generated with the wrong country");
						assert.strictEqual("FR", keys.options.country, "certificate was generated with the wrong country");
					assert.strictEqual("number", typeof keys.options.keysize, "certificate was generated with the wrong keysize");
						assert.strictEqual(2048, keys.options.keysize, "certificate was generated with the wrong keysize");

			return Promise.resolve(keys);

		}).then((keys) => {

			return Promise.resolve(https.createServer({
				"key": keys.privateKey,
				"cert": keys.certificate
			}, (req, res) => {

				res.writeHead(200);
				res.end("ok");

			}));

		}).then((server) => {

			return new Promise((resolve, reject) => {

				server.listen(8080, (err) => {
					return err ? reject(err) : resolve(server);
				});

			});

		}).then((server) => {

			return new Promise((resolve, reject) => {

				https.get("https://localhost:8080", (res) => {

					assert.strictEqual(200, res.statusCode, "invalid status code");

					let _data = null;
					res.on("data", (data) => {
						_data = data;
					}).on("end", () => {

						assert.strictEqual(true, _data instanceof Buffer, "data is not Buffer");
						assert.strictEqual("ok", _data.toString("utf8"), "invalid data");

						server.close();
						resolve();

					});

				}).on("error", reject);

			});

		});

	}).timeout(MAX_TIMEOUT);

	it("tls", () => {

		return SSL.createCertificate(SERVER_KEY, SERVER_CSR, SERVER_CRT).then((keys) => {

			assert.strictEqual("object", typeof keys, "private key was not generated");
			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

			return Promise.resolve(keys);

		}).then((keys) => {

			return Promise.resolve(tls.createServer({
				"key": keys.privateKey,
				"cert": keys.certificate
			}, (socket) => {

				socket.write("ok");
				socket.setEncoding("utf8");
				socket.pipe(socket);
				socket.end();

			})).then((server) => {

				return new Promise((resolve, reject) => {

					server.listen(8080, (err) => {
						return err ? reject(err) : resolve(server);
					});

				});

			}).then((server) => {

				return new Promise((resolve) => {

					const res = tls.connect(8080, {
						"key": keys.privateKey,
						"cert": keys.certificate
					}, () => {

						let _data = null;
						res.on("data", (data) => {
							_data = data;
						}).on("end", () => {

							assert.strictEqual(true, _data instanceof Buffer, "data is not Buffer");
							assert.strictEqual("ok", _data.toString("utf8"), "invalid data");

							server.close();
							resolve();

						});

					});

				});

			});

		});

	}).timeout(MAX_TIMEOUT);

});
