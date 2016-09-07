# simplessl
A basic ssl manager


## Installation

```bash
$ npm install simplessl
```

## Features

   * simply create key, csr & crt files for ssl use
   * ... with the three or only one function

## Doc

   * ``` setOpenSSLBinPath(string file) : Promise ``` set a specific path to the OpenSSL software
   * ``` setOpenSSLConfPath(string file) : Promise ``` set a specific path to the OpenSSL configuration
   * ``` createPrivateKey(string keyfile [, string|number keysize]) : Promise ```
   * ``` createCSR(string keyfile, string csrfile [, string|number keysize]) : Promise ```
   * ``` createCertificate(string keyfile, string csrfile, string certificatefile [, string|number keysize]) : Promise ```

"keysize" must be equal to : small | 2048 | medium | 3072 | large | 4096

(small = 2048, medium = 3072, large = 4096)

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

SSL.createCertificate(serverkey, servercsr, servercrt).then((data) => {

   console.log(data);

   try {

      require('https').createServer({
         key: data.privateKey,
         cert: data.certificate
      });

   }
   catch(e) {
      console.log(e);
   }

}).catch((err) => {
   console.log(err);
});
```

## Tests

```bash
$ gulp
```

## License

   [ISC](LICENSE)
