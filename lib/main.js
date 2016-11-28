
"use strict";

// deps

const	path = require("path"),
		fs = require("fs"),
		spawn = require("child_process").spawn;

// private

	// attrs

		var _openSSLBinPath, _openSSLConfPath;

	// methods

		function _isFileProm (file) {

			return new Promise((resolve, reject) => {

				if ("undefined" === typeof file) {
					reject(new ReferenceError("\"file\" does not exists"));
				}
					else if ("string" !== typeof file) {
						reject(new TypeError("\"file\" is not a string"));
					}
				else {

					file = file.trim();

					if ("" === file) {
						reject(new Error("\"file\" is empty"));
					}
					else {

						try {

							fs.stat(file, (err, stats) => {
								resolve(!err && stats && stats.isFile());
							});

						}
						catch(e) {
							resolve(false);
						}

					}

				}

			});

		}

		function _readFileProm (file) {

			return new Promise((resolve, reject) => {

				fs.readFile(file, "utf8", (err, content) => {

					if (err) {
						reject(err);
					}
					else {
						resolve(content);
					}

				});

			});

		}

		function _wrapper (tabArgs) {

			return new Promise((resolve, reject) => {

				let sResult = "", oSpawn = spawn(_openSSLBinPath, tabArgs);

				oSpawn.on("close", (code) => {

					if (code) {
						reject(new Error(sResult));
					}
					else {
						resolve();
					}

				}).stderr.on("data", (msg) => {

					if (msg) {

						msg = msg.toString("binary").trim();

						if ("." != msg && "+" != msg) {

							try {
								oSpawn.stdin.write("\r\n");
							}
							catch (e) {
								// nothing to do here
							}

							sResult += msg;

						}
					
					}

				});

			});

		}

// module

module.exports = class SimpleSSL {

	constructor () {

		_openSSLBinPath = process.env.OPENSSL_BIN || "openssl";
		_openSSLConfPath = process.env.OPENSSL_CONF || null;

	}

	static setOpenSSLBinPath (file) {

		return _isFileProm(file).then((exists) => {

			if (exists) {
				_openSSLBinPath = path.normalize(file);
				return Promise.resolve();
			}
			else {
				return Promise.reject(new Error("\"" + file + "\" does not exist."));
			}

		});

	}

	static setOpenSSLConfPath (file) {

		return _isFileProm(file).then((exists) => {

			if (exists) {
				_openSSLConfPath = path.normalize(file);
				return Promise.resolve();
			}
			else {
				return Promise.reject(new Error("\"" + file + "\" does not exist."));
			}

		});

	}

	createPrivateKey (keyFilePath, size) {

		size = ("undefined" === typeof size) ? 2048 : size;
		size = ("small" === size) ? 2048 : size;
		size = ("medium" === size) ? 3072 : size;
		size = ("large" === size) ? 4096 : size;
		size = (size !== 2048 && size !== 3072 && size !== 4096) ? 2048 : size;

		return _isFileProm(keyFilePath).then((exists) => {

			if (exists) {
				return _readFileProm(keyFilePath, "utf8");
			}
			else {

				return new Promise((resolve, reject) => {

					try {

						fs.stat(path.dirname(keyFilePath), (err, stats) => {
							resolve(!err && stats && stats.isDirectory());
						});

					}
					catch(e) {
						resolve(false);
					}

				}).then((exists) => {

					if (!exists) {
						return Promise.reject(new Error("\"" + path.dirname(keyFilePath) + "\" does not exist"));
					}
					else {

						let options = [
							"genrsa",
							"-out", keyFilePath,
							size
						];

						if (_openSSLConfPath) {
							options.push("-config", _openSSLConfPath);
						}

						return _wrapper(options).then(() => {
							return _readFileProm(keyFilePath, "utf8");
						});
						
					}

				});

			}
		
		}).then((data) => {
			return Promise.resolve({ privateKey : data });
		});

	}

	createCSR (keyFilePath, CSRFilePath, size) {

		return this.createPrivateKey(keyFilePath, (size) ? size : null).then((keys) => {

			return _isFileProm(CSRFilePath).then((exists) => {

				if (exists) {
					return _readFileProm(CSRFilePath, "utf8");
				}
				else {

					let options = [
						"req",
						"-new",
						"-key", keyFilePath,
						"-out", CSRFilePath
					];

					if (_openSSLConfPath) {
						options.push("-config", _openSSLConfPath);
					}

					return _wrapper(options).then(() => {
						return _readFileProm(CSRFilePath, "utf8");
					});

				}

			}).then((data) => {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : data });
			});
		
		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath, size) {
		
		return this.createCSR(keyFilePath, CSRFilePath, (size) ? size : null).then((keys) => {

			return _isFileProm(CRTFilePath).then((exists) => {

				if (exists) {
					return _readFileProm(CRTFilePath, "utf8");
				}
				else {

					let options = [
						"x509",
						"-req",
						"-days", "365",
						"-in", CSRFilePath,
						"-signkey", keyFilePath,
						"-out", CRTFilePath
					];

					return _wrapper(options).then(() => {
						return _readFileProm(CRTFilePath, "utf8");
					});

				}

			}).then((data) => {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : data });
			});
		
		});

	}

};
