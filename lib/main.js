
"use strict";

// deps

const	path = require("path"),
		fs = require("fs"),
		spawn = require("child_process").spawn;

// consts

const WATING_STDIN = /(.*) \[(.*)\]:$/;

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

		function _wrapper (tabArgs, options) {

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
							resolve(options);
						}

					}

				});

				oSpawn.stdout.on("data", (data) => {
					sResult += _wrapperStdToString(oSpawn, data, options);
				});

				oSpawn.stderr.on("data", (data) => {
					sResult += _wrapperStdToString(oSpawn, data, options);
				});

			});

		}

			function _wrapperStdToString(oSpawn, data, options) {

				let result = "";

					try {

						data = (data instanceof Buffer) ?  data.toString("utf8").trim() : data;

						if ("" !== data && "." !== data && "+" !== data) {

							var match = data.match(WATING_STDIN);

							if (match) {

								if (-1 < match[1].indexOf("Country Name")) {
									options.country = (options.country) ? options.country : (match[2]) ? match[2] : ".";
									oSpawn.stdin.write(options.country + "\n");
								}
								else if (-1 < match[1].indexOf("Locality Name")) {
									options.locality = (options.locality) ? options.locality : (match[2]) ? match[2] : ".";
									oSpawn.stdin.write(options.locality + "\n");
								}
								else if (-1 < match[1].indexOf("State or Province Name")) {
									options.state = (options.state) ? options.state : (match[2]) ? match[2] : ".";
									oSpawn.stdin.write(options.state + "\n");
								}
								else if (-1 < match[1].indexOf("Organization Name")) {
									options.organization = (options.organization) ? options.organization : (match[2]) ? match[2] : ".";
									oSpawn.stdin.write(options.organization + "\n");
								}
								else if (-1 < match[1].indexOf("Common Name")) {
									options.common = (options.common) ? options.common : (match[2]) ? match[2] : ".";
									oSpawn.stdin.write(options.common + "\n");
								}
								else if (-1 < match[1].indexOf("Email Address")) {
									options.email = (options.email) ? options.email : (match[2]) ? match[2] : ".";
									oSpawn.stdin.write(options.email + "\n");
								}
								else {
									oSpawn.stdin.write(".\n");
								}

							}
							else {
								result = data;
							}

						}

					}
					catch (e) {
						result = (e.message) ? e.message : e;
					}

				return result;
					
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

	createPrivateKey (keyFilePath, options) {

		if (!options) {

			options = {
				keysize : ("number" === typeof options || "string" === typeof options) ? options : 2048
			};

		}

		// keysize
		options.keysize = ("undefined" === typeof options) ? 2048 : options.keysize;
		options.keysize = ("small" === options.keysize) ? 2048 : options.keysize;
		options.keysize = ("medium" === options.keysize) ? 3072 : options.keysize;
		options.keysize = ("large" === options.keysize) ? 4096 : options.keysize;
		options.keysize = (options.keysize !== 2048 && options.keysize !== 3072 && options.keysize !== 4096) ? 2048 : options.keysize;

		options.country = ("string" === typeof options.country) ? options.country : "";
		options.locality = ("string" === typeof options.locality) ? options.locality : "";
		options.state = ("string" === typeof options.state) ? options.state : "";
		options.organization = ("string" === typeof options.organization) ? options.organization : "";
		options.common = ("string" === typeof options.common) ? options.common : "";
		options.email = ("string" === typeof options.email) ? options.email : "";

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
							options.keysize,
							"-config", _openSSLConfPath
						] : [
							"genrsa",
							"-out", keyFilePath,
							options.keysize
						], options).then((_options) => {
							options = _options;
							return _readFileProm(keyFilePath, "utf8");
						});
						
					}

				});

			}
		
		}).then((data) => {
			return Promise.resolve({ privateKey : data, options : options });
		});

	}

	createCSR (keyFilePath, CSRFilePath, options) {

		return this.createPrivateKey(keyFilePath, (options) ? options : null).then((keys) => {

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
					], keys.options).then((_options) => {
						keys.options = _options;
						return _readFileProm(CSRFilePath, "utf8");
					});

				}

			}).then((data) => {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : data, options : keys.options });
			});
		
		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath, options) {
		
		return this.createCSR(keyFilePath, CSRFilePath, (options) ? options : null).then((keys) => {

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
					], keys.options).then((_options) => {
						keys.options = _options;
						return _readFileProm(CRTFilePath, "utf8");
					});

				}

			}).then((data) => {
				return Promise.resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : data, options : keys.options });
			});
		
		});

	}

};
