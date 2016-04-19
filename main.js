
"use strict";

// deps

const	path = require('path'),
		fs = require('simplefs'),
		spawn = require('child_process').spawn;

// private

var _openSSLBinPath, _openSSLConfPath;

function _wrapper (tabArgs) {

	return new Promise(function(resolve, reject) {

		let sResult = '', oSpawn = spawn(_openSSLBinPath, tabArgs);

		oSpawn.on('close', function (code) {

			if (code) {
				reject(sResult);
			}
			else {
				resolve();
			}

		})
		.stderr.on('data', function (msg) {

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

	});

}

// module

module.exports = class SimpleSSL {

	constructor () {

		_openSSLBinPath = process.env.OPENSSL_BIN || 'openssl';
		_openSSLConfPath = process.env.OPENSSL_CONF || null;

	}

	setOpenSSLBinPath (path) {

		fs.pfileExists(path).then(function(exists) {

			if (exists) {
				_openSSLBinPath = path;
			}
			else {
				throw this.constructor.name + "/setOpenSSLBinPath : '" + path + "' does not exist.";
			}
		
		}).catch(function(err) {
			throw this.constructor.name + "/setOpenSSLBinPath : " + err;
		});

		return this;

	}

	setOpenSSLConfPath (path) {

		fs.pfileExists(path).then(function(exists) {

			if (exists) {
				_openSSLConfPath = path;
			}
			else {
				throw this.constructor.name + "/setOpenSSLConfPath : '" + path + "' does not exist.";
			}
		
		}).catch(function(err) {
			throw this.constructor.name + "/setOpenSSLConfPath : " + err;
		});

		return this;
		
	}

	createPrivateKey (keyFilePath) {

		let that = this;

		return new Promise(function(resolve, reject) {

			try {

				fs.pfileExists(keyFilePath).then(function(exists) {

					if (exists) {
						
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
						
						let directory = path.dirname(keyFilePath);

						fs.amkdirp(directory, function(err) {

							if (err) {
								reject(that.constructor.name + "/createPrivateKey : Impossible to create the security key's directory (" + directory + ").");
							}
							else {

								let options = [
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

						});

					}
				
				}).catch(function(err) {
					throw this.constructor.name + "/createPrivateKey : " + err;
				});

			}
			catch (e) {
				reject(that.constructor.name + "/createPrivateKey : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCSR (keyFilePath, CSRFilePath) {

		let that = this;

		return new Promise(function(resolve, reject) {
			
			try {

				that.createPrivateKey(keyFilePath).then(function(keys) {

					fs.pfileExists(CSRFilePath).then(function(exists) {

						if (exists) {
							
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

							let directory = path.dirname(CSRFilePath);

							fs.amkdirp(directory, function(err) {

								if (err) {
									reject(that.constructor.name + "/createCSR : Impossible to create the security key's directory (" + directory + ").");
								}
								else {

									let options = [
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

							});

						}

					}).catch(function(err) {
						throw this.constructor.name + "/createCSR : " + err;
					});

				})
				.catch(reject);

			}
			catch (e) {
				reject(that.constructor.name + "/createCSR : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			try {

				that.createCSR(keyFilePath, CSRFilePath).then(function(keys) {

					fs.pfileExists(CRTFilePath).then(function(exists) {

						if (exists) {
							
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

							let directory = path.dirname(CRTFilePath);

							fs.amkdirp(directory, function(err) {

								if (err) {
									reject(that.constructor.name + "/createCertificate : Impossible to create the security key's directory (" + directory + ").");
								}
								else {

									let options = [
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

							});

						}

					}).catch(function(err) {
						throw this.constructor.name + "/createCertificate : " + err;
					});

				})
				.catch(reject);

			}
			catch (e) {
				reject(that.constructor.name + "/createCertificate : " + ((e.message) ? e.message : e));
			}
			
		});

	}

}
