/*
	my.js
	Copyright © 2005, 2006, 2007, 2008, 2009  WOT Services Oy <info@mywot.com>

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

var wot_my_session =
{
	clear: function()
	{
		try {
			var mgr = Components.classes["@mozilla.org/cookiemanager;1"].
							getService(Components.interfaces.nsICookieManager);
			if (mgr) {
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "id", "/", false);
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "nonce", "/", false);
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "auth", "/", false);
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "authid", "/", false);
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "reload", "/", false);
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "accessible", "/", false);
				mgr.remove(WOT_MY_COOKIE_DOMAIN, "partner", "/", false);
			}
		} catch (e) {
			dump("wot_my_session.clear: failed with " + e + "\n");
		}
	},

	getcookies: function()
	{
		try {
			var ios = Components.classes["@mozilla.org/network/io-service;1"].
						getService(Components.interfaces.nsIIOService);

			var uri = ios.newURI("http://" + WOT_MY_COOKIE_DOMAIN + "/", "",
						null);

			var cs = Components.classes["@mozilla.org/cookieService;1"].
						getService(Components.interfaces.nsICookieService);

			var cookies = cs.getCookieString(uri, null);

			if (cookies) {
				return cookies;
			}

			/* Wonderful. Third-party cookies are probably disabled, so we'll
 				have to find matching cookies ourselves. */

			var re = RegExp(WOT_MY_COOKIE_DOMAIN.replace(".", "\\.") + "$");

			var mgr = Components.classes["@mozilla.org/cookiemanager;1"].
						getService(Components.interfaces.nsICookieManager);
	
			cookies = "";
			var enumerator = mgr.enumerator;

			while (enumerator.hasMoreElements()) {
				var q = enumerator.getNext();

				if (!q || !q.QueryInterface) {
					continue;
				}

				var c = q.QueryInterface(Components.interfaces.nsICookie);

				if (!c || !c.host || !re.test(c.host)) {
					continue;
				}

				cookies += c.name + "=" + c.value + "; ";
			}

			if (cookies.length > 0) {
				return cookies;
			}
		} catch (e) {
			dump("wot_my_session.getcookies: failed with " + e + "\n");
		}
		return null;
	},

	setcookie: function(name, value)
	{
		try {
			var mgr = Components.classes["@mozilla.org/cookiemanager;1"].
						getService(Components.interfaces.nsICookieManager2);

			if (mgr) {
				/* Session cookies still require an expiration time? */
				var expiry = Date.now() + (WOT_MY_SESSION_LENGTH / 1000);
				try {
					/* Firefox 2 */
					mgr.add(WOT_MY_COOKIE_DOMAIN, "/", name, value, false,
						true, expiry);
				} catch (e) {
					/* Firefox 3 */
					mgr.add(WOT_MY_COOKIE_DOMAIN, "/", name, value, false,
						false, true, expiry);
				}
			}
		} catch (e) {
			dump("wot_my_session.setcookie: failed with " + e + "\n");
		}
	},

	update: function(force)
	{
		try {
			if (!wot_api_register.ready) {
				return;
			}

			if (!wot_prefs.my_cookies) {
				if (force) {
					this.clear();
				}
				return;
			}

			/* Always set these cookies */
			this.setcookie("accessible", wot_prefs.accessible);
			this.setcookie("partner", wot_partner.getpartner() || "");

			/* If it has been WOT_MY_SESSION_LENGTH seconds since the
				session was last updated, force an update */
			if ((Date.now() - Number(wot_prefs.cookie_updated)) >
					WOT_MY_SESSION_LENGTH) {
				force = true;
			}

			/* If we have an authid cookie set by the server (for any id),
				don't update unless forced */
			var current = this.getcookies();
			var authid =
				new RegExp("authid=\\w{" + WOT_LENGTH_WITNESS_ID +	"}");

			if (!force && current && current.match(authid)) {
				return;
			}

			/* Update authentication cookies */
			var nonce = wot_crypto.nonce();

			this.setcookie("id", wot_prefs.witness_id);
			this.setcookie("nonce", nonce);
			this.setcookie("auth", wot_crypto.authenticate("id=" +
				wot_prefs.witness_id + "&nonce=" + nonce));

			/* Update time */
			wot_prefs.setChar("cookie_updated", Date.now().toString());
		} catch (e) {
			dump("wot_my_session.update: failed with " + e + "\n");
		}
	},

	reload: function()
	{
		try {
			if (!wot_api_register.ready || !wot_prefs.my_cookies) {
				return;
			}

			var current = this.getcookies();

			if (!current) {
				return;
			}

			var reload =
				new RegExp("reload=(\\w{" + WOT_LENGTH_WITNESS_ID + "})");
			var match = current.match(reload);

			/* Reload if we have a reload cookie, but with a different id than
				ours */
			if (match && match[1] &&
					match[1] != wot_prefs.witness_id) {
				wot_api_reload.send(match[1]);
			}
		} catch (e) {
			dump("wot_my_session.reload: failed with " + e + "\n");
		}
	}
};
