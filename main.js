
"use strict";

// deps

const	path = require('path'),
		fs = require('simplefs'),
		pem = require('pem');

// module

module.exports = class SimpleSSL {

	constructor () { }

	setOpenSSLPath (path) {
		pem.config({ pathOpenSSL : path });
		return this;
	}

	createPrivateKey (p_sKeyFilePath) {

		var that = this;

		return new Promise(function(resolve, reject) {
			
			try {

				if (fs.fileExists(p_sKeyFilePath)) {

					fs.readFile(p_sKeyFilePath, { encoding : 'utf8' } , function (err, data) {

						if (err) {
							reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
						}
						else {
							resolve({ privateKey : data });
						}

					});

				}
				else {

					pem.createPrivateKey(2048, function(err, data) {

						if (err) {
							reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
						}
						else {

							var directory = path.dirname(p_sKeyFilePath);

							if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
								reject(that.constructor.name + "/createPrivateKey : Impossible to create the directory of the security key.");
							}
							else {

								fs.writeFile(p_sKeyFilePath, data.key, function (err) {

									if (err) {
										reject(that.constructor.name + "/createPrivateKey : " + ((err.message) ? err.message : err));
									}
									else {
										resolve({ privateKey : data.key });
									}

								});

							}

						}

					});

				}

			}
			catch (e) {
				reject(that.constructor.name + "/createPrivateKey : " + ((e.message) ? e.message : e));
			}
			
		});

	}

	createCSR (p_sKeyFilePath, p_sCSRFilePath) {

		var that = this;

		return new Promise(function(resolve, reject) {
			
			try {

				that.createPrivateKey(p_sKeyFilePath)
					.then(function(createPrivateKeyData) {

						if (fs.fileExists(p_sCSRFilePath)) {

							fs.readFile(p_sCSRFilePath, { encoding : 'utf8' } , function (err, CSR) {

								if (err) {
									reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
								}
								else {
									resolve({ privateKey : createPrivateKeyData.privateKey, CSR : CSR });
								}

							});

						}
						else {

							pem.createCSR({ clientKey : createPrivateKeyData.privateKey, hash : 'sha256' }, function(err, data) {

								if (err) {
									reject(that.constructor.name + "/createCSR : " + ((err.message) ? err.message : err));
								}
								else {

									var directory = path.dirname(p_sCSRFilePath);

									if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
										reject(that.constructor.name + "/createCSR : Impossible to create the directory of the signing request certificate.");
									}
									else {

										fs.writeFile(p_sCSRFilePath, data.csr, function (err) {

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

	createCertificate (p_sKeyFilePath, p_sCSRFilePath, p_sCRTFilePath) {
		
		var that = this;

		return new Promise(function(resolve, reject) {

			try {

				that.createCSR(p_sKeyFilePath, p_sCSRFilePath)
					.then(function(createCSRData) {

						if (fs.fileExists(p_sCRTFilePath)) {

							fs.readFile(p_sCRTFilePath, { encoding : 'utf8' } , function (err, certificate) {

								if (err) {
									reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
								}
								else {
									resolve({ privateKey : createCSRData.privateKey, CSR : createCSRData.CSR, certificate : certificate });
								}

							});

						}
						else {

							pem.createCertificate({ clientKey : createCSRData.privateKey, csr : createCSRData.CSR, selfSigned : true, days : 365 }, function(err, data) {

								if (err) {
									reject(that.constructor.name + "/createCertificate : " + ((err.message) ? err.message : err));
								}
								else {

									var directory = path.dirname(p_sCRTFilePath);

									if (!fs.dirExists(directory) && !fs.mkdirp(directory)) {
										reject(that.constructor.name + "/createCertificate : Impossible to create the directory of the certificate.");
									}
									else {

										fs.writeFile(p_sCRTFilePath, data.certificate, function (err) {

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
