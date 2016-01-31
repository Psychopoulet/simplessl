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
		console.log("test createPrivateKey");
		console.log("----------------");
		console.log("must be == { privateKey : data } :");
		
		SSL.createPrivateKey(serverkey).then(function(data) {

			console.log(data);

			console.log("----------------");
			console.log("");


			console.log("----------------");
			console.log("test createCSR");
			console.log("----------------");
			console.log("must be == { privateKey : data, CSR : data } :");
			
			SSL.createCSR(serverkey, servercsr).then(function(data) {

				console.log(data);

				console.log("----------------");
				console.log("");


				console.log("----------------");
				console.log("test createCertificate");
				console.log("----------------");
				console.log("must be == { privateKey : data, CSR : data, certificate : data } :");
				
				SSL.createCertificate(serverkey, servercsr, servercrt).then(function(data) {

					console.log(data);

					console.log("----------------");
					console.log("");

					try {

						require('https').createServer({
							key: data.privateKey,
							cert: data.certificate
						});

					}
					catch(e) {
						console.log(e);
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
