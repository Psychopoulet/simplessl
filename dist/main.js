
"use strict";

// deps

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var path = require("path"),
    fs = require("fs"),
    spawn = require("child_process").spawn;

// private

// attrs

var _openSSLBinPath = null,
    _openSSLConfPath = null;

// methods

function _isFileProm(file) {

	return new Promise(function (resolve, reject) {

		if ("undefined" === typeof file) {
			reject(new ReferenceError("\"file\" does not exists"));
		} else if ("string" !== typeof file) {
			reject(new TypeError("\"file\" is not a string"));
		} else {

			file = file.trim();

			if ("" === file) {
				reject(new Error("\"file\" is empty"));
			} else {

				try {

					fs.stat(file, function (err, stats) {
						resolve(!err && stats && stats.isFile());
					});
				} catch (e) {
					resolve(false);
				}
			}
		}
	});
}

function _isDirectoryProm(dir) {

	return new Promise(function (resolve, reject) {

		if ("undefined" === typeof dir) {
			reject(new ReferenceError("\"dir\" does not exists"));
		} else if ("string" !== typeof dir) {
			reject(new TypeError("\"dir\" is not a string"));
		} else {

			dir = dir.trim();

			if ("" === dir) {
				reject(new Error("\"dir\" is empty"));
			} else {

				try {

					fs.stat(dir, function (err, stats) {
						resolve(!err && stats && stats.isDirectory());
					});
				} catch (e) {
					resolve(false);
				}
			}
		}
	});
}

function _readFileProm(file) {

	return new Promise(function (resolve, reject) {

		fs.readFile(file, "utf8", function (err, content) {

			if (err) {
				reject(err);
			} else {
				resolve(content);
			}
		});
	});
}

function _wrapper(tabArgs) {

	return new Promise(function (resolve, reject) {

		var sResult = "",
		    error = false,
		    oSpawn = spawn(_openSSLBinPath, tabArgs);

		oSpawn.on("error", function (err) {

			error = true;

			if ("string" === typeof err) {
				reject(new Error(err));
			} else if (err instanceof Buffer) {
				reject(new Error(err.toString("utf8")));
			} else {
				reject(err);
			}
		}).on("close", function (code) {

			if (!error) {

				if (code) {
					reject(new Error(sResult));
				} else {
					resolve();
				}
			}
		});

		oSpawn.stdout.on("data", function (data) {

			data = data instanceof Buffer ? data.toString("utf8").trim() : data;

			if ("." != data && "+" != data) {

				try {
					oSpawn.stdin.write("\r\n");
				} catch (e) {
					// nothing to do here
				}

				sResult += data;
			}
		});

		oSpawn.stderr.on("data", function (data) {

			data = data instanceof Buffer ? data.toString("utf8").trim() : data;

			if ("." != data && "+" != data) {

				try {
					oSpawn.stdin.write("\r\n");
				} catch (e) {
					// nothing to do here
				}

				sResult += data;
			}
		});
	});
}

// module

module.exports = function () {
	function SimpleSSL() {
		_classCallCheck(this, SimpleSSL);

		_openSSLBinPath = _openSSLBinPath || process.env.OPENSSL_BIN || "openssl";
		_openSSLConfPath = _openSSLConfPath || process.env.OPENSSL_CONF || null;
	}

	_createClass(SimpleSSL, [{
		key: "createPrivateKey",
		value: function createPrivateKey(keyFilePath, size) {

			size = "undefined" === typeof size ? 2048 : size;
			size = "small" === size ? 2048 : size;
			size = "medium" === size ? 3072 : size;
			size = "large" === size ? 4096 : size;
			size = size !== 2048 && size !== 3072 && size !== 4096 ? 2048 : size;

			return _isFileProm(keyFilePath).then(function (exists) {

				if (exists) {
					return _readFileProm(keyFilePath, "utf8");
				} else {

					return _isDirectoryProm(path.dirname(keyFilePath)).then(function (exists) {

						if (!exists) {
							return Promise.reject(new Error("\"" + path.dirname(keyFilePath) + "\" does not exist"));
						} else {

							return _wrapper(_openSSLConfPath ? ["genrsa", "-out", keyFilePath, size, "-config", _openSSLConfPath] : ["genrsa", "-out", keyFilePath, size]).then(function () {
								return _readFileProm(keyFilePath, "utf8");
							});
						}
					});
				}
			}).then(function (data) {
				return Promise.resolve({ privateKey: data });
			});
		}
	}, {
		key: "createCSR",
		value: function createCSR(keyFilePath, CSRFilePath, size) {

			return this.createPrivateKey(keyFilePath, size ? size : null).then(function (keys) {

				return _isFileProm(CSRFilePath).then(function (exists) {

					if (exists) {
						return _readFileProm(CSRFilePath, "utf8");
					} else {

						return _wrapper(_openSSLConfPath ? ["req", "-new", "-key", keyFilePath, "-out", CSRFilePath, "-config", _openSSLConfPath] : ["req", "-new", "-key", keyFilePath, "-out", CSRFilePath]).then(function () {
							return _readFileProm(CSRFilePath, "utf8");
						});
					}
				}).then(function (data) {
					return Promise.resolve({ privateKey: keys.privateKey, CSR: data });
				});
			});
		}
	}, {
		key: "createCertificate",
		value: function createCertificate(keyFilePath, CSRFilePath, CRTFilePath, size) {

			return this.createCSR(keyFilePath, CSRFilePath, size ? size : null).then(function (keys) {

				return _isFileProm(CRTFilePath).then(function (exists) {

					if (exists) {
						return _readFileProm(CRTFilePath, "utf8");
					} else {

						return _wrapper(["x509", "-req", "-days", "365", "-in", CSRFilePath, "-signkey", keyFilePath, "-out", CRTFilePath]).then(function () {
							return _readFileProm(CRTFilePath, "utf8");
						});
					}
				}).then(function (data) {
					return Promise.resolve({ privateKey: keys.privateKey, CSR: keys.CSR, certificate: data });
				});
			});
		}
	}], [{
		key: "setOpenSSLBinPath",
		value: function setOpenSSLBinPath(file) {

			return _isFileProm(file).then(function (exists) {

				if (exists) {
					_openSSLBinPath = path.normalize(file);
					return Promise.resolve();
				} else {
					return Promise.reject(new Error("\"" + file + "\" does not exist."));
				}
			});
		}
	}, {
		key: "setOpenSSLConfPath",
		value: function setOpenSSLConfPath(file) {

			return _isFileProm(file).then(function (exists) {

				if (exists) {
					_openSSLConfPath = path.normalize(file);
					return Promise.resolve();
				} else {
					return Promise.reject(new Error("\"" + file + "\" does not exist."));
				}
			});
		}
	}]);

	return SimpleSSL;
}();