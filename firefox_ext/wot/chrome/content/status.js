/*
	status.js
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

var wot_status =
{
	set: function(status, description)
	{
		try {
			if (wot_update.isavailable()) {
				status += "-update";
			} else if (wot_api_query.message.length > 0 &&
				wot_api_query.message_type.length > 0 &&
				wot_api_query.message_id != wot_prefs.last_message &&
				wot_api_query.message_id != WOT_SERVICE_XML_QUERY_MSG_ID_MAINT) {
				status += "-update";
			}

			/* Set tooltip and status */
			var mainwnd = document.getElementById("main-window");
			if (mainwnd) {
				mainwnd.setAttribute("wot-status", status);
			}

			var tooltip = document.getElementById("wot-tooltip-text");
			if (tooltip) {
				tooltip.value = description;
			}

			/* Update display */
			wot_ui.update(description);
		} catch (e) {
			dump("wot_status.set: failed with " + e + "\n");
		}
	},

	update: function()
	{
		try {
			if (!wot_util.isenabled()) {
				return;
			}

			var reputation = -1;

			if (wot_cache.isok(wot_core.hostname)) {
				reputation = wot_cache.get(wot_core.hostname,
								"reputation_0");
			}

			if (reputation > WOT_MAX_REPUTATION) {
				reputation = WOT_MAX_REPUTATION;
			}

			/* Set status and description */
			var status, description, testimonies = false;

			for (var i = 0; i < WOT_APPLICATIONS; ++i) {
				if (wot_cache.get(wot_core.hostname, "testimony_" + i) >= 0) {
					testimonies = true;
					break;
				}
			}

			if (reputation >= WOT_MIN_REPUTATION_5) {
				status = "5";
			} else if (reputation >= WOT_MIN_REPUTATION_4) {
				status = "4";
			} else if (reputation >= WOT_MIN_REPUTATION_3) {
				status = "3";
			} else if (reputation >= WOT_MIN_REPUTATION_2) {
				status = "2";
			} else if (reputation >= 0) {
				status = "1";
			} else {
				status = "0";
			}

			description = wot_util.getstring("description_rating_" + status);

			if (testimonies) {
				status += "-testimony";
			}

			this.set(status, description);

			var type = wot_warning.isdangerous(wot_core.hostname, true);
			var content = getBrowser().selectedBrowser.contentDocument;

			if (type == WOT_WARNING_NOTIFICATION || type == WOT_WARNING_DOM) {
				wot_warning.add(wot_core.hostname, content, type);
			} else {
				wot_warning.hide(content);
			}
		} catch (e) {
			dump("wot_status.update: failed with " + e + "\n");
		}
	}
};
