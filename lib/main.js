
"use strict";

// deps

const	path = require("path"),
		fs = require("fs"),
		spawn = require("child_process").spawn;

// private

	// attrs

		var _openSSLBinPath = null, _openSSLConfPath = null;

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

		function _isDirectoryProm (dir) {

			return new Promise((resolve, reject) => {

				if ("undefined" === typeof dir) {
					reject(new ReferenceError("\"dir\" does not exists"));
				}
					else if ("string" !== typeof dir) {
						reject(new TypeError("\"dir\" is not a string"));
					}
				else {

					dir = dir.trim();

					if ("" === dir) {
						reject(new Error("\"dir\" is empty"));
					}
					else {

						try {

							fs.stat(dir, (err, stats) => {
								resolve(!err && stats && stats.isDirectory());
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

				let sResult = "", error = false, oSpawn = spawn(_openSSLBinPath, tabArgs);

				oSpawn.on("error", (err) => {

					error = true;

					if ("string" === typeof err) {
						reject(new Error(err));
					}
					else if (err instanceof Buffer) {
						reject(new Error(err.toString("utf8")));
					}
					else {
						reject(err);
					}

				}).on("close", (code) => {

					if (!error) {

						if (code) {
							reject(new Error(sResult));
						}
						else {
							resolve();
						}

					}

				});

				oSpawn.stdout.on("data", (data) => {

					data = (data instanceof Buffer) ?  data.toString("utf8").trim() : data;

					if ("." != data && "+" != data) {

						try {
							oSpawn.stdin.write("\r\n");
						}
						catch (e) {
							// nothing to do here
						}

						sResult += data;

					}
					
				});

				oSpawn.stderr.on("data", (data) => {

					data = (data instanceof Buffer) ?  data.toString("utf8").trim() : data;

					if ("." != data && "+" != data) {

						try {
							oSpawn.stdin.write("\r\n");
						}
						catch (e) {
							// nothing to do here
						}

						sResult += data;

					}
					
				});

			});

		}

// module

module.exports = class SimpleSSL {

	constructor () {

		_openSSLBinPath = _openSSLBinPath || process.env.OPENSSL_BIN || "openssl";
		_openSSLConfPath = _openSSLConfPath || process.env.OPENSSL_CONF || null;

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

				return _isDirectoryProm(path.dirname(keyFilePath)).then((exists) => {

					if (!exists) {
						return Promise.reject(new Error("\"" + path.dirname(keyFilePath) + "\" does not exist"));
					}
					else {

						return _wrapper((_openSSLConfPath) ? [
							"genrsa",
							"-out", keyFilePath,
							size,
							"-config", _openSSLConfPath
						] : [
							"genrsa",
							"-out", keyFilePath,
							size
						]).then(() => {
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

					return _wrapper((_openSSLConfPath) ? [
						"req",
						"-new",
						"-key", keyFilePath,
						"-out", CSRFilePath,
						"-config", _openSSLConfPath
					] : [
						"req",
						"-new",
						"-key", keyFilePath,
						"-out", CSRFilePath
					]).then(() => {
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

					return _wrapper([
						"x509",
						"-req",
						"-days", "365",
						"-in", CSRFilePath,
						"-signkey", keyFilePath,
						"-out", CRTFilePath
					]).then(() => {
						return _readFileProm(CRTFilePath, "utf8");
					});

				}

			}).then((data) => {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : data });
			});
		
		});

	}

};
