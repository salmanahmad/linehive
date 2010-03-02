/*
	eula.js
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

var wot_eula =
{
	accept: function()
	{
		try {
			wot_prefs.setBool("eula_accepted", true);
			wot_prefs.setBool("enabled", true);
			wot_prefs.flush();
			return true;
		} catch (e) {
			dump("wot_eula.accept: failed with " + e + "\n");
		}
		return false;
	},

	decline: function()
	{
		try {
			wot_prefs.setBool("eula_accepted", false);
			wot_prefs.setBool("enabled", false);

			var em = Components.classes["@mozilla.org/extensions/manager;1"].
						getService(Components.interfaces.nsIExtensionManager);

			if (em) {
				em.uninstallItem(WOT_GUID);
			}
			return true;
		} catch (e) {
			dump("wot_eula.decline: failed with " + e + "\n");
		}
		return false;
	}
}
