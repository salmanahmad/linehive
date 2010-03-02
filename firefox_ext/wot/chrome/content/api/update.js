/*
	api/update.js
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

var wot_api_update =
{
	send: function(force)
	{
		try {
			var interval = wot_prefs.update_interval;

			if (interval < WOT_MIN_INTERVAL_UPDATE_CHECK) {
				interval = WOT_MIN_INTERVAL_UPDATE_CHECK;
			} else if (interval > WOT_MAX_INTERVAL_UPDATE_CHECK) {
				interval = WOT_MAX_INTERVAL_UPDATE_CHECK;
			}

			var last = Date.now() - interval;

			if (!force && WOT_VERSION == wot_prefs.last_version &&
					last < Number(wot_prefs.update_checked)) {
				return;
			}

			/* Increase the last check time a notch */
			var next = last + WOT_INTERVAL_UPDATE_ERROR;

			if (!wot_prefs.setChar("last_version", WOT_VERSION) ||
					!wot_prefs.setChar("update_checked", next)) {
				return;
			}

			wot_prefs.flush();
			
			/* Build a request */
			var request = new XMLHttpRequest();

			request.open("GET", WOT_SERVICE_NORMAL +
				WOT_SERVICE_API_UPDATE +
				"?id="		+ wot_prefs.witness_id +
				"&nonce="	+ wot_crypto.nonce() +
				"&format="	+ WOT_SERVICE_UPDATE_FORMAT +
				wot_url.getapiparams());

			new wot_cookie_remover(request);

			request.onload = this.onload;
			request.send(null);
		} catch (e) {
			dump("wot_api_update.send: failed with " + e + "\n");
		}
	},

	onload: function(event)
	{
		try {
			if (!event) {
				return;
			}

			var request = event.target;

			if (!request || request.status != 200) {
				return;
			}

			var response = request.responseXML;

			if (!response) {
				return;
			}

			/* Update the the last check time */
			wot_prefs.setChar("update_checked", Date.now());

			var update = null;
			var tags = response.getElementsByTagName(WOT_PLATFORM);

			if (tags) {
				update = tags.item(0);
			}

			if (!update) {
				return;
			}

			/* Attributes */
			var version;
			var interval;

			version =
				update.getAttribute(WOT_SERVICE_XML_UPDATE_VERSION);

			if (version) {
				wot_prefs.setChar("update_version",	version);
				wot_core.update();
			}

			interval =
				update.getAttribute(WOT_SERVICE_XML_UPDATE_INTERVAL);

			if (interval && Number(interval) > 0) {
				wot_prefs.setInt("update_interval", interval * 1000);
			}

			/* Search rules */
			var search = response.getElementsByTagName(
							WOT_SERVICE_XML_UPDATE_SEARCH);

			if (search) {
				wot_search.parse(search);
			}

			/* Shared domains */
			var shared = response.getElementsByTagName(
							WOT_SERVICE_XML_UPDATE_SHARED);

			if (shared) {
				wot_shared.parse(shared);
			}

			wot_prefs.flush();
		} catch (e) {
			dump("wot_api_update.onload: failed with " + e + "\n");
		}
	}
};
