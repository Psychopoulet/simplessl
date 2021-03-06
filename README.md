# simplessl
A basic openssl manager

[![Build status](https://api.travis-ci.org/Psychopoulet/simplessl.svg?branch=master)](https://travis-ci.org/Psychopoulet/simplessl)
[![Coverage status](https://coveralls.io/repos/github/Psychopoulet/simplessl/badge.svg?branch=master)](https://coveralls.io/github/Psychopoulet/simplessl)
[![Dependency status](https://david-dm.org/Psychopoulet/simplessl/status.svg)](https://david-dm.org/Psychopoulet/simplessl)
[![Dev dependency status](https://david-dm.org/Psychopoulet/simplessl/dev-status.svg)](https://david-dm.org/Psychopoulet/simplessl?type=dev)
[![Issues](https://img.shields.io/github/issues/Psychopoulet/simplessl.svg)](https://github.com/Psychopoulet/simplessl/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/Psychopoulet/simplessl.svg)](https://github.com/Psychopoulet/simplessl/pulls)

## Installation

```bash
$ npm install simplessl
```

## Features

   * simply create key, csr & crt and save it in files for ssl use
   * ... with the three or only one function

## Doc

```typescript
interface iOptions {
  keysize?: string|number, // must be equal to : ("small" | 2048) | ("medium" | 3072) | ("large" | 4096)
  country?: string,
  locality?: string,
  state?: string,
  organization?: string,
  common?: string,
  email?: string
}

interface iPrivateKey {
  options: iOptions,
  privateKey: string
}

interface iCSR extends iPrivateKey {
  CSR: string
}

interface iCertificate extends iCSR {
  certificate: string
}
```

   * ``` setOpenSSLBinPath(file: string): Promise<void> ``` set a specific path to the OpenSSL software (default = process.env.OPENSSL_BIN || "openssl")
   * ``` setOpenSSLConfPath(file: string): Promise<void> ``` set a specific path to the OpenSSL configuration (default = process.env.OPENSSL_CONF || <simplessl>/lib/openssl.cnf)
   * ``` createPrivateKey(keyfile: string, options?: string|number|iOptions): Promise<iPrivateKey> ```
   * ``` createCSR(keyfile: string, csrfile: string, options?: string|number|iOptions): Promise<iCSR> ```
   * ``` createCertificate(keyfile: string, csrfile: string, certificatefile: string, options?: string|number|iOptions): Promise<iCertificate> ```

if "options" is given and not an object, define the key's size

## Examples

### Native

```javascript
const SimpleSSL = require("simplessl");

const SSL = new SimpleSSL(),

   crtpath = path.join(__dirname, "crt"),
      serverkey = path.join(crtpath, "server.key"),
      servercsr = path.join(crtpath, "server.csr"),
      servercrt = path.join(crtpath, "server.crt");

// this function will automatically apply SSL.createCSR && SSL.createPrivateKey functions
// if serverkey or servercsr does not exist

SSL.createCertificate(serverkey, servercsr, servercrt, "medium").then((keys) => {

   console.log(keys.privateKey);
   console.log(keys.CSR);
   console.log(keys.certificate);
   console.log(keys.options); // with conf default value added

   return new Promise((resolve) => {

       require("https").createServer({
          key: keys.privateKey,
          cert: keys.certificate
       }).listen(8000, resolve);

   });

}).catch((err) => {
   console.log(err);
});
```

### Typescript

```typescript
import SimpleSSL = require("simplessl");
const SSL = new SimpleSSL();

SSL.createCertificate(serverkey, servercsr, servercrt, "medium").then((data: iCertificate) => {
  console.log(data);
});
```

## Tests

```bash
$ npm run-script tests
```

## License

   [ISC](LICENSE)
