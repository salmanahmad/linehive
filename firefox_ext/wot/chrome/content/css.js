/*
	css.js
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

const WOT_STYLESHEET = "chrome://wot/skin/wot.css";

var wot_css =
{
	init: function()
	{
		try {
			if (this.cache) { /* Window-specific cache */
				return;
			}

			this.cache = {}; /* Rules */
		} catch (e) {
			dump("wot_css.init: failed with " + e + "\n");
		}
	},

	/* Finds a given rule from a stylesheet, caches found entries */
	getstyle: function(href, id)
	{
		try {
			var rule = this.cache[href + "." + id];

			if (rule) {
				return rule.style;
			}

			var sheet;

			for (var i = 0; i < document.styleSheets.length; ++i) {
				sheet = document.styleSheets.item(i);

				if (sheet.href != href) {
					continue;
				}

				for (var j = 0; j < sheet.cssRules.length; ++j) {
					rule = sheet.cssRules.item(j);

					if (rule.selectorText.indexOf(id) < 0) {
						continue;
					}

					this.cache[href + "." + id] = rule;
					return rule.style;
				}
				break;
			}
		} catch (e) {
			dump("wot_css.getstyle: failed with " + e + "\n");
		}

		return null;
	},

	/* Parses a numeric entry from a style rule, ignores units */
	getstyle_numeric: function(style, parameter)
	{
		try {
			if (style) {
				var value = style[parameter];

				if (value) {
					var m = /^(\d+)/.exec(value);

					if (m && m[1]) {
						return Number(m[1]);
					}
				}
			}
		} catch (e) {
			dump("wot_css.getstyle_numeric: failed with " + e + "\n");
		}

		return null;
	},

	/* Sets a numeric entry with given unit to the style rule */
	setstyle_numeric: function(style, parameter, value, unit)
	{
		try {
			style[parameter] = value + unit;
		} catch (e) {
			dump("wot_css.setstyle_numeric: failed with " + e + "\n");
		}
	},

	/* Parses a rect entry from a style rule, ignores units */
	getstyle_rect: function(style, parameter)
	{
		try {
			if (style) {
				var value = style[parameter];

				if (value) {
					var r = /rect\(\s*(\d+)\D*,\s*(\d+)\D*,\s*(\d+)\D*,\s*(\d+)\D*\s*\)/;
					var m = r.exec(value);

					if (m && m[1] && m[2] && m[3] && m[4]) {
						return new Array(Number(m[1]), Number(m[2]),
							Number(m[3]), Number(m[4]));
					}
				}
			}
		} catch (e) {
			dump("wot_css.getstyle_rect: failed with " + e + "\n");
		}

		return null;
	},

	/* Sets a rect entry to the style rule, assumes pixels as unit */
	setstyle_rect: function(style, parameter, rect)
	{
		try {
			style[parameter] = "rect(" +
				rect[0].toFixed() + "px, " + rect[1].toFixed() + "px, " +
				rect[2].toFixed() + "px, " + rect[3].toFixed() + "px)";
		} catch (e) {
			dump("wot_css.setstyle_rect: failed with " + e + "\n");
		}
	}
};

wot_css.init();
