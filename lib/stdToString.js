
"use strict";

// consts

	const ENCODING = "ascii";

// module

module.exports = (msg) => {

	if ("object" !== typeof msg) {
		return String(msg);
	}
	else if (msg instanceof Buffer) {
		return msg.toString(ENCODING);
	}
	else {
		return msg.message ? msg.message : String(msg);
	}

};
