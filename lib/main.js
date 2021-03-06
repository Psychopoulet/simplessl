/*
	eslint class-methods-use-this: 0
*/

"use strict";

// deps

	// natives
	const { dirname, join, normalize } = require("path");

	// locals
	const directoryExists = require(join(__dirname, "directoryExists.js"));
	const fileExists = require(join(__dirname, "fileExists.js"));
	const readFile = require(join(__dirname, "readFile.js"));
	const wrapper = require(join(__dirname, "wrapper.js"));

// module

module.exports = class SimpleSSL {

	constructor () {

		this._openSSLBinPath = (0, process).env.OPENSSL_BIN || "openssl";
		this._openSSLConfPath = (0, process).env.OPENSSL_CONF || join(__dirname, "openssl.cnf");
		this._showCmd = false;

	}

	setOpenSSLBinPath (file) {

		return "openssl" === file ? Promise.resolve().then(() => {
			this._openSSLBinPath = file;
			return Promise.resolve();
		}) : fileExists(file).then((exists) => {

			return exists ? Promise.resolve().then(() => {
				this._openSSLBinPath = normalize(file);
				return Promise.resolve();
			}) : Promise.reject(new Error("\"" + file + "\" does not exist."));

		});

	}

	setOpenSSLConfPath (file) {

		return fileExists(file).then((exists) => {

			return exists ? Promise.resolve().then(() => {
				this._openSSLConfPath = normalize(file);
				return Promise.resolve();
			}) : Promise.reject(new Error("\"" + file + "\" does not exist."));

		});

	}

	debug (active) {

		if ("undefined" === typeof active) {
			return Promise.reject(new ReferenceError("Missing \"active\" parameter"));
		}
		else if ("boolean" !== typeof active) {
			return Promise.reject(new TypeError("\"active\" parameter is not a boolean"));
		}
		else {
			this._showCmd = active; return Promise.resolve();
		}

	}

	createPrivateKey (keyFilePath, _options) {

		const options = "object" === typeof _options && null !== _options ? _options : {
			"keysize": "number" === typeof _options || "string" === typeof _options ? _options : 2048
		};

		// keysize
		options.keysize = "small" === options.keysize ? 2048 : options.keysize;
		options.keysize = "medium" === options.keysize ? 3072 : options.keysize;
		options.keysize = "large" === options.keysize ? 4096 : options.keysize;
		options.keysize = ![ 2048, 3072, 4096 ].includes(options.keysize) ? 2048 : options.keysize;

		options.country = "string" === typeof options.country ? options.country : "";
		options.locality = "string" === typeof options.locality ? options.locality : "";
		options.state = "string" === typeof options.state ? options.state : "";
		options.organization = "string" === typeof options.organization ? options.organization : "";
		options.common = "string" === typeof options.common ? options.common : "";
		options.email = "string" === typeof options.email ? options.email : "";

		return fileExists(keyFilePath).then((exists) => {

			const keyFileDirectory = dirname(keyFilePath);

			return exists ? readFile(keyFilePath) : directoryExists(keyFileDirectory).then((_exists) => {

				return !_exists ? Promise.reject(
					new Error("\"" + keyFileDirectory + "\" does not exist")
				) : wrapper({
					"bin": this._openSSLBinPath,
					"conf": this._openSSLConfPath
				}, [
					"genrsa",
					"-out",
					keyFilePath,
					options.keysize,
					"-config",
					this._openSSLConfPath
				], options, this._showCmd).then(() => {
					return readFile(keyFilePath);
				});

			});

		}).then((data) => {

			return Promise.resolve({
				options,
				"privateKey": data
			});

		});

	}

	createCSR (keyFilePath, CSRFilePath, options) {

		return this.createPrivateKey(keyFilePath, options ? options : null).then((keys) => {

			return fileExists(CSRFilePath).then((exists) => {

				const CSRFileDirectory = dirname(CSRFilePath);

				return exists ? readFile(CSRFilePath) : directoryExists(CSRFileDirectory).then((_exists) => {

					return !_exists ? Promise.reject(
						new Error("\"" + CSRFileDirectory + "\" does not exist")
					) : wrapper({
						"bin": this._openSSLBinPath,
						"conf": this._openSSLConfPath
					}, [
						"req",
						"-new",
						"-key",
						keyFilePath,
						"-out",
						CSRFilePath,
						"-config",
						this._openSSLConfPath
					], keys.options, this._showCmd).then(() => {
						return readFile(CSRFilePath);
					});

				});

			}).then((data) => {

				return Promise.resolve({
					"CSR": data,
					"options": keys.options,
					"privateKey": keys.privateKey
				});

			});

		});

	}

	createCertificate (keyFilePath, CSRFilePath, CRTFilePath, options) {

		return this.createCSR(keyFilePath, CSRFilePath, options ? options : null).then((keys) => {

			return fileExists(CRTFilePath).then((exists) => {

				const CRTFileDirectory = dirname(CRTFilePath);

				return exists ? readFile(CRTFilePath) : directoryExists(CRTFileDirectory).then((_exists) => {

					return !_exists ? Promise.reject(
						new Error("\"" + CRTFileDirectory + "\" does not exist")
					) : wrapper({
						"bin": this._openSSLBinPath,
						"conf": this._openSSLConfPath
					}, [
						"x509",
						"-req",
						"-days",
						"365",
						"-in",
						CSRFilePath,
						"-signkey",
						keyFilePath,
						"-out",
						CRTFilePath
					], keys.options, this._showCmd).then(() => {
						return readFile(CRTFilePath);
					});

				});

			}).then((data) => {

				return Promise.resolve({
					"certificate": data,
					"CSR": keys.CSR,
					"options": keys.options,
					"privateKey": keys.privateKey
				});

			});

		});

	}

};
