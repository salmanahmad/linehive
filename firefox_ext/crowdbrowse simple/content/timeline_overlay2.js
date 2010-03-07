var CrowdBrowseTimeline2 = {
init: function() {
		// initialization code
		this.initialized = true;
		this._windowManager =     Cc["@mozilla.org/appshell/window-mediator;1"].        getService(Ci.nsIWindowMediator);
	},
	/**
* Determines whether the event viewer is visible or not.
* @return True if the viewer is visible, false otherwise.
*/
	_isViewerVisible : function() {
		var popup = document.getElementById("timelineOverlay");
		return ("open" == popup.state);
	},
	toggle : function() {
		
		if (this._isViewerVisible()) {
			this._hide();
		} else {
			this._show();
		}
	},
	_hide : function() {
		var popup = document.getElementById("timelineOverlay");
		if ("open" == popup.state) {
			popup.hide();
		}
	},
	_show : function() {
		var popup = document.getElementById("timelineOverlay");
		var win = this._windowManager.getMostRecentWindow("navigator:browser");
		var documentHasFocus = window.document.hasFocus();
		var event = null;

		if (win != window || this._isViewerVisible() || !documentHasFocus) { return;    }
		//event = this._loadEvent();
		if ("open" != popup.state) {
			var popup;
			popup = document.getElementById("timelineOverlay");
			var anchor = document.getElementById("browser-topbox");
			popup.openPopup(anchor, "after_start", 30, 150, false, false);
		}
	}
};
window.addEventListener(  "load", function() { CrowdBrowseTimeline2.init(); }, false);