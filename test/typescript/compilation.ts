/// <reference path="../../lib/index.d.ts" />

import SimpleSSL = require("../../lib/main.js");

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

const ssl = new SimpleSSL();

ssl.createCertificate("./key", "./csr", "./crt", "medium").then((data: iCertificate) => {
  console.log(data);
});
