
"use strict";

// deps

const	path = require('path'),
		fs = require('simplefs'),
		spawn = require('child_process').spawn,
		pem = require('pem');

// private

var _openSSLBinPath, _openSSLConfPath;

function _wrapper (tabArgs, binary) {

	return new Promise(function(resolve, reject) {

		var sResult = '', oSpawn = spawn(_openSSLBinPath, tabArgs);

		oSpawn.stderr.on('data', function (msg) {

			if (msg) {

				msg = (binary) ? msg.toString('binary') : msg;

				if ('.' != msg && '+' != msg) {

					console.log('stderr');
					console.log(msg);

					oSpawn.stdin.write("\r\n");

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
			pem.config({ pathOpenSSL : path });
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

						_wrapper([
							'genrsa',
							'-out', keyFilePath,
							2048
						]).then(function() {

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

						/*var directory = path.dirname(keyFilePath);

						if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
							reject(that.constructor.name + "/createCSR : Impossible to create the directory of the security key (" + directory + ").");
						}
						else {

							_wrapper([
								'req',
								'-new',
								'-key', keyFilePath,
								'-out', CSRFilePath
							], true).then(function() {

								fs.readFile(keyFilePath, { encoding : 'utf8' } , function (err, data) {

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

						}*/

						pem.createCSR({ clientKey : createPrivateKeyData.privateKey, hash : 'sha256' }, function(err, data) {

							if (err) {
								reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
							}
							else {

								var directory = path.dirname(CSRFilePath);

								if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
									reject(that.constructor.name + "/createCSR : Impossible to create the directory of the signing request certificate.");
								}
								else {

									fs.writeFile(CSRFilePath, data.csr, function (err) {

										if (err) {
											reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
										}
										else {
											resolve({ privateKey : createPrivateKeyData.privateKey, CSR : data.csr });
										}

									});

								}

							}
							
						});

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

				that.createCSR(keyFilePath, CSRFilePath).then(function(createCSRData) {

					if (fs.fileExists(CRTFilePath)) {

						fs.readFile(CRTFilePath, { encoding : 'utf8' } , function (err, certificate) {

							if (err) {
								reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
							}
							else {
								resolve({ privateKey : createCSRData.privateKey, CSR : createCSRData.CSR, certificate : certificate });
							}

						});

					}
					else {

						var options = { clientKey : createCSRData.privateKey, csr : createCSRData.CSR, selfSigned : true, days : 365 };

						if (_openSSLConfPath) {
							options.extFile = _openSSLConfPath;
						}

						pem.createCertificate(options, function(err, data) {

							if (err) {
								reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
							}
							else {

								var directory = path.dirname(CRTFilePath);

								if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
									reject(that.constructor.name + "/createCertificate : Impossible to create the directory of the certificate.");
								}
								else {

									fs.writeFile(CRTFilePath, data.certificate, function (err) {

										if (err) {
											reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
										}
										else {
											resolve({ privateKey : createCSRData.privateKey, CSR : createCSRData.CSR, certificate :  data.certificate });
										}

									});

								}

							}
							
						});

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
