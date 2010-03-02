/*
	api/register.js
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

const WOT_REGISTER_RUNNING = "wot_register_running";

var wot_api_register =
{
	init: function()
	{
		this.ready = false;
		this.timeout = null;
		this.tries = 0;
	},

	geteid: function()
	{
		try {
			if (wot_prefs.extension_id && wot_prefs.extension_id.length > 0) {
				return true;
			}
			if (!wot_prefs.setChar("extension_id", wot_crypto.nonce())) {
				return false;
			}
			return (wot_prefs.extension_id.length > 0);
		} catch (e) {
			dump("wot_api_register.geteid: failed with " + e + "\n");
		}
		return false;
	},

	send: function()
	{
		try {
			if (this.ready) {
				return;
			}

			if (this.timeout) {
				window.clearTimeout(this.timeout);
				this.timeout = null;
			}

			if (wot_prefs.witness_id &&
				wot_prefs.witness_id.length  == WOT_LENGTH_WITNESS_ID &&
				wot_prefs.witness_key &&
				wot_prefs.witness_key.length == WOT_LENGTH_WITNESS_KEY) {
				this.ready = true;
				wot_core.update();
				return;
			}

			if (wot_browser.isoffline()) {
				wot_status.set("offline",
					wot_util.getstring("description_offline"));
				this.timeout = window.setTimeout(wot_api_register.send,
					WOT_INTERVAL_REGISTER_OFFLINE);
				return;
			}

			wot_status.set("notready",
				wot_util.getstring("description_notready"));

			if (!this.geteid() ||
					wot_hashtable.get(WOT_REGISTER_RUNNING)) {
				this.timeout = window.setTimeout(wot_api_register.send,
					WOT_INTERVAL_REGISTER_ERROR);
				return;
			}

			wot_hashtable.set(WOT_REGISTER_RUNNING, 1);
			++this.tries;

			var request = new XMLHttpRequest();

			request.open("GET", WOT_SERVICE_SECURE +
				WOT_SERVICE_API_REGISTER +
				"?nonce="	+ wot_crypto.nonce() +
				"&eid="		+ wot_prefs.extension_id +
				wot_url.getapiparams());

			new wot_cookie_remover(request);

			request.onload = this.onload;
			request.send(null);
		} catch (e) {
			dump("wot_register.send: failed with " + e + "\n");
			this.error();
		}
	},

	onload: function(event)
	{
		try {
			if (!event || !event.target || event.target.status != 200 ||
					!event.target.responseXML) {
				wot_api_register.error();
				return;
			}

			var reg = null;
			var tags = event.target.responseXML.getElementsByTagName(
							WOT_SERVICE_XML_REGISTER);

			if (tags) {
				reg = tags.item(0);
			}

			if (!reg || !reg.attributes) {
				wot_api_register.error();
				return;
			}

			var id  = reg.attributes.getNamedItem(WOT_SERVICE_XML_REGISTER_ID);
			var key = reg.attributes.getNamedItem(WOT_SERVICE_XML_REGISTER_KEY);

			if (!id || !id.nodeValue || !key || !key.nodeValue ||
				id.nodeValue.length  != WOT_LENGTH_WITNESS_ID ||
				key.nodeValue.length != WOT_LENGTH_WITNESS_KEY) {
				wot_api_register.error();
				return
			}

			if (!wot_prefs.setChar("witness_id", id.nodeValue) ||
				!wot_prefs.setChar("witness_key", key.nodeValue)) {
				wot_api_register.error();
				return;
			}

			wot_api_register.ready = true;
			wot_my_session.update(true);
			wot_core.update();

			wot_hashtable.remove(WOT_REGISTER_RUNNING);
		} catch (e) {
			dump("wot_register.onload: failed with " + e + "\n");
			wot_api_register.error();
		}
	},

	error: function()
	{
		try {
			wot_status.set("error",
				wot_util.getstring("description_error_register"));

			wot_api_register.timeout =
				window.setTimeout(wot_api_register.send,
					wot_api_register.tries * WOT_INTERVAL_REGISTER_ERROR);

			wot_hashtable.remove(WOT_REGISTER_RUNNING);
		} catch (e) {
			dump("wot_register.error: failed with " + e + "\n");
		}
	}
};

wot_api_register.init();
