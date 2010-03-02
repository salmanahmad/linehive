/*
	api/link.js
	Copyright © 2006, 2007, 2009  WOT Services Oy <info@mywot.com>

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

var wot_api_link =
{
	send: function(rule, content, cache)
	{
		try {
			if (!wot_util.isenabled()) {
				return;
			}

			var i, j = 0, hosts = "";
			var nonce = wot_crypto.nonce();

			for (i in cache) {
				if (cache[i] != i ||
						(wot_cache.iscached(i) && (wot_cache.get(i, "pending") ||
						 wot_cache.get(i, "inprogress")))) {
					continue;
				}

				if ((hosts.length + i.length + 1) > WOT_MAX_LINK_HOSTSLEN) {
					break;
				}

				hosts += i + "/";
				wot_cache.add_nonce(nonce + "-" + j++, i);

				if (j >= WOT_MAX_LINK_PARAMS) {
					break;
				}
			}

			if (hosts.length == 0) {
				return;
			}

			var context = wot_arc4.create(wot_hash.hmac_sha1hex(
								wot_prefs.witness_key, nonce));

			if (!context) {
				return;
			}

			var crypted = wot_arc4.crypt(context, wot_hash.strtobin(hosts));

			if (!crypted) {
				return;
			}

			var qs = WOT_SERVICE_API_LINK +
				"?id="		+ wot_prefs.witness_id +
				"&nonce="	+ nonce +
				"&hosts="	+ encodeURIComponent(btoa(
									wot_hash.bintostr(crypted))) +
				wot_url.getapiparams();

			if (wot_prefs.prefetch) {
				qs += "&mode=prefetch";
			}

			var request = new XMLHttpRequest();

			request.open("GET", WOT_SERVICE_NORMAL +
					wot_crypto.authenticate_query(qs));

			new wot_cookie_remover(request);

			request.onload = function(event)
			{
				try {
					if (request.status == 200) {
						wot_cache.add_query(
							request.responseXML.getElementsByTagName(
								WOT_SERVICE_XML_LINK),
							request.responseXML.getElementsByTagName(
								WOT_SERVICE_XML_QUERY_TARGET),
							true);
					}

					if (rule) {
						wot_search.update(rule, content, cache, true);
					}

					for (var i = 0; i < j; ++i) {
						wot_cache.remove_nonce(nonce + "-" + i);
					}
				} catch (e) {
					dump("wot_api_link.onload: failed with " + e + "\n");
				}
			}

			request.send(null);
		} catch (e) {
			dump("wot_api_link.send: failed with " + e + "\n");
		}
	}
};
