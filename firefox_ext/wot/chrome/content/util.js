/*
	util.js
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

var wot_util =
{
	isenabled: function()
	{
		try {
			return (wot_prefs.enabled &&
					wot_prefs.eula_accepted &&
					wot_api_register.ready &&
						(!wot_prefs.private_disable ||
						 !wot_browser.isprivatemode()));
		} catch (e) {
			dump("wot_util.isenabled: failed with " + e + "\n");
		}

		return true;
	},

	getstring: function(str, arr)
	{
		try {
			if (!this.string_bundle) {
				this.string_bundle = document.getElementById("wot-strings");
			}
			if (arr) {
				return this.string_bundle.getFormattedString(str, arr);
			} else {
				return this.string_bundle.getString(str);
			}
		} catch (e) {
			dump("wot_util.getstring: failed with " + e + "\n");
		}

		return null;
	},

	dump: function(obj, level)
	{
		var i, tabs = "";
		level = level || 0;

		for (i = 0; i < level; i++) {
			tabs += "\t";
		}

		for (i in obj) {
			if (typeof(obj[i]) != "object") {
				dump(tabs + i + ": " + obj[i] + "\n");
			} else {
				dump(tabs + i + ": (object):\n");
				this.dump(obj[i], level + 1);
			}
		}
	}
};

var wot_url =
{
	gethostname: function(url)
	{
		try {
			if (!url || !url.length) {
				return null;
			}

			var ios = Components.classes["@mozilla.org/network/io-service;1"]
						.getService(Components.interfaces.nsIIOService);

			var parsed = ios.newURI(url, null, null);

			if (!parsed || !parsed.host ||
					!this.issupportedscheme(parsed.scheme)) {
				return null;
			}

			var host = parsed.host.toLowerCase();

			if (!host) {
				return null;
			}

			while (this.isequivalent(host)) {
				host = host.replace(/^[^\.]*\./, "");
			}

			return wot_shared.encodehostname(host, parsed.path);
		} catch (e) {
			/* dump("wot_url.gethostname: failed with " + e + "\n"); */
		}

		return null;
	},

	issupportedscheme: function(scheme)
	{
		try {
			return /^(https?|ftp|mms|rtsp)$/i.test(scheme);
		} catch (e) {
			dump("wot_url.issupportedscheme: failed with " + e + "\n");
		}

		return false;
	},

	isequivalent: function(name)
	{
		try {
			if (!/^www(\d[^\.]*)?\..+\..+$/i.test(name)) {
				return false;
			}

			var component = Components
					.classes["@mozilla.org/network/effective-tld-service;1"];

			if (!component) {
				return true;
			}

			var ts = component.getService(
						Components.interfaces.nsIEffectiveTLDService);

			if (!ts) {
				return true;
			}
			
			var domain = name.replace(/^[^\.]*\./, "");
			var tld = ts.getPublicSuffixFromHost(domain);

			return (domain != tld);
		} catch (e) {
			dump("wot_url.isequivalent: failed with " + e + "\n");
		}

		return false;
	},

	isprivate: function(name)
	{
		try {
			/* This isn't meant to be a comprehensive check, just notice the most
			   common local and private addresses */
			return /^(localhost|((10|127)\.\d+|(172\.(1[6-9]|2[0-9]|3[01])|192\.168))\.\d+\.\d+)$/.test(name);
		} catch (e) {
			dump("wot_url.isprivate: failed with " + e + "\n");
		}

		return false;
	},

	isexcluded: function(name)
	{
		try {
			if (!name || !wot_prefs.norepsfor ||
					wot_prefs.norepsfor.length == 0) {
				return false;
			}

			var hosts = wot_prefs.norepsfor.replace(/\s/g, "").split(",");

			for (var i = 0; i < hosts.length; ++i) {
				if (hosts[i].length == 0) {
					continue;
				}

				if (hosts[i].charAt(0) == '.') {
					if (name.length > hosts[i].length &&
							name.lastIndexOf(hosts[i]) ==
								(name.length - hosts[i].length)) {
						return true;
					}
				} else if (hosts[i].charAt(hosts[i].length - 1) == '.') {
					if (name.indexOf(hosts[i]) == 0) {
						return true;
					}
				} else if (name == hosts[i]) {
					return true;
				}
			}
		} catch (e) {
			dump("wot_url.isexcluded: failed with " + e + "\n");
		}

		return false;
	},

	getwoturl: function(path, context)
	{
		try {
			/* We'll ignore context for now */
			return WOT_MY_URL + path;
		} catch (e) {
			dump("wot_url.getwoturl: failed with " + e + "\n");
		}

		return null;
	},

	getprefurl: function(tab, secure)
	{
		try {
			var path = WOT_PREF_PATH + wot_util.getstring("language") +
						"/" + WOT_PLATFORM + "/" + WOT_VERSION;

			var url = this.getwoturl(path);

			if (url) {
				if (tab) {
					url += "/" + tab;
				}

				if (secure) {
					url = url.replace(/^http\:/, "https:");
				}

				return url;
			}
		} catch (e) {
			dump("wot_url.getprefurl: failed with " + e + "\n");
		}

		return null;
	},

	getapiparams: function()
	{
		try {
			var params = "&lang=" +
				(wot_util.getstring("language") || "en-US");

			var partner = wot_partner.getpartner();

			if (partner) {
				params += "&partner=" + partner;
			}

			params += "&version=" + WOT_PLATFORM + "-" + WOT_VERSION;
			return params;
		} catch (e) {
			dump("wot_url.getapiparams: failed with " + e + "\n");
		}

		return "";
	}
};

var wot_browser =
{
	isoffline: function()
	{
		try {
			var ios = Components.classes["@mozilla.org/network/io-service;1"]
						.getService(Components.interfaces.nsIIOService);

			return ios.offline;
		} catch (e) {
			dump("wot_browser.isoffline: failed with " + e + "\n");
		}

		return false;
	},

	isprivatemode: function()
	{
		try {
			var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]
						.getService(Components.interfaces.nsIPrivateBrowsingService);

			return pbs.privateBrowsingEnabled;
		} catch (e) {
		}

		return false;
	},

	gethostname: function()
	{
		return wot_url.gethostname(this.geturl());
	},

	geturl: function()
	{
		try {
			return getBrowser().contentDocument.location.href;
		} catch (e) {
		}

		return null;
	},

	getreferrer: function()
	{
		try {
			return getBrowser().contentDocument.referrer;
		} catch (e) {
			dump("wot_browser.getreferrer: failed with " + e + "\n");
		}

		return null;
	},

	show_warning: function(hostname, message)
	{
		try {
			var icon = "chrome://wot/skin/fusion/";

			if (wot_prefs.accessible) {
				icon += "accessible/";
			}

			icon += "16_16/plain/danger.png";

			/* There's a chance the user has already changed the tab */
			if (hostname != wot_browser.gethostname()) {
				return;
			}

			var browser = getBrowser();

			if (!browser) {
				return;
			}

			if (browser.getNotificationBox) {
				/* Firefox 2 */
				var nbox = browser.getNotificationBox();

				if (!nbox || nbox.getNotificationWithValue("wot-warning")) {
					return;
				}

			    var buttons = [{
					label: wot_util.getstring("warning_button"),
					accessKey: null,
					popup: "wot-popup",
					callback: null
				}];

			    nbox.appendNotification(
					wot_util.getstring("warning", [message]),
					"wot-warning",
					icon, nbox.PRIORITY_WARNING_HIGH, buttons);
			} else {
				browser.hideMessage(browser.selectedBrowser, "both");
				browser.showMessage(browser.selectedBrowser, icon,
					wot_util.getstring("warning", [message]),
					wot_util.getstring("warning_button"),
					null, null, "wot-popup", "top", true, null);
			}
		} catch (e) {
			dump("wot_browser.show_warning: failed with " + e + "\n");
		}
	},

	hide_warning: function()
	{
		try {
			var browser = getBrowser();

			if (!browser) {
				return;
			}

			if (browser.getNotificationBox) {
				var nbox = browser.getNotificationBox();

				if (!nbox) {
					return;
				}

				var item = nbox.getNotificationWithValue("wot-warning");

				if (!item) {
					return;
				}

				nbox.removeNotification(item);
			} else {
				browser.hideMessage(browser.selectedBrowser, "both");
			}
		} catch (e) {
			dump("wot_browser.hide_warning: failed with " + e + "\n");
		}
	},

	openscorecard: function(hostname, action, content)
	{
		try {
			if (!hostname) {
				return false;
			}
			
			var path = WOT_SCORECARD_PATH + encodeURIComponent(hostname);

			if (action) {
				path += action;
			}

			var browser = getBrowser();
			var url = wot_url.getwoturl(path, content);

			if (browser && url) {
				browser.selectedTab = browser.addTab(url);
				return true;
			}
		} catch (e) {
			dump("wot_browser.openscorecard: failed with " + e + "\n");
		}

		return false;
	},
};
