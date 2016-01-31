# simplessl
A basic ssl manager


## Installation

```bash
$ npm install simplessl
```

## Features

  * simply create key, csr & crt files for ssl use
  * ... with the three or only one function !

## Examples

```js

const SimpleSSL = require('simplessl');

var SSL = new SimpleSSL(),

	crtpath = path.join(__dirname, 'crt'),
		serverkey = path.join(crtpath, 'server.key'),
		servercsr = path.join(crtpath, 'server.csr'),
		servercrt = path.join(crtpath, 'server.crt');

// this function will automatically apply SSL.createCSR && SSL.createPrivateKey functions
// if serverkey or servercsr does not exist

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

```

## Tests

```bash
$ node tests/tests.js
```

## License

  [ISC](LICENSE)
