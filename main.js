
"use strict";

// deps

const	path = require('path'),
		fs = require('simplefs'),
		spawn = require('child_process').spawn;

// private

var _openSSLBinPath, _openSSLConfPath;

function _wrapper (tabArgs) {

	return new Promise(function(resolve, reject) {

		var sResult = '', oSpawn = spawn(_openSSLBinPath, tabArgs);

		oSpawn.stderr.on('data', function (msg) {

			if (msg) {

				msg = msg.toString('binary').trim();

				if ('.' != msg && '+' != msg) {

					try {
						oSpawn.stdin.write("\r\n");
					}
					catch (e) { }

					sResult += msg;

				}
			
			}

		});

		oSpawn.on('close', function (code) {

			if (code) {
				reject(sResult);
			}
			else {
				resolve();
			}

		});

	});

}

// module

module.exports = class SimpleSSL {

	constructor () {

		_openSSLBinPath = process.env.OPENSSL_BIN || 'openssl';
		_openSSLConfPath = process.env.OPENSSL_CONF || null;

	}

	setOpenSSLBinPath (path) {

		if (fs.fileExists(path)) {
			_openSSLBinPath = path;
		}
		else {
			throw this.constructor.name + "/setOpenSSLBinPath : '" + path + "' does not exist.";
		}
		
		return this;
	}

	setOpenSSLConfPath (path) {

		if (fs.fileExists(path)) {
			_openSSLConfPath = path;
		}
		else {
			throw this.constructor.name + "/setOpenSSLConfPath : '" + path + "' does not exist.";
		}
		
		return this;
	}

	createPrivateKey (keyFilePath) {

		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				if (fs.fileExists(keyFilePath)) {

					fs.readFile(keyFilePath, { encoding : 'utf8' } , function (err, data) {

						if (err) {
							reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
						}
						else {
							resolve({ privateKey : data });
						}

					});

				}
				else {

					var directory = path.dirname(keyFilePath);

					if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
						reject(that.constructor.name + "/createPrivateKey : Impossible to create the directory of the security key (" + directory + ").");
					}
					else {

						var options = [
							'genrsa',
							'-out', keyFilePath,
							4096
						];

						if (_openSSLConfPath) {
							options.push('-config');
							options.push(_openSSLConfPath);
						}

						_wrapper(options).then(function() {

							fs.readFile(keyFilePath, { encoding : 'utf8' } , function (err, data) {

								if (err) {
									reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
								}
								else {
									resolve({ privateKey : data });
								}

							});

						})
						.catch(function(err) {
							reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
						});

					}

				}

			}
			catch (e) {
				reject(that.constructor.name + "/createPrivateKey : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCSR (keyFilePath, CSRFilePath) {

		var that = this;

		return new Promise(function(resolve, reject) {
			
			try {

				that.createPrivateKey(keyFilePath).then(function(keys) {

					if (fs.fileExists(CSRFilePath)) {

						fs.readFile(CSRFilePath, { encoding : 'utf8' } , function (err, data) {

							if (err) {
								reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
							}
							else {
								resolve({ privateKey : keys.privateKey, CSR : data });
							}

						});

					}
					else {

						var directory = path.dirname(CSRFilePath);

						if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
							reject(that.constructor.name + "/createCSR : Impossible to create the directory of the security key (" + directory + ").");
						}
						else {

							var options = [
								'req',
								'-new',
								'-key', keyFilePath,
								'-out', CSRFilePath
							];

							if (_openSSLConfPath) {
								options.push('-config');
								options.push(_openSSLConfPath);
							}

							_wrapper(options).then(function() {

								fs.readFile(CSRFilePath, { encoding : 'utf8' } , function (err, data) {

									if (err) {
										reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
									}
									else {
										resolve({ privateKey : keys.privateKey, CSR : data });
									}

								});

							})
							.catch(function(err) {
								reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
							});

						}

					}

				})
				.catch(reject);

			}
			catch (e) {
				reject(that.constructor.name + "/createCSR : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				that.createCSR(keyFilePath, CSRFilePath).then(function(keys) {

					if (fs.fileExists(CRTFilePath)) {

						fs.readFile(CRTFilePath, { encoding : 'utf8' } , function (err, certificate) {

							if (err) {
								reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
							}
							else {
								resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : certificate });
							}

						});

					}
					else {

						var directory = path.dirname(CRTFilePath);

						if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
							reject(that.constructor.name + "/createCertificate : Impossible to create the directory of the security key (" + directory + ").");
						}
						else {

							var options = [
								'x509',
								'-req',
								'-days', '365',
								'-in', CSRFilePath,
								'-signkey', keyFilePath,
								'-out', CRTFilePath
							];

							_wrapper(options).then(function() {

								fs.readFile(CRTFilePath, { encoding : 'utf8' } , function (err, certificate) {

									if (err) {
										reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
									}
									else {
										resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : certificate });
									}

								});

							})
							.catch(function(err) {
								reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
							});

						}

					}

				})
				.catch(reject);

			}
			catch (e) {
				reject(that.constructor.name + "/createCertificate : " + ((e.message) ? e.message : e));
			}
			
		});

	}

}
