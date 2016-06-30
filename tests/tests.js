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

describe("errors", function() {

	before(function(done) {
		fs.rmdirpProm(crtpath).then(done).catch(done);
	});

	it("should check type value", function() {
		assert.throws(function() { SSL.setOpenSSLBinPath("test"); }, Error, "check type value does not throw an error");
		assert.throws(function() { SSL.setOpenSSLConfPath("test"); }, Error, "check type value does not throw an error");
	});

});

describe("create private key", function() {

	it("should create private key", function(done) {

		SSL.createPrivateKey(serverkey).then(function(keys) {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			done();

		}).catch(done);

	});

});

describe("create CSR", function() {

	it("should create CSR", function(done) {

		SSL.createCSR(serverkey, servercsr).then(function(keys) {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			done();

		}).catch(done);

	});

});

describe("create certificate", function() {

	it("should create certificate", function(done) {

		SSL.createCertificate(serverkey, servercsr, servercrt).then(function(keys) {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");
			done();

		}).catch(done);

	});

});

describe("server", function() {

	after(function(done) {
		fs.rmdirpProm(crtpath).then(done).catch(done);
	});

	it("should check type value", function(done) {

		SSL.createCertificate(serverkey, servercsr, servercrt).then(function(keys) {

			assert.strictEqual("string", typeof keys.privateKey, "private key was not generated");
			assert.strictEqual("string", typeof keys.CSR, "private key was not generated");
			assert.strictEqual("string", typeof keys.certificate, "certificate was not generated");

			let server = require("https").createServer({
				key: keys.privateKey,
				cert: keys.certificate
			}).listen(8080, function() {
				server.close();
				done();
			});

		}).catch(done);

	});

});
