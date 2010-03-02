/*
	update.js
	Copyright © 2006, 2007, 2008, 2009  WOT Services Oy <info@mywot.com>

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

function wot_update_listener(callback)
{
	this.callback = callback;
}

wot_update_listener.prototype =
{
	STATUS_UPDATE: Components.interfaces.nsIAddonUpdateCheckListener.
						STATUS_UPDATE,

	onUpdateStarted: function()
	{
	},

	onUpdateEnded: function()
	{
	},

	onAddonUpdateStarted: function(addon)
	{
	},

	onAddonUpdateEnded: function(addon, status)
	{
		try {
			if (addon && addon.id == WOT_GUID && status == this.STATUS_UPDATE &&
					typeof(this.callback) == "function") {
				this.callback(addon);
			}
		} catch (e) {
			dump("wot_update_listener.onAddonUpdateEnded: failed with " +
				e + "\n");
		}
	}
};

var wot_update =
{
	AVAILABLE:	"wot_update_available",
	CHECKED:	"wot_update_checked",
	DONE:		"wot_update_done",

	isavailable: function()
	{
		try {
			if (Number(WOT_VERSION) < Number(wot_prefs.update_version)) {
				if (!wot_hashtable.get(this.CHECKED)) {
					this.check();
				}

				return !!wot_hashtable.get(this.AVAILABLE);
			}
		} catch (e) {
			dump("wot_update.isavailable: failed with " + e + "\n");
		}

		return false;
	},

	check: function()
	{
		try {
			wot_hashtable.set(this.CHECKED, true);

			var em = Components.classes["@mozilla.org/extensions/manager;1"].
						getService(Components.interfaces.nsIExtensionManager);

			var item = em.getItemForID(WOT_GUID);

			em.update([item], 1, 0, new wot_update_listener(function(addon) {
				if (wot_prefs.automatic_updates &&
						!wot_hashtable.get(wot_update.DONE)) {
					wot_hashtable.set(wot_update.DONE, true);
					wot_hashtable.set(wot_update.AVAILABLE, false);
					em.addDownloads([addon], 1, null);
				} else {
					wot_hashtable.set(wot_update.AVAILABLE, true);
				}
			}));
		} catch (e) {
			dump("wot_update.check: failed with " + e + "\n");
		}
	},

	update: function()
	{
		try {
			wot_hashtable.set(this.AVAILABLE, false);

			if (typeof(BrowserOpenExtensions) == "function") {
				BrowserOpenExtensions("extensions");
			} else if (typeof(BrowserOpenAddonsMgr) == "function") {
				BrowserOpenAddonsMgr(); /* Firefox 3+ */
			}

			var em = Components.classes["@mozilla.org/extensions/manager;1"].
						getService(Components.interfaces.nsIExtensionManager);

			var item = em.getItemForID(WOT_GUID);

			em.update([item], 1, 0, new wot_update_listener(function(addon) {
				em.addDownloads([addon], 1, null);
			}));

			wot_core.update();
		} catch (e) {
			dump("wot_update.update: failed with " + e + "\n");
		}
	}
};
