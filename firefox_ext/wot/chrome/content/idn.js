/*
	idn.js
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

/* Provides a simple wrapper for nsIIDNService */
var wot_idn =
{
	init: function()
	{
		try {
			if (this.handle) {
				return;
			}
			this.handle =
				Components.classes["@mozilla.org/network/idn-service;1"].
					getService(Components.interfaces.nsIIDNService);

			window.addEventListener("unload", function(e) {
					wot_idn.unload();
				}, false);
		} catch (e) {
			dump("wot_idn.init: failed with " + e + "\n");
		}
	},

	unload: function()
	{
		this.handle = null;
	},

	isidn: function(str)
	{
		try {
			return this.handle.isACE(str);
		} catch (e) {
			dump("wot_idn.isidn: failed with " + e + "\n");
		}
		return false;
	},

	utftoidn: function(utf)
	{
		try {
			return this.handle.convertUTF8toACE(utf);
		} catch (e) {
			dump("wot_idn.utftoidn: failed with " + e + "\n");
		}
		return null;
	},

	idntoutf: function(idn)
	{
		try {
			return this.handle.convertACEtoUTF8(idn);
		} catch (e) {
			dump("wot_idn.idntoutf: failed with " + e + "\n");
		}
		return null;
	}
};

wot_idn.init();
