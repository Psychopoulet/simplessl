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

describe("errors", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should check setOpenSSLBinPath type value", (done) => {

		SimpleSSL.setOpenSSLBinPath("test").then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch(() => {
			done();
		});

	});

	it("should check setOpenSSLConfPath type value", (done) => {
		
		SimpleSSL.setOpenSSLConfPath("test").then(() => {
			done(new Error("check type value does not throw an error"));
		}).catch(() => {
			done();
		});

	});

	it("should check createPrivateKey", (done) => {

		SSL.createPrivateKey().then(() => {
			done(new Error("check empty value does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			
			SSL.createPrivateKey(false).then(() => {
				done(new Error("check wrong type value does not throw an error"));
			}).catch((err) => {
				assert.strictEqual(true, err instanceof TypeError, "check wrong value does not throw an error");
				done();
			});

		});

	});

	it("should check createCSR", (done) => {

		SSL.createCSR(serverkey).then(() => {
			done(new Error("check empty value does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			
			SSL.createCSR(serverkey, false).then(() => {
				done(new Error("check wrong type value does not throw an error"));
			}).catch((err) => {
				assert.strictEqual(true, err instanceof TypeError, "check wrong value does not throw an error");
				done();
			});

		});

	});

	it("should check createCertificate", (done) => {

		SSL.createCertificate(serverkey, servercsr).then(() => {
			done(new Error("check empty value does not throw an error"));
		}).catch((err) => {

			assert.strictEqual(true, err instanceof ReferenceError, "check empty value does not throw an error");
			
			SSL.createCertificate(serverkey, servercsr, false).then(() => {
				done(new Error("check wrong type value does not throw an error"));
			}).catch((err) => {
				assert.strictEqual(true, err instanceof TypeError, "check wrong value does not throw an error");
				done();
			});

		});

	});

});

describe("create private key", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should create private key", () => {

		return SSL.createPrivateKey(serverkey).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");

		});

	});

});

describe("create CSR", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should create CSR", () => {

		return SSL.createCSR(serverkey, servercsr).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");

		});

	});

});

describe("create certificate", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should create certificate", () => {

		return SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

		});

	});

});

describe("server", () => {

	before(_createDirectory);
	after(_removeDirectory);

	it("should check type value", (done) => {

		SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

			let server = require("https").createServer({
				key: keys.privateKey,
				cert: keys.certificate
			}).listen(8080, () => {
				server.close();
				done();
			});

		}).catch(done);

	});

});
