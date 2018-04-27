/// <reference types="node" />

declare module "simplessl" {

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

	class SimpleSSL {

		protected _openSSLBinPath: string;
		protected _openSSLConfPath: string;

		constructor();

		public setOpenSSLBinPath(file: string): Promise<void>;
		public setOpenSSLConfPath(file: string): Promise<void>;
		public createPrivateKey(keyfile: string, options?: string|number|iOptions): Promise<iPrivateKey>;
		public createCSR(keyfile: string, csrfile: string, options?: string|number|iOptions): Promise<iPrivateKey>;
		public createCertificate(keyfile: string, csrfile: string, certificatefile: string, options?: string|number|iOptions): Promise<iPrivateKey>;

	}

	export = SimpleSSL;

}
