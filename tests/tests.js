"use strict";

// deps

	const path = require('path'), SimpleSSL = require('../main.js');

// attrs

	var SSL = new SimpleSSL(),
		crtpath = path.join(__dirname, 'crt'),
			serverkey = path.join(crtpath, 'server.key'),
			servercsr = path.join(crtpath, 'server.csr'),
			servercrt = path.join(crtpath, 'server.crt');

// run

	try {

		console.log("----------------");
		console.log("test error");
		console.log("----------------");
		console.log("must be == 'SimpleSSL/setOpenSSLBinPath : 'test' does not exist.' :");

			try {
				SSL.setOpenSSLBinPath('test');
			}
			catch(e) {
				console.log(e);
			}
			
		console.log("must be == 'SimpleSSL/setOpenSSLConfPath : 'test' does not exist.' :");

			try {
				SSL.setOpenSSLConfPath('test');
			}
			catch(e) {
				console.log(e);
			}

		SSL.setOpenSSLConfPath('C:\\Program Files (x86)\\GnuWin32\\share\\openssl.cnf');
			
		console.log("----------------");
		console.log("");

		console.log("----------------");
		console.log("test createPrivateKey");
		console.log("----------------");
		console.log("must be == { privateKey : data } :");
		
		SSL.createPrivateKey(serverkey).then(function(keys) {

			console.log(keys);

			console.log("----------------");
			console.log("");


			console.log("----------------");
			console.log("test createCSR");
			console.log("----------------");
			console.log("must be == { privateKey : data, CSR : data } :");
			
			SSL.createCSR(serverkey, servercsr).then(function(keys) {

				console.log(keys);

				console.log("----------------");
				console.log("");


				console.log("----------------");
				console.log("test createCertificate");
				console.log("----------------");
				console.log("must be == { privateKey : data, CSR : data, certificate : data } :");
				
				SSL.createCertificate(serverkey, servercsr, servercrt).then(function(keys) {

					console.log(keys);

					console.log("----------------");
					console.log("");

					try {

						console.log("----------------");
						console.log("test server on 8080 port");
						console.log("----------------");
						console.log("must be == 'running' :");

						require('https').createServer({
							key: keys.privateKey,
							cert: keys.certificate
						}, function(req, res) {
							res.writeHead(200);
							res.end('hello world\n');
						})
						.listen(8080, function() {

							console.log("running");
							console.log("----------------");
							console.log("");
						});

					}
					catch(e) {
						console.log(e);
						console.log("----------------");
						console.log("");
					}

				})
				.catch(function(err) {

					console.log(err);

					console.log("----------------");
					console.log("");
					
				});

			})
			.catch(function(err) {

				console.log(err);

				console.log("----------------");
				console.log("");
				
			});

		})
		.catch(function(err) {

			console.log(err);

			console.log("----------------");
			console.log("");
			
		});

	}
	catch (e) {
		console.log(e);
	}

	return;
