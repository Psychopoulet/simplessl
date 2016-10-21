"use strict";

// deps

	const 	path = require("path"),
			assert = require("assert"),

			fs = require("node-promfs"),

			SimpleSSL = require(path.join(__dirname, "..", "lib", "main.js"));

// private

	var SSL = new SimpleSSL(),
		crtpath = path.join(__dirname, "crt"),
			serverkey = path.join(crtpath, "server.key"),
			servercsr = path.join(crtpath, "server.csr"),
			servercrt = path.join(crtpath, "server.crt");

// tests

describe("errors", () => {

	before(() => { return fs.rmdirpProm(crtpath); });

	it("should check setOpenSSLBinPath type value", (done) => {

		SimpleSSL.setOpenSSLBinPath("test").then(() => {
			done("check type value does not throw an error");
		}).catch(() => {
			done();
		});

	});

	it("should check setOpenSSLConfPath type value", (done) => {
		
		SimpleSSL.setOpenSSLConfPath("test").then(() => {
			done("check type value does not throw an error");
		}).catch(() => {
			done();
		});

	});

});

describe("create private key", () => {

	it("should create private key", () => {

		return SSL.createPrivateKey(serverkey).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");

		});

	});

});

describe("create CSR", () => {

	it("should create CSR", () => {

		return SSL.createCSR(serverkey, servercsr).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");

		});

	});

});

describe("create certificate", () => {

	it("should create certificate", () => {

		return SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

		});

	});

});

describe("server", () => {

	before(() => { return fs.rmdirpProm(crtpath); });

	it("should check type value", (done) => {

		SSL.createCertificate(serverkey, servercsr, servercrt).then((keys) => {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

			let server = require("https").createServer({
				key: keys.privateKey,
				cert: keys.certificate
			}).listen(8080, () => {
				server.close();
				done();
			});

		}).catch(done);

	});

});
