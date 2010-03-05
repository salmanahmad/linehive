var CrowdBrowseTimeline = {
u:0,
num:0,
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

    var popup = document.getElementById("gs-digg-event-popup");
    var bar = document.getElementById("gs-digg-event-bottom-bar");

    return ("open" == popup.state || false == bar.hidden);
  },
    /**
   * Toggles the visibility of the event viewer.
   */
  toggle : function() {
    this._logger.debug("toggle");

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
    alert("_hide");

    var popup = document.getElementById("gs-digg-event-popup");
    var bar = document.getElementById("gs-digg-event-bottom-bar");

    if ("open" == popup.state) {
      this._animatePopup(false);
    }
    if (!bar.hidden) {
      this._animateBar(false);
    }
  },

  /**
   * Shows the next available event.
   */
  showNext : function() {
    this._logger.debug("showNext");

    this._eventIndex++;
    this._loadEvent();
  },
  
  
  /**
   * Shows the previous available event.
   */
  showPrevious : function() {
    this._logger.debug("showPrevious");

    this._eventIndex--;
    this._loadEvent();
  },
/**
   * Loads the event determined by this._eventIndex in the viewer.
   * @return The loaded event object.
   */
  _loadEvent : function() {
    alert("_loadEvent");

    var eventDTO = GlaxDigg.Digg.EventService.getEventAtIndex(this._eventIndex);

    if (null != eventDTO) {
      var notificationStyle =
        GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_STYLE).value;
      var eventBoxes = [
        document.getElementById("gs-digg-event-popup-box"),
        document.getElementById("gs-digg-event-bottom-bar-box")
      ];

      for (var i = 0; i < eventBoxes.length; i++) {
        eventBoxes[i].loadEvent(eventDTO, notificationStyle);
        eventBoxes[i].setAttribute("gsdiggleftnavigationdisabled",
          (this._eventIndex == 0));
        eventBoxes[i].setAttribute("gsdiggrightnavigationdisabled",
          ((this._eventIndex + 1) >= this._eventTotal));
      }
    }

    return eventDTO;
  },
/**
   * Shows the event viewer, displaying the event determined by
   * this._eventIndex.
   */
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
      var notificationType = 1;
      var notificationStyle = 1;
      var boxHeight = 1;

      switch (notificationType) {
        case 1:
          popup = document.getElementById("gs-digg-event-popup");
          var anchor = document.getElementById("browser-bottombox");
          popup.openPopup(anchor, "before_end", 0, 0, false, false);
          this._animatePopup(true);
          break;

        case 2:
          popup = document.getElementById("gs-digg-event-popup");
          var x = (window.screen.availWidth - GS_DIGG_EVENT_BOX_WIDTH);
          var y = (window.screen.availHeight - boxHeight);
          popup.openPopupAtScreen(x, y, false);
          this._animatePopup(true);
          break;

        default: // Bar
          var bar = document.getElementById("gs-digg-event-bottom-bar");
          bar.hidden = false;
          this._animateBar(true);
          break;
      }

      
    }
  },

  /**
   * Animates the notification popup (fade in/fade out).
   * @param aShow Whether to fade in (true) or fade out (false) the popup.
   */
  _animatePopup : function(aShow) {
    alert("_animatePopup");

    // XXX: using var since we're going to use them out of the scope.
    var popup = document.getElementById("gs-digg-event-popup");
    var animationFunction = null;
    var opacity = null;
    var increment = null;
    var limit = null;

    if (aShow) {
      opacity = 0;
      increment = (100 / 10);
      limit = 100;
    } else {
      opacity = 100;
      increment = -(100 / 10);
      limit = 0;
    }

    animationFunction = function() {
      opacity += increment;
      popup.style.opacity = (opacity / 100);

      if (opacity != limit) {
        window.setTimeout(animationFunction, 5);
      } else if (0 == opacity) {
        popup.hidePopup();
      }
    };
alert("WTF");
    animationFunction();
  },

  /**
   * Animates the notification bar (slide in/slide out).
   * @param aShow Whether to slide in (true) or slide out (false) the bar.
   */
  _animateBar : function(aShow) {
    alert("_animateBar");

    // XXX: using var since we're going to use them out of the scope.
    var bar = document.getElementById("gs-digg-event-bottom-bar");
    var animationFunction = null;
    var height = null;
    var increment = null;
    var limit = null;

    var notificationType =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_STYLE).value;
    var boxHeight =
      (notificationType == GS_DIGG_NOTIFICATION_STYLE_COMPACT ?
        GS_DIGG_EVENT_COMPACT_BOX_HEIGHT : GS_DIGG_EVENT_DETAILED_BOX_HEIGHT);

    if (aShow) {
      height = 0;
      increment = (boxHeight / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = boxHeight;
    } else {
      height = boxHeight;
      increment = -(boxHeight / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = 0;
    }

    animationFunction = function() {
      height += increment;
      bar.style.height = height + "px";

      if (height != limit) {
        window.setTimeout(animationFunction, 5);
      } else if (0 == height) {
        bar.hidden = true;
      }
    };

    animationFunction();
  },
/**
   * Updates the state of the status bar button (disabled property) depending
   * on the given event count.
   * @param aEventCount The number of available events.
   */
  _updateStatusBarButton : function(aEventCount) {
    this._logger.debug("_updateStatusBarButton");

    var image = document.getElementById("gs-digg-statusbar-image");

    if (0 >= aEventCount) {
      image.setAttribute("disabled", true);
      image.setAttribute("tooltiptext",
        this._stringBundle.getString("gs.digg.statusbar.disabled.tooltip"));
    } else {
      image.setAttribute("disabled", false);
      image.setAttribute("tooltiptext",
        this._stringBundle.getString("gs.digg.statusbar.enabled.tooltip"));
    }
  },

  /**
   * Updates the event count when changes.
   * @param aEventCount the new event count.
   */
  _updateEventCount : function(aEventCount) {
    alert("_updateEventCount");

    var newTotal = parseInt(aEventCount);

    if (this._eventTotal != newTotal) {
      this._eventIndex = 0;
      this._eventTotal = newTotal;
    }

    this._updateStatusBarButton(newTotal);
  },

  /**
   * Displays the event viewer.
   */
  _displayEvents : function() {
    alert("_displayEvents");
    
      this._show();
    
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe: function(aSubject, aTopic, aData) {
    alert("observe");
	
  }
  
  
};


window.addEventListener(  "load", function() { CrowdBrowseTimeline.init(); CrowdBrowseTimeline._show(); }, false);
window.addEventListener(  "unload", function() { }, false);