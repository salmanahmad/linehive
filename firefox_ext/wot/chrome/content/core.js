/*
	core.js
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

function wot_listener(browser)
{
	this.browser = browser;
}

wot_listener.prototype =
{
	browser: null,

	aborted: 0x804b0002, /* NS_BINDING_ABORTED */

	loading: Components.interfaces.nsIWebProgressListener.STATE_START |
			 Components.interfaces.nsIWebProgressListener.STATE_REDIRECTING |
			 Components.interfaces.nsIWebProgressListener.STATE_TRANSFERRING |
			 Components.interfaces.nsIWebProgressListener.STATE_NEGOTIATING,

	isdocument: Components.interfaces.nsIWebProgressListener.STATE_IS_DOCUMENT,

	abort: function(request)
	{
		request.cancel(this.aborted);
	},

	QueryInterface: function(iid)
	{
		if (!iid.equals(Components.interfaces.nsISupports) &&
			!iid.equals(Components.interfaces.nsISupportsWeakReference) &&
			!iid.equals(Components.interfaces.nsIWebProgressListener)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}

		return this;
	},

	onLocationChange: function(progress, request, location)
	{
		if (progress.DOMWindow != this.browser.contentWindow) {
			return;
		}

		if (location) {
			wot_core.block(this, request, location.spec);
		}
		wot_core.update();
	},

	onProgressChange: function(progress, request, curSelfProgress,
		maxSelfProgress, curTotalProgress, maxTotalProgress)
	{
	},

	onStateChange: function(progress, request, flags, status)
	{
		if (progress.DOMWindow != this.browser.contentWindow) {
			return;
		}

		if (flags & this.loading && flags & this.isdocument &&
				request) {
			wot_core.block(this, request, request.name);
		}
	},

	onStatusChange: function(progress, request, status, message)
	{
	},

	onSecurityChange: function(progress, request, state)
	{
	}
};

var wot_core =
{
	init: function()
	{
		try {
			this.blockedstreams = {};
			this.hostname = null;
			this.pending = {};
			this.purged = Date.now();

			window.addEventListener("load", function(e) {
					wot_core.load();
				}, false);
			window.addEventListener("unload", function(e) {
					wot_core.unload();
				}, false);
		} catch (e) {
			dump("wot_core.init: failed with " + e + "\n");
		}
	},

	load: function()
	{
		try {
			/* Add listeners */
			var browser = getBrowser();
			this.listener = new wot_listener(browser);

			/* Progress listener for the current tab */
			browser.addProgressListener(this.listener,
				Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);

			/* Event listeners for tab open and select (Firefox 1+) */
			if (browser.mPanelContainer) {
				browser.mPanelContainer.addEventListener("DOMNodeInserted",
					wot_core.tabopen_legacy, false);
				browser.mPanelContainer.addEventListener("select",
					wot_core.tabselect_legacy, false);
			}

			/* Event listeners for tab open and select (Firefox 2+) */
			if (browser.tabContainer) {
				browser.tabContainer.addEventListener("TabOpen",
					wot_core.tabopen, false);
				browser.tabContainer.addEventListener("TabSelect",
					wot_core.tabselect, false);
			}

			wot_prefs.setupdateui();

			/* Register and do the first update */
			wot_api_register.send();

			/* Update session */
			wot_my_session.update(true);
		} catch (e) {
			dump("wot_core.load: failed with " + e + "\n");
		}
	},

	unload: function()
	{
		try {
			var browser = getBrowser();

			if (this.listener) {
				browser.removeProgressListener(this.listener);
				this.listener = null;
			}

			if (browser.mPanelContainer) {
				browser.mPanelContainer.removeEventListener("DOMNodeInserted",
					wot_core.tabopen_legacy, false);
				browser.mPanelContainer.removeEventListener("select",
					wot_core.tabselect_legacy, false);
			}

			if (browser.tabContainer) {
				browser.tabContainer.removeEventListener("TabOpen",
					wot_core.tabopen, false);
				browser.tabContainer.removeEventListener("TabSelect",
					wot_core.tabselect, false);
			}
		} catch (e) {
			dump("wot_core.unload: failed with " + e + "\n");
		}
	},

	tabselect_legacy: function(event)
	{
		try {
			var browser = getBrowser().getBrowserAtIndex(
								getBrowser().mTabContainer.selectedIndex);

			if (browser.listener) {
				browser.webProgress.removeProgressListener(browser.listener);
				browser.listener = null;
			}
		} catch (e) {
			dump("wot_core.tabselect_legacy: failed with " + e + "\n");
		}
	},

	tabopen_legacy: function(event)
	{
		try {
			if (event.relatedNode != getBrowser().mPanelContainer) {
				return;
			}

			var browser = event.target.childNodes[1];

			if (!browser || browser.listener) {
				return;
			}

			/* Catch state changes for background tabs */
			browser.listener = new wot_listener(browser);
			browser.webProgress.addProgressListener(browser.listener,
				Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
		} catch (e) {
			dump("wot_core.tabopen_legacy: failed with " + e + "\n");
		}
	},

	tabselect: function(event)
	{
		try {
			var browser = getBrowser().selectedTab;

			if (browser && browser.listener) {
				browser.removeProgressListener(browser.listener);
				browser.listener = null;
			}
		} catch (e) {
			dump("wot_core.tabselect: failed with " + e + "\n");
		}
	},

	tabopen: function(event)
	{
		try {
			var browser = event.target.linkedBrowser;

			if (!browser || browser.listener) {
				return;
			}

			/* Catch state changes for background tabs */
			browser.listener = new wot_listener(browser);
			browser.addProgressListener(browser.listener);
		} catch (e) {
			dump("wot_core.tabopen: failed with " + e + "\n");
		}
	},

	showloading: function(pl, request, url, hostname)
	{
		try {
			var stream = null;

			if (request) {
				if (request.QueryInterface) {
					var channel = request.QueryInterface(
									Components.interfaces.nsIHttpChannel);

					if (channel && channel.requestMethod == "POST") {
						var upload = request.QueryInterface(
										Components.interfaces.nsIUploadChannel);

						if (upload) {
							dump("wot_core.showloading: blocking post to " +
								hostname + "\n");
							stream = upload.uploadStream;
						}
					}
				}
				
				pl.abort(request);
			}

			if (wot_browser.isoffline()) {
				return;
			}

			this.blockedstreams[url] = stream;

			pl.browser.loadURIWithFlags(WOT_BLOCK_LOADING + "#" +
				encodeURIComponent(btoa(url)),
				Components.interfaces.nsIWebNavigation.LOAD_FLAGS_BYPASS_HISTORY,
				null, null);

			wot_api_query.send(hostname);
		} catch (e) {
			dump("wot_core.showloading: failed with " + e + "\n");
		}
	},

	showblocked: function(pl, request, url, hostname)
	{
		try {
			if (request) {
				pl.abort(request);
			}

			var blocked = "target=" + encodeURIComponent(hostname);

			for (var i = 0; i < WOT_APPLICATIONS; ++i) {
				if (!wot_prefs["show_application_" + i]) {
					continue;
				}

				var param = "";
				var reason = wot_warning.getwarningtype(hostname, i, true);

				if (reason == WOT_REASON_TESTIMONY) {
					param += "y";
				} else if (reason == WOT_REASON_RATING) {
					param += "r";
				}

				var r = wot_cache.get(hostname, "reputation_" + i);

				if (r >= WOT_MIN_REPUTATION_5) {
					param += "5";
				} else if (r >= WOT_MIN_REPUTATION_4) {
					param += "4";
				} else if (r >= WOT_MIN_REPUTATION_3) {
					param += "3";
				} else if (r >= WOT_MIN_REPUTATION_2) {
					param += "2";
				} else if (r >= 0) {
					param += "1";
				} else {
					param += "0";
				}

				if (wot_prefs.accessible) {
					param += "a";
				}

				blocked += "&" + i + "=" + param;
			}

			blocked = "?" + encodeURIComponent(btoa(blocked)) + "#" +
						encodeURIComponent(btoa(url));

			pl.browser.loadURI(WOT_BLOCK_BLOCKED + blocked);
		} catch (e) {
			dump("wot_core.showblocked: failed with " + e + "\n");
		}
	},

	block: function(pl, request, url)
	{
		try {
			if (!wot_util.isenabled() || !pl || !pl.browser || !url) {
				return;
			}
			
			if (!wot_warning.isblocking()) {
				return;
			}

			var hostname = wot_url.gethostname(url);

			if (!hostname || wot_url.isprivate(hostname) ||
					wot_url.isexcluded(hostname)) {
				return;
			}

			if (wot_cache.isok(hostname)) {
				if (wot_warning.isdangerous(hostname, false) ==
						WOT_WARNING_BLOCK) {
					this.showblocked(pl, request, url, hostname);
				}

				if (this.blockedstreams[url]) {
					delete this.blockedstreams[url];
				}
			} else {
				this.showloading(pl, request, url, hostname);
			}
		} catch (e) {
			dump("wot_core.block: failed with " + e + "\n");
		}
	},

	updateloading: function()
	{
		try {
			if (!wot_warning.isblocking()) {
				return;
			}

			var browser = getBrowser();
			var num = browser.mPanelContainer.childNodes.length;

			for (var i = 0; i < num; i++) {
				var tab = browser.getBrowserAtIndex(i);

				if (!tab || !tab.currentURI ||
						tab.currentURI.spec.indexOf(WOT_BLOCK_LOADING) != 0) {
					continue;
				}

				var url = this.isredirect(tab.currentURI.spec);

				if (!url) {
					continue;
				}

				var hostname = wot_url.gethostname(url);

				if (!hostname || !wot_cache.iscached(hostname)) {
					continue;
				}
				
				var age = Date.now() - wot_cache.get(hostname, "time");

				if (wot_cache.get(hostname, "status") == WOT_QUERY_ERROR &&
						age < WOT_INTERVAL_BLOCK_ERROR) {
					continue;
				}

				var postdata = null;

				if (this.blockedstreams[url]) {
					dump("wot_core.updateloading: reposting to " + hostname +
						"\n");
					postdata = this.blockedstreams[url];
					delete this.blockedstreams[url];
				}

				/* Try again */
				tab.loadURIWithFlags(url,
					Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE,
					null, null, postdata);
			}
		} catch (e) {
			dump("wot_core.updateloading: failed with " + e + "\n");
		}
	},

	isredirect: function(url)
	{
		try {
			if (!url) {
				return null;
			}

			if (url.indexOf(WOT_BLOCK_LOADING) != 0 &&
				url.indexOf(WOT_BLOCK_BLOCKED) != 0) {
				return null;
			}

			var m = /#(.+)$/.exec(url);

			if (m && m[1]) {
				return atob(decodeURIComponent(m[1]));
			}
		} catch (e) {
			dump("wot_core.isredirect: failed with " + e + "\n");
		}
		return null;
	},

	purgecache: function()
	{
		try {
			var interval = WOT_INTERVAL_CACHE_REFRESH;

			/* Purging cache entries while blocking is enabled causes the
				page to be reloaded while ratings are being loaded, so we'll
				purge the cache less often to not annoy the user... */

			if (wot_warning.isblocking()) {
				interval = WOT_INTERVAL_CACHE_REFRESH_BLOCK;
			}

			var now = Date.now();

			if ((now - wot_core.purged) < interval) {
				return;
			}

			wot_core.purged = now;
			var cache = wot_cache.get_enumerator();

			while (cache.hasMoreElements()) {
				var name = wot_cache.get_name_from_element(cache.getNext());

				if (!name) {
					continue;
				}

				if (wot_cache.get(name, "inprogress")) {
					continue;
				}
				
				var age = now - wot_cache.get(name, "time");

				if (age > interval) {
					wot_cache.destroy(name);
				}
			}
		} catch (e) {
			dump("wot_core.purgecache: failed with " + e + "\n");
		}
	},

	update: function()
	{
		try {
			wot_core.hostname = null;

			if (!wot_api_register.ready || !wot_prefs.eula_accepted) {
				return;
			}

			if (!wot_prefs.witness_id || !wot_prefs.witness_key ||
					wot_prefs.witness_id.length  != WOT_LENGTH_WITNESS_ID ||
					wot_prefs.witness_key.length != WOT_LENGTH_WITNESS_KEY) {
				wot_api_register.ready = false;
				wot_status.set("error",
					wot_util.getstring("description_restart"));
				return;
			}

			wot_core.hostname = wot_browser.gethostname();

			/* Update session */
			if (wot_core.hostname && WOT_MY_TRIGGER.test(wot_core.hostname)) {
				wot_my_session.update(false);
				wot_my_session.reload();

				var url = wot_browser.geturl();
				var match = url.match(WOT_PREF_FORWARD);

				if (match) {
					var section = match[WOT_PREF_FORWARD_TAB_MATCH];
					getBrowser().loadURIWithFlags(wot_url.getprefurl(section),
						Components.interfaces.nsIWebNavigation
							.LOAD_FLAGS_BYPASS_HISTORY, null, null);
				}
			}

			if (!wot_util.isenabled()) {
				wot_status.set("disabled",
					wot_util.getstring("description_disabled"));
				return;
			}

			/* Store any pending testimonies (from this window) */
			for (var i in wot_core.pending)  {
				if (wot_pending.store(i)) {
					wot_cache.set(i, "pending", false);
					delete wot_core.pending[i];
				}
			}

			/* Update any tabs waiting for reputations */
			wot_core.updateloading();

			/* Recover the original hostname */
			var redirected = wot_core.isredirect(wot_browser.geturl());
			if (redirected) {
				wot_core.hostname = wot_url.gethostname(redirected);
			}

			/* Purge expired cache entries */
			wot_core.purgecache();

			if (wot_browser.isoffline()) {
				/* Browser offline */
				wot_status.set("offline",
					wot_util.getstring("description_offline"));
				/* Retry after a timeout */
				window.setTimeout(wot_core.update, WOT_INTERVAL_UPDATE_OFFLINE);
				return;
			}

			/* Submit any pending testimonies */
			wot_pending.submit();

			/* Check for updates */
			wot_api_update.send(false);

			if (!wot_core.hostname || wot_url.isprivate(wot_core.hostname) ||
					wot_url.isexcluded(wot_core.hostname)) {
				/* Invalid or excluded hostname */
				if (wot_cache.iscached(wot_core.hostname) &&
						!wot_cache.get(wot_core.hostname, "pending")) {
					wot_cache.destroy(wot_core.hostname);
				}
				wot_status.set("nohost",
					wot_util.getstring("description_private"));
				return;
			}

			if (!wot_cache.iscached(wot_core.hostname)) {
				/* No previous record of the hostname, start a new query */
				wot_status.set("inprogress",
					wot_util.getstring("description_inprogress"));
				wot_api_query.send(wot_core.hostname);
				return;
			}
			
			var age = Date.now() - wot_cache.get(wot_core.hostname, "time");

			if (wot_cache.get(wot_core.hostname, "inprogress")) {
				if (age > WOT_TIMEOUT_QUERY) {
					/* Done waiting, clear the flag  */
					wot_cache.set(wot_core.hostname, "inprogress", false);
				} else {
					/* Query already in progress, keep waiting */
					wot_status.set("inprogress",
						wot_util.getstring("description_inprogress"));
					return;
				}
			}

			var status = wot_cache.get(wot_core.hostname, "status");

			if (status == WOT_QUERY_OK) {
				if (age > WOT_INTERVAL_CACHE_REFRESH) {
					wot_status.set("inprogress",
						wot_util.getstring("description_inprogress"));
					wot_api_query.send(wot_core.hostname);
				} else {
					wot_status.update();
				}
				return;
			} else if (!wot_cache.get(wot_core.hostname, "pending")) {
				if (status == WOT_QUERY_RETRY || status == WOT_QUERY_LINK) {
					/* Retry immediately */
					wot_status.set("inprogress",
						wot_util.getstring("description_inprogress"));
					wot_api_query.send(wot_core.hostname);
					return;
				} else if (age > WOT_INTERVAL_CACHE_REFRESH_ERROR) {
					wot_status.set("inprogress",
						wot_util.getstring("description_inprogress"));
					wot_api_query.send(wot_core.hostname);
					return;
				}
			}
		} catch (e) {
			dump("wot_core.update: failed with " + e + "\n");
		}

		try {
			/* For some reason, we failed to get anything meaningful to display */
			wot_status.set("error",
				wot_util.getstring("description_error_query"));
		} catch (e) {
			dump("wot_core.update: failed with " + e + "\n");
		}
	}
};

wot_core.init();
