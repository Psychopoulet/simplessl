"use strict";

// deps

	const 	path = require("path"),
			fs = require("fs"),
			assert = require("assert"),

			SimpleSSL = require(path.join(__dirname, "..", "dist", "main.js"));

// private

	var SSL = new SimpleSSL(),
		crtpath = path.join(__dirname, "crt"),
			serverkey = path.join(crtpath, "server.key"),
			servercsr = path.join(crtpath, "server.csr"),
			servercrt = path.join(crtpath, "server.crt");

	// methods

		function _createDirectory(done) {

			try {

				fs.stat(crtpath, (err, stats) => {

					if (!err && stats && stats.isDirectory()) {
						done();
					}
					else {
						fs.mkdir(crtpath, done);
					}

				});

			}
			catch(e) {
				fs.mkdir(crtpath, done);
			}

		}

		function _removeDirectory(done) {

			new Promise((resolve) => {

				try {

					fs.stat(crtpath, (err, stats) => {
						resolve(!err && (stats && stats.isDirectory()));
					});

				}
				catch(e) {
					resolve(false);
				}

			}).then((exists) => {

				if (!exists) {
					return Promise.resolve();
				}
				else {

					return new Promise((resolve) => {

						try {

							fs.stat(serverkey, (err, stats) => {
								resolve(!err && (stats && stats.isFile()));
							});

						}
						catch(e) {
							resolve(false);
						}

					}).then((exists) => {

						if (!exists) {
							return Promise.resolve();
						}
						else {

							return new Promise((resolve, reject) => {

								fs.unlink(serverkey, (err) => {
									if (err) { reject(err); } else { resolve(); }
								});

							});

						}

					}).then(() => {

						return new Promise((resolve) => {

							try {

								fs.stat(servercsr, (err, stats) => {
									resolve(!err && (stats && stats.isFile()));
								});

							}
							catch(e) {
								resolve(false);
							}

						}).then((exists) => {

							if (!exists) {
								return Promise.resolve();
							}
							else {

								return new Promise((resolve, reject) => {

									fs.unlink(servercsr, (err) => {
										if (err) { reject(err); } else { resolve(); }
									});

								});

							}

						});

					}).then(() => {

						return new Promise((resolve) => {

							try {

								fs.stat(servercrt, (err, stats) => {
									resolve(!err && (stats && stats.isFile()));
								});

							}
							catch(e) {
								resolve(false);
							}

						}).then((exists) => {

							if (!exists) {
								return Promise.resolve();
							}
							else {

								return new Promise((resolve, reject) => {

									fs.unlink(servercrt, (err) => {
										if (err) { reject(err); } else { resolve(); }
									});

								});

							}

						});

					}).then(() => {

						return new Promise((resolve, reject) => {

							fs.rmdir(crtpath, (err) => {
								if (err) { reject(err); } else { resolve(); }
							});
						
						});

					});

				}
				
			}).then(done).catch(done);

		}

// tests

describe("setOpenSSLBinPath", () => {

	it("should check empty value", (done) => {

		SimpleSSL.setOpenSSLBinPath().then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch((err) => {
			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			done();
		});

	});

	it("should check wrong value", (done) => {

		SimpleSSL.setOpenSSLBinPath(false).then(() => {
			assert.strictEqual(true, err instanceof TypeError, "check empty value does not throw an error");
		}).catch(() => {
			done();
		});

	});

	it("should check good value", () => {
		return SimpleSSL.setOpenSSLBinPath(process.env.OPENSSL_BIN);
	});

});

describe("setOpenSSLConfPath", () => {

	it("should check empty value", (done) => {

		SimpleSSL.setOpenSSLConfPath().then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch((err) => {
			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			done();
		});

	});

	it("should check wrong value", (done) => {

		SimpleSSL.setOpenSSLConfPath(false).then(() => {
			assert.strictEqual(true, err instanceof TypeError, "check empty value does not throw an error");
		}).catch(() => {
			done();
		});

	});

	it("should check good value", () => {
		return SimpleSSL.setOpenSSLConfPath(process.env.OPENSSL_CONF);
	});

});

describe("createPrivateKey", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should check empty value", (done) => {

		SSL.createPrivateKey().then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch((err) => {
			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			done();
		});

	});

	it("should check wrong value", (done) => {

		SSL.createPrivateKey(false).then(() => {
			assert.strictEqual(true, err instanceof TypeError, "check empty value does not throw an error");
		}).catch(() => {
			done();
		});

	});

	it("should create private key", () => {

		return SSL.createPrivateKey(serverkey).then((keys) => {

			assert.strictEqual("object", typeof keys, "private key was not generated");
			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");

		});

	});

});

describe("createCSR", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should check empty value", (done) => {

		SSL.createCSR(serverkey).then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch((err) => {
			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			done();
		});

	});

	it("should check wrong value", (done) => {

		SSL.createCSR(serverkey, false).then(() => {
			assert.strictEqual(true, err instanceof TypeError, "check empty value does not throw an error");
		}).catch(() => {
			done();
		});

	});

	it("should create CSR", () => {

		return SSL.createCSR(serverkey, servercsr).then((keys) => {

			assert.strictEqual("object", typeof keys, "private key was not generated");
			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");

		});

	});

});

describe("createCertificate", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should check empty value", (done) => {

		SSL.createCertificate(serverkey, servercsr).then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch((err) => {
			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			done();
		});

	});

	it("should check wrong value", (done) => {

		SSL.createCertificate(serverkey, servercsr, false).then(() => {
			assert.strictEqual(true, err instanceof TypeError, "check empty value does not throw an error");
		}).catch(() => {
			done();
		});

	});

	it("should create certificate", () => {

		return SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("object", typeof keys, "private key was not generated");
			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

		});

	});

});

describe("server", () => {

	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	before(_createDirectory);
	after(_removeDirectory);

	it("https", (done) => {

		SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("object", typeof keys, "private key was not generated");
			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

			const https = require("https");

			const server = https.createServer({
				key: keys.privateKey,
				cert: keys.certificate
			}, (req, res) => {

				res.writeHead(200);
				res.end("ok");

			}).listen(8080, () => {

				https.get("https://localhost:8080", (res) => {

					assert.strictEqual(200, res.statusCode, "invalid status code");

					let _data = null;
					res.on("data", (data) => {
						_data = data;
					}).on("end", () => {

						assert.strictEqual(true, _data instanceof Buffer, "data is not Buffer");
						assert.strictEqual("ok", _data.toString("utf8"), "invalid data");

						server.close();
						done();
				
					});

				}).on("error", done);

			});

		}).catch(done);

	});

	it("tls", (done) => {

		SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("object", typeof keys, "private key was not generated");
			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "CSR was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

			const tls = require("tls");

			const server = tls.createServer({
				key: keys.privateKey,
				cert: keys.certificate
			}, (socket) => {

				socket.write("ok");
				socket.setEncoding("utf8");
				socket.pipe(socket);
				socket.end();

			}).listen(8000, () => {

				let res = tls.connect(8000, {
					key: keys.privateKey,
					cert: keys.certificate
				}, () => {

					let _data = null;
					res.on("data", (data) => {
						_data = data;
					}).on("end", () => {
						
						assert.strictEqual(true, _data instanceof Buffer, "data is not Buffer");
						assert.strictEqual("ok", _data.toString("utf8"), "invalid data");

						server.close();
						done();
				
					});

				});

			});

		}).catch(done);

	});

});
