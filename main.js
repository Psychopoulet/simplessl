
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

	setOpenSSLBinPath (file) {

		if (fs.isFileSync(file)) {
			_openSSLBinPath = path.normalize(file);
		}
		else {
			throw this.constructor.name + "/setOpenSSLBinPath : '" + file + "' does not exist.";
		}

		return this;

	}

	setOpenSSLConfPath (file) {

		if (fs.isFileSync(file)) {
			_openSSLConfPath = path.normalize(file);
		}
		else {
			throw this.constructor.name + "/setOpenSSLConfPath : '" + file + "' does not exist.";
		}

		return this;
		
	}

	createPrivateKey (keyFilePath, size) {

		let that = this;

		return new Promise(function(resolve, reject) {

			try {

				size = ('undefined' === typeof size) ? 2048 : size;
				size = ('small' === size) ? 2048 : size;
				size = ('medium' === size) ? 3072 : size;
				size = ('large' === size) ? 4096 : size;
				size = (size !== 2048 && size !== 3072 && size !== 4096) ? 2048 : size;

				fs.isFileProm(keyFilePath).then(function(exists) {

					if (exists) {
						return fs.readFileProm(keyFilePath, 'utf8');
					}
					else {
						
						let directory = path.dirname(keyFilePath);

						return fs.mkdirpProm(directory).then(function() {

							let options = [
								'genrsa',
								'-out', keyFilePath,
								size
							];

							if (_openSSLConfPath) {
								options.push('-config', _openSSLConfPath);
							}

							return _wrapper(options).then(function() {
								return fs.readFileProm(keyFilePath, 'utf8');
							});

						});

					}
				
				}).then(function(data) {
					resolve({ privateKey : data });
				}).catch(function(err) {
					reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
				});

			}
			catch (e) {
				reject(that.constructor.name + "/createPrivateKey : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCSR (keyFilePath, CSRFilePath, size) {

		let that = this;

		return new Promise(function(resolve, reject) {
			
			try {

				that.createPrivateKey(keyFilePath, (size) ? size : null).then(function(keys) {

					fs.isFileProm(CSRFilePath).then(function(exists) {

						if (exists) {
							return fs.readFileProm(CSRFilePath, 'utf8');
						}
						else {

							let directory = path.dirname(CSRFilePath);

							return fs.mkdirpProm(directory).then(function() {

								let options = [
									'req',
									'-new',
									'-key', keyFilePath,
									'-out', CSRFilePath
								];

								if (_openSSLConfPath) {
									options.push('-config', _openSSLConfPath);
								}

								return _wrapper(options).then(function() {
									return fs.readFileProm(CSRFilePath, 'utf8');
								});

							});

						}

					}).then(function(data) {
						resolve({ privateKey : keys.privateKey, CSR : data });
					}).catch(function(err) {
						reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
					});
				
				}).catch(reject);

			}
			catch (e) {
				reject(that.constructor.name + "/createCSR : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath, size) {
		
		let that = this;

		return new Promise(function(resolve, reject) {

			try {

				that.createCSR(keyFilePath, CSRFilePath, (size) ? size : null).then(function(keys) {

					fs.isFileProm(CRTFilePath).then(function(exists) {

						if (exists) {
							return fs.readFile(CRTFilePath, 'utf8');
						}
						else {

							let directory = path.dirname(CRTFilePath);

							return fs.mkdirpProm(directory).then(function() {

								let options = [
									'x509',
									'-req',
									'-days', '365',
									'-in', CSRFilePath,
									'-signkey', keyFilePath,
									'-out', CRTFilePath
								];

								return _wrapper(options).then(function() {
									return fs.readFileProm(CRTFilePath, 'utf8');
								});

							});

						}

					}).then(function(data) {
						resolve({ privateKey : keys.privateKey, CSR : keys.CSR, certificate : data });
					}).catch(function(err) {
						reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
					});
				
				}).catch(reject);

			}
			catch (e) {
				reject(that.constructor.name + "/createCertificate : " + ((e.message) ? e.message : e));
			}
			
		});

	}

}
