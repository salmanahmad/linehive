/*
	api/query.js
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

var wot_api_query =
{
	init: function()
	{
		this.message = "";
		this.message_id = "";
		this.message_type = "";
		this.message_url = "";
		this.users = [];
	},

	send: function(hostname, callback)
	{
		try {
			if (!wot_util.isenabled()) {
				return false;
			}

			if (wot_cache.iscached(hostname) &&
					(wot_cache.get(hostname, "pending") ||
						wot_cache.get(hostname, "inprogress"))) {
				return false;
			}

			wot_cache.create(hostname);
			wot_cache.set(hostname, "time", Date.now());
			wot_cache.set(hostname, "inprogress", true);
			wot_cache.set(hostname, "status", WOT_QUERY_ERROR);

			var nonce = wot_crypto.nonce();

			var context = wot_arc4.create(wot_hash.hmac_sha1hex(
								wot_prefs.witness_key, nonce));

			if (!context) {
				wot_cache.set(hostname, "inprogress", false);
				return false;
			}

			var crypted = wot_arc4.crypt(context, wot_hash.strtobin(
								wot_idn.utftoidn(hostname)));

			if (!crypted) {
				wot_cache.set(hostname, "inprogress", false);
				return false;
			}

			var qs = WOT_SERVICE_API_QUERY +
				"?id=" 		+ wot_prefs.witness_id +
				"&nonce="	+ nonce +
				"&target="	+ encodeURIComponent(btoa(
									wot_hash.bintostr(crypted))) +
				wot_url.getapiparams();

			var request = new XMLHttpRequest();

			wot_cache.add_nonce(nonce, hostname);

			request.open("GET", WOT_SERVICE_NORMAL +
				wot_crypto.authenticate_query(qs));

			new wot_cookie_remover(request);
			request.timeout = null;

			request.onload = function(event)
			{
				try {
					if (request.timeout) {
						window.clearTimeout(request.timeout);
						request.timeout = null;
					}

					wot_cache.set(hostname, "time", Date.now());

					if (request.status == 200) {
						wot_cache.add_query(
							request.responseXML.getElementsByTagName(
								WOT_SERVICE_XML_QUERY),
							request.responseXML.getElementsByTagName(
								WOT_SERVICE_XML_QUERY_TARGET),
							false);

						wot_api_query.init();

						wot_api_query.parse_messages(
							request.responseXML.getElementsByTagName(
									WOT_SERVICE_XML_QUERY_MSG));

						wot_api_query.parse_users(
							request.responseXML.getElementsByTagName(
									WOT_SERVICE_XML_QUERY_USER));

						wot_api_query.parse_status(
							request.responseXML.getElementsByTagName(
									WOT_SERVICE_XML_QUERY_STATUS));
					}

					wot_cache.set(hostname, "inprogress", false);
					wot_cache.remove_nonce(nonce);
					wot_core.update();

					if (typeof(callback) == "function") {
						callback();
					}
				} catch (e) {
					dump("wot_api_query.onload: failed with " + e + "\n");
				}
			};

			request.send(null);

			/* If we don't receive data reasonably soon, retry */
			request.timeout = window.setTimeout(this.timeout,
				WOT_TIMEOUT_QUERY, request, hostname, callback);

			return true;
		} catch (e) {
			dump("wot_api_query.send: failed with " + e + "\n");
		}
		return false;
	},

	timeout: function(request, hostname, callback) /* XMLHttpRequest */
	{
		try {
			if (request.timeout) {
				window.clearTimeout(request.timeout);
				request.timeout = null;
			}

			if (!wot_cache.get(hostname, "inprogress")) {
				return;
			}

			dump("wot_api_query.timeout: for " + hostname + "\n");

			request.abort();
			wot_cache.set(hostname, "time", Date.now());
			wot_cache.set(hostname, "inprogress", false);
			wot_core.update();
			
			if (typeof(callback) == "function") {
				callback();
			}
		} catch (e) {
			dump("wot_api_query.timeout: failed with " + e + "\n");
		}
	},

	parse_messages: function(messages)
	{
		try {
			if (!messages) {
				return;
			}

			var i = 0;
			var m = messages.item(0);
			var type, target, version, than, url;

			while (m) {
				/* Display the first message that is targeted to us */
				msgid	= m.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_MSG_ID);
				type    = m.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_MSG_TYPE);
				url     = m.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_MSG_URL);
				target  = m.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_MSG_TARGET);
				version = m.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_MSG_VERSION);
				than    = m.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_MSG_THAN);

				/* Must have mandatory fields */
				if (msgid && msgid.nodeValue && type && type.nodeValue &&
					target && target.nodeValue &&
					m.firstChild && m.firstChild.nodeValue &&
						(target.nodeValue == WOT_SERVICE_XML_QUERY_MSG_TARGET_ALL ||
							target.nodeValue == WOT_PLATFORM)) {
					/* A message targeted to our platform */
					if (version && version.nodeValue && than && than.nodeValue) {
						/* A versioned message */
						if ((version.nodeValue ==
									WOT_SERVICE_XML_QUERY_MSG_VERSION_EQ &&
								Number(WOT_VERSION) == Number(than.nodeValue)) ||
							(version.nodeValue ==
									WOT_SERVICE_XML_QUERY_MSG_VERSION_LE &&
								Number(WOT_VERSION) <= Number(than.nodeValue)) ||
							(version.nodeValue ==
									WOT_SERVICE_XML_QUERY_MSG_VERSION_GE &&
								Number(WOT_VERSION) >= Number(than.nodeValue))) {
							/* Targeted to us */
							this.message_id = msgid.nodeValue;
							this.message_type = type.nodeValue;
							this.message = m.firstChild.nodeValue;
							if (url && url.nodeValue) {
								this.message_url = url.nodeValue;
							}
							break;
						}
					} else {
						/* Targeted to us */
						this.message_id = msgid.nodeValue;
						this.message_type = type.nodeValue;
						this.message = m.firstChild.nodeValue;
						if (url && url.nodeValue) {
							this.message_url = url.nodeValue;
						}
						break;
					}
				}

				m = messages.item(++i);
			}
		} catch (e) {
			dump("wot_api_query.parse_messages: failed with " + e + "\n");
		}
	},

	parse_users: function(users)
	{
		try {
			this.users = [];

			if (!users) {
				return;
			}

			var i = 0;
			var u = users.item(0);
			var a;

			while (u) {
				var item = {};
				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_ICON);

				if (a && a.nodeValue) {
					item.icon = a.nodeValue;
				}

				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_BAR);

				if (a && a.nodeValue) {
					item.bar = a.nodeValue;
				}

				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_LENGTH);

				if (a && a.nodeValue) {
					item.length = a.nodeValue;
				}

				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_LABEL);

				if (a && a.nodeValue) {
					item.label = a.nodeValue;
				}

				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_URL);

				if (a && a.nodeValue) {
					item.url = a.nodeValue;
				}

				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_TEXT);

				if (a && a.nodeValue) {
					item.text = a.nodeValue;
				}

				a = u.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_USER_NOTICE);

				if (a && a.nodeValue) {
					item.notice = a.nodeValue;
				}

				if (item.text && (!item.bar ||
						(item.length != null && item.label))) {
					this.users[i] = item;
				}

				u = users.item(++i);
			}
		} catch (e) {
			dump("wot_api_query.parse_users: failed with " + e + "\n");
		}
	},

	parse_status: function(stats)
	{
		try {
			wot_prefs.clear("status_level");

			if (!stats) {
				return;
			}

			var s = stats.item(0);

			if (!s) {
				return;
			}

			var l = s.attributes.getNamedItem(WOT_SERVICE_XML_QUERY_STATUS_LEVEL);

			if (l && l.nodeValue) {
				wot_prefs.setChar("status_level", l.nodeValue);
			}

		} catch (e) {
			dump("wot_api_query.parse_status: failed with " + e + "\n");
		}
	}
};

wot_api_query.init();
