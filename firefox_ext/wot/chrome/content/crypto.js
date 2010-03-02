/*
	crypto.js
	Copyright © 2005, 2006, 2007, 2009  WOT Services Oy <info@mywot.com>

	This file is part of WOT.

	WOT is free software: you can redistribute it and/or modify it
	under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	WOT is distributed in the hope that it will be useful, but WITHOUT
	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
	or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
	License for more details.

	You should have received a copy of the GNU General Public License
	along with WOT. If not, see <http://www.gnu.org/licenses/>.
*/

/* Provides a simple wrapper for nsICryptoHash */
var wot_hash =
{
	init: function()
	{
		try {
			if (this.handle) {
				return;
			}
			this.handle = Components.classes["@mozilla.org/security/hash;1"].
	                        getService(Components.interfaces.nsICryptoHash);

			window.addEventListener("unload", function(e) {
					wot_hash.unload();
				}, false);
		} catch (e) {
			dump("wot_hash.add: failed with " + e + "\n");
		}
	},

	unload: function()
	{
		this.handle = null;
	},

	/* Converts a string of bytes (code < 256) to an array of bytes, don't
	   use for multibyte strings */
	strtobin: function(str)
	{
		try {
			var bin = [];

			for (var i = 0; i < str.length; ++i) {
				bin[i] = str.charCodeAt(i) & 0xFF;
			}
			return bin;
		} catch (e) {
			dump("wot_hash.strtobin: failed with " + e + "\n");
		}
		return null;
	},

	/* Converts an array of bytes to a string of bytes */
	bintostr: function(bin)
	{
		try {
			var str = "";

			for (var i = 0; i < bin.length; ++i) {
				str += String.fromCharCode(bin[i] & 0xFF);
			}

			return str;
		} catch (e) {
			dump("wot_hash.bintostr: failed with " + e + "\n");
		}
		return null;
	},

	/* Converts a hex string to an array of bytes */
	hextobin: function(str)
	{
		try {
			/* We assume ASCII-compatible values for basic alnums */
			var asciitonibble = function(c)
			{
				var code_a = 'a'.charCodeAt(0);

				if (c >= code_a) {
					return (c - code_a + 10);
				} else {
					return (c - '0'.charCodeAt(0));
				}
			}
			var bin = [];

			for (var i = 0; i < str.length / 2; ++i) {
				bin[i] = asciitonibble(str.charCodeAt(2 * i    )) <<  4 |
						 asciitonibble(str.charCodeAt(2 * i + 1)) & 0xF;
			}
			return bin;
		} catch (e) {
			dump("wot_hash.hextobin: failed with " + e + "\n");
		}
		return null;
	},

	/* Converts an array of bytes to a hex string */
	bintohex: function(bin)
	{
		const HEX = "0123456789abcdef";
		var str = "";

		try {
			for (var i = 0; i < bin.length; ++i) {
				str += HEX.charAt((bin[i] >> 4) & 0xF);
				str += HEX.charAt( bin[i]       & 0xF);
			}
			return str;
		} catch (e) {
			dump("wot_hash.bintohex: failed with " + e + "\n");
		}
		return null;
	},

	/* Returns an array of bytes containing the SHA-1 hash from the given
	   array of bytes */
	sha1bin: function(bin)
	{
		try {
			this.handle.init(Components.interfaces.nsICryptoHash.SHA1);
			this.handle.update(bin, bin.length);

			/* Takes an array, but returns a string? */
			return this.strtobin(this.handle.finish(false));

		} catch (e) {
			dump("wot_hash.sha1bin: failed with " + e + "\n");
		}
		return null;
	},

	/* Returns an array of bytes containing the SHA-1 hash from the given
	   string of bytes */
	sha1str: function(str)
	{
		return this.sha1bin(this.strtobin(str));
	},

	/* Returns an array of bytes containing the SHA-1 hash from the given
	   hex string */
	sha1hex: function(str)
	{
		return this.sha1bin(this.hextobin(str));
	},

	/* Returns an array of bytes containing the HMAC-SHA-1 from the given
	   string of bytes using the given hex string key */
	hmac_sha1hex: function(hexkey, str)
	{
		try {
			var key = this.hextobin(hexkey);

			if (key.length > 20) {
				key = this.sha1bin(key);
			}

			var ipad = Array(64), opad = Array(64);

			for (var i = 0; i < 20; ++i) {
				ipad[i] = key[i] ^ 0x36;
				opad[i] = key[i] ^ 0x5C;
			}
			for (var j = 20; j < 64; ++j) {
				ipad[j] = 0x36;
				opad[j] = 0x5C;
			}

			var inner = this.sha1bin(ipad.concat(this.strtobin(str)));
			return this.sha1bin(opad.concat(inner));
		} catch (e) {
			dump("wot_hash.hmac_sha1hex: failed with " + e + "\n");
			return null;
		}
	}
};

wot_hash.init();

var wot_arc4 =
{
	/* Takes a key as an array of bytes, returns a context */
	create: function(key)
	{
		try {
			var i, j = 0, k = 0, l;
			var ctx = {};

			ctx.s = [];
			ctx.x = 1;
			ctx.y = 0;

			for (i = 0; i < 256; ++i) {
				ctx.s[i] = i;
			}
			for (i = 0; i < 256; ++i) {
				l = ctx.s[i];
				j = (j + key[k] + l) & 0xFF;
				ctx.s[i] = ctx.s[j];
				ctx.s[j] = l;
				if (++k >= key.length) {
					k = 0;
				}
			}

			return ctx;
		} catch (e) {
			dump("trust_arc4.create failed with " + e + "\n");
			return null;
		}
	},

	/* Takes context and input as an array of bytes, returns crypted string
	   also as an array of bytes */
	crypt: function(ctx, input)
	{
		try {
			var i, j, k;
			var output = [];

			for (i = 0; i < input.length; ++i) {
				j = ctx.s[ctx.x];
				ctx.y = (ctx.y + j) & 0xFF;
				k = ctx.s[ctx.y];
				ctx.s[ctx.x] = k;
				ctx.s[ctx.y] = j;
				ctx.x = (ctx.x + 1) & 0xFF;
				output[i] = (input[i] ^ ctx.s[(j + k) & 0xFF]) & 0xFF;
			}

			return output;
		} catch(e) {
			dump("trust_arc4.crypt failed with " + e + "\n");
			return null;
		}
	}
};

const WOT_CRYPTO_COUNTER = "wot_crypto_counter";

var wot_crypto =
{
	init: function()
	{
		try {
			wot_hashtable.set(WOT_CRYPTO_COUNTER, Number(Date.now()));
		} catch (e) {
			dump("wot_crypto.init: failed with " + e + "\n");
		}
	},

	nonce: function()
	{
		try {
			var counter = wot_hashtable.get(WOT_CRYPTO_COUNTER);

			wot_hashtable.set(WOT_CRYPTO_COUNTER,
				Number(counter) + 1);

			return wot_hash.bintohex(wot_hash.sha1str(
						wot_prefs.witness_id +
						wot_prefs.update_checked +
						wot_prefs.update_version +
						wot_prefs.cookie_updated +
						WOT_VERSION +
						wot_browser.geturl() +
						wot_browser.getreferrer() +
						counter +
						Date.now()));
		} catch (e) {
			dump("wot_crypto.nonce: failed with " + e + "\n");
		}

		return Date.now().toString();
	},

	getrandomid: function()
	{
		try {
			var id = this.nonce();

			if (/^[0-9]/.test(id)) {
				/* Convert the first character to a letter */
				id = String.fromCharCode(id.charCodeAt(0) + "1".charCodeAt(0)) +
						id.substr(1);
			}

			return id.substr(0, Math.floor(Math.random() * 13 + 8));
		} catch (e) {
			dump("wot_crypto.nonce: failed with " + e + "\n");
		}

		return null;
	},

	authenticate: function(str)
	{
		try {
			return wot_hash.bintohex(
				wot_hash.hmac_sha1hex(wot_prefs.witness_key, str));
		} catch (e) {
			dump("wot_crypto.authenticate: failed with " + e + "\n");
		}
		return null;
	},

	authenticate_query: function(str)
	{
		return str + "&auth=" + this.authenticate(str);
	},

	islevel: function(level)
	{
		try {
			var l = wot_prefs.status_level;

			if (!l || l.length != 40) {
				return false;
			}

			var h = wot_hash.bintohex(wot_hash.hmac_sha1hex(
						wot_prefs.witness_key, "level=" + level));

			return (l == h);
		} catch (e) {
			dump("wot_crypto.islevel: failed with " + e + "\n");
		}
		return false;
	}
};

wot_crypto.init();
