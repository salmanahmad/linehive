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
	alert("WTF happens here");
	return false;
    return ("open" == popup.state);
  },
    /**
   * Toggles the visibility of the event viewer.
   */
	toggle : function() {
    
    if (this._isViewerVisible()) {
      this._hide();
    } else {
      this._show();
    }
  },
  /**
   * Hides the event viewer if it is visible at the moment.
   */
  _hide : function() {
    var popup = document.getElementById("timelineOverlay");
    if ("open" == popup.state) {
      this._animatePopup(false);
    }
  },
  _show : function() {
    
    var win = this._windowManager.getMostRecentWindow("navigator:browser");
    var documentHasFocus = window.document.hasFocus();
    var event = null;

    if (win != window || this._isViewerVisible() || !documentHasFocus) {
      return;
    }

    //event = this._loadEvent();
    if (true) {
      var popup;
          popup = document.getElementById("timelineOverlay");
          var anchor = document.getElementById("browser-bottombox");
          popup.openPopup(anchor, "before_end", 0, 0, false, false);
          popup.show();
    }
  }

};

window.addEventListener(  "load", function() { CrowdBrowseTimeline2.init(); }, false);