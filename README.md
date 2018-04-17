# simplessl
A basic openssl manager

[![Build Status](https://api.travis-ci.org/Psychopoulet/simplessl.svg?branch=master)](https://travis-ci.org/Psychopoulet/simplessl)
[![Coverage Status](https://coveralls.io/repos/github/Psychopoulet/simplessl/badge.svg?branch=master)](https://coveralls.io/github/Psychopoulet/simplessl)
[![Dependency Status](https://img.shields.io/david/Psychopoulet/simplessl/master.svg)](https://github.com/Psychopoulet/simplessl)

## Installation

```bash
$ npm install simplessl
```

## Features

   * simply create key, csr & crt and save it in files for ssl use
   * ... with the three or only one function

## Doc

   * ``` setOpenSSLBinPath(string file) : Promise ``` set a specific path to the OpenSSL software
   * ``` setOpenSSLConfPath(string file) : Promise ``` set a specific path to the OpenSSL configuration
   * ``` createPrivateKey(string keyfile [, string|number|object options]) : Promise ```
   * ``` createCSR(string keyfile, string csrfile [, string|number options]) : Promise ```
   * ``` createCertificate(string keyfile, string csrfile, string certificatefile [, string|number|object options]) : Promise ```

if 'options' is given and not an object

  => define the key's size

else

  * string|number options.keysize : must be equal to : ('small' | 2048) | ('medium' | 3072) | ('large' | 4096)
  * string options.country
  * string options.locality
  * string options.state
  * string options.organization
  * string options.common
  * string options.email

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

SSL.createCertificate(serverkey, servercsr, servercrt, 'medium').then((keys) => {

   console.log(keys.privateKey);
   console.log(keys.CSR);
   console.log(keys.certificate);
   console.log(keys.options); // with conf default value added

   return new Promise((resolve, reject) => {

      try {

         require('https').createServer({
            key: keys.privateKey,
            cert: keys.certificate
         }).listen(8000, resolve);

      }
      catch(e) {
         reject(e);
      }

   });

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
