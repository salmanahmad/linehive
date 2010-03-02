/*
	firstrun.js
	Copyright © 2007, 2009  WOT Services Oy <info@mywot.com>

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

const WOT_REGISTER_EULA_ASKED = "wot_register_eula_asked";

var wot_firstrun = {

	init: function() {
		try {
			window.addEventListener("load", function(e) {
					wot_firstrun.load();
				}, false);
		} catch (e) {
			dump("wot_firstrun.init: failed with " + e + "\n");
		}
	},

	show_eula: function()
	{
		try {
			if (wot_prefs.eula_accepted ||
					wot_hashtable.get(WOT_REGISTER_EULA_ASKED)) {
				return;
			}

			wot_hashtable.set(WOT_REGISTER_EULA_ASKED, 1);

			window.setTimeout(function() {
					window.openDialog("chrome://wot/content/eula.xul",
						"EULA", "chrome,titlebar,centerscreen,modal,resizable", null);

					if (!wot_prefs.eula_accepted) {
						wot_status.set("error",
							wot_util.getstring("description_uninstall"));
					}

					wot_core.update();
				}, 500);
		} catch (e) {
			dump("wot_firstrun.show_eula: failed with " + e + "\n");
		}
	},

	open_guide: function()
	{
		try {
			if (Number(wot_prefs.firstrun_guide) >= WOT_FIRSTRUN_GUIDE) {
				return;
			}

			if (!wot_prefs.setChar("firstrun_guide",
					WOT_FIRSTRUN_GUIDE.toString())) {
				return;
			}

			wot_prefs.flush();

			window.setTimeout(function() {
					var browser = getBrowser();

					var tab = "welcome";
					var partner = wot_partner.getpartner();

					if (partner) {
						tab = partner + "/" + tab;
					}

					var url = wot_url.getprefurl(tab);

					if (browser && url) {
						browser.selectedTab = browser.addTab(url);
					}
				}, 500);
		} catch (e) {
			dump("wot_firstrun.open_guide: failed with " + e + "\n");
		}
	},

	load: function() {
		try {
			this.show_eula();
			this.open_guide();
		} catch (e) {
			dump("wot_firstrun.load: failed with " + e + "\n");
		}
	}
};

wot_firstrun.init();
