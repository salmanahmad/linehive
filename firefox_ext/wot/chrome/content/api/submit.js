/*
	api/submit.js
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

var wot_api_submit =
{
	send: function(pref, target, testimonies)
	{
		try {
			if (!wot_util.isenabled() || !pref || !target ||
					!testimonies) {
				return;
			}

			var nonce = wot_crypto.nonce();

			var context = wot_arc4.create(wot_hash.hmac_sha1hex(
								wot_prefs.witness_key, nonce));

			if (!context) {
				return;
			}

			var crypted = wot_arc4.crypt(context,
								wot_hash.strtobin(target));

			if (!crypted) {
				return;
			}

			var qs = WOT_SERVICE_API_SUBMIT +
				"?id="		+ wot_prefs.witness_id +
				"&nonce="	+ nonce +
				"&target="	+ encodeURIComponent(btoa(
									wot_hash.bintostr(crypted)));

			var found = 0;

			for (var i = 0; i < WOT_APPLICATIONS; ++i) {
				if (testimonies[i] >= 0) {
					qs += "&testimony_" + i + "=" + testimonies[i];
					++found;
				}
			}

			if (!found) {
				return;
			}

			qs += wot_url.getapiparams();
			   
			var request = new XMLHttpRequest();

			if (!request) {
				return;
			}

			request.open("GET", WOT_SERVICE_NORMAL +
					wot_crypto.authenticate_query(qs));

			new wot_cookie_remover(request);

			request.onload = function(event)
			{
				try {
					if (request.status == 200) {
						var submit = request.responseXML.getElementsByTagName(
										WOT_SERVICE_XML_SUBMIT);

						if (submit && submit.length > 0) {
							wot_pending.clear(pref);
						}
					}
				} catch (e) {
					dump("wot_api_submit.onload: failed with " + e + "\n");
				}
			};

			request.send(null);
		} catch (e) {
			dump("wot_api_submit.send: failed with " + e + "\n");
		}
	}
};
