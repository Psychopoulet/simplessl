
"use strict";

// deps

const	path = require("path"),
		fs = require("node-promfs"),
		spawn = require("child_process").spawn;

// private

	// attrs

		var _openSSLBinPath, _openSSLConfPath;

	// methods

		function _wrapper (tabArgs) {

			return new Promise(function(resolve, reject) {

				let sResult = "", oSpawn = spawn(_openSSLBinPath, tabArgs);

				oSpawn.on("close", function (code) {

					if (code) {
						reject(sResult);
					}
					else {
						resolve();
					}

				}).stderr.on("data", function (msg) {

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

	setOpenSSLBinPath (file) {

		return fs.isFileProm(file).then(function(exists) {

			if (exists) {
				_openSSLBinPath = path.normalize(file);
				return Promise.resolve();
			}
			else {
				return Promise.reject("\"" + file + "\" does not exist.");
			}

		});

	}

	setOpenSSLConfPath (file) {

		return fs.isFileProm(file).then(function(exists) {

			if (exists) {
				_openSSLConfPath = path.normalize(file);
				return Promise.resolve();
			}
			else {
				return Promise.reject("\"" + file + "\" does not exist.");
			}

		});

	}

	createPrivateKey (keyFilePath, size) {

		size = ("undefined" === typeof size) ? 2048 : size;
		size = ("small" === size) ? 2048 : size;
		size = ("medium" === size) ? 3072 : size;
		size = ("large" === size) ? 4096 : size;
		size = (size !== 2048 && size !== 3072 && size !== 4096) ? 2048 : size;

		return fs.isFileProm(keyFilePath).then(function(exists) {

			if (exists) {
				return fs.readFileProm(keyFilePath, "utf8");
			}
			else {
				
				return fs.mkdirpProm(path.dirname(keyFilePath)).then(function() {

					let options = [
						"genrsa",
						"-out", keyFilePath,
						size
					];

					if (_openSSLConfPath) {
						options.push("-config", _openSSLConfPath);
					}

					return _wrapper(options).then(function() {
						return fs.readFileProm(keyFilePath, "utf8");
					});

				});

			}
		
		}).then(function(data) {
			return Promise.resolve({ privateKey : data });
		});

	}

	createCSR (keyFilePath, CSRFilePath, size) {

		return this.createPrivateKey(keyFilePath, (size) ? size : null).then(function(keys) {

			return fs.isFileProm(CSRFilePath).then(function(exists) {

				if (exists) {
					return fs.readFileProm(CSRFilePath, "utf8");
				}
				else {

					return fs.mkdirpProm(path.dirname(CSRFilePath)).then(function() {

						let options = [
							"req",
							"-new",
							"-key", keyFilePath,
							"-out", CSRFilePath
						];

						if (_openSSLConfPath) {
							options.push("-config", _openSSLConfPath);
						}

						return _wrapper(options).then(function() {
							return fs.readFileProm(CSRFilePath, "utf8");
						});

					});

				}

			}).then(function(data) {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : data });
			});
		
		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath, size) {
		
		return this.createCSR(keyFilePath, CSRFilePath, (size) ? size : null).then(function(keys) {

			return fs.isFileProm(CRTFilePath).then(function(exists) {

				if (exists) {
					return fs.readFileProm(CRTFilePath, "utf8");
				}
				else {

					return fs.mkdirpProm(path.dirname(CRTFilePath)).then(function() {

						let options = [
							"x509",
							"-req",
							"-days", "365",
							"-in", CSRFilePath,
							"-signkey", keyFilePath,
							"-out", CRTFilePath
						];

						return _wrapper(options).then(function() {
							return fs.readFileProm(CRTFilePath, "utf8");
						});

					});

				}

			}).then(function(data) {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : data });
			});
		
		});

	}

};
