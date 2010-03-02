/*
	api/reload.js
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

const WOT_RELOAD_RUNNING = "wot_reload_running";

var wot_api_reload =
{
	init: function()
	{
		this.timeout = null;
	},

	send: function(reload)
	{
		try {
			if (this.timeout) {
				window.clearTimeout(this.timeout);
				this.timeout = null;
			}

			if (!wot_util.isenabled() ||
					!wot_api_register.geteid() ||
					wot_hashtable.get(WOT_RELOAD_RUNNING)) {
				return;
			}

			wot_hashtable.set(WOT_RELOAD_RUNNING, 1);

			var query_string = WOT_SERVICE_API_RELOAD +
				"?id="		+ wot_prefs.witness_id +
				"&nonce=" 	+ wot_crypto.nonce() +
				"&reload=" 	+ encodeURIComponent(reload) +
				"&eid="		+ wot_prefs.extension_id +
				wot_url.getapiparams();

			var request = new XMLHttpRequest();

			request.open("GET", WOT_SERVICE_SECURE +
				wot_crypto.authenticate_query(query_string));

			new wot_cookie_remover(request);

			request.onload = this.onload;
			request.send(null);
		} catch (e) {
			dump("wot_reload.send: failed with " + e + "\n");
			this.error();
		}
	},

	onload: function(event)
	{
		try {
			if (!event || !event.target || event.target.status != 200 ||
					!event.target.responseXML) {
				wot_api_reload.error();
				return;
			}

			var reload = null;
			var tags = event.target.responseXML.getElementsByTagName(
							WOT_SERVICE_XML_RELOAD);

			if (tags) {
				reload = tags.item(0);
			}

			if (!reload || !reload.attributes) {
				wot_api_reload.error();
				return;
			}

			var id  = reload.attributes.getNamedItem(
							WOT_SERVICE_XML_RELOAD_ID);
			var key = reload.attributes.getNamedItem(
							WOT_SERVICE_XML_RELOAD_KEY);

			if (!id || !id.nodeValue || !key || !key.nodeValue ||
				id.nodeValue.length  != WOT_LENGTH_WITNESS_ID ||
				key.nodeValue.length != WOT_LENGTH_WITNESS_KEY) {
				wot_api_reload.error();
				return;
			}

			if (!wot_prefs.setChar("witness_id", id.nodeValue) ||
				!wot_prefs.setChar("witness_key", key.nodeValue)) {
				wot_api_reload.error();
				return;
			}

			wot_my_session.update(false);

			/* Invalidate cache */
			var cache = wot_cache.get_enumerator();

			while (cache.hasMoreElements()) {
				var name = wot_cache.get_name_from_element(cache.getNext());
				if (name) {
					wot_cache.set(name, "status", WOT_QUERY_RETRY);
				}
			}

			wot_core.update();
			wot_hashtable.remove(WOT_RELOAD_RUNNING);
		} catch (e) {
			dump("wot_reload.onload: failed with " + e + "\n");
			wot_api_reload.error();
		}
	},

	error: function()
	{
		try {
			wot_api_reload.timeout =
				window.setTimeout(wot_api_reload.send,
					WOT_INTERVAL_RELOAD_ERROR);

			wot_hashtable.remove(WOT_RELOAD_RUNNING);
		} catch (e) {
			dump("wot_reload.error: failed with " + e + "\n");
		}
	}
};

wot_api_reload.init();
