/***** BEGIN LICENSE BLOCK *****

Copyright (c) 2008-2009, Digg Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.
* Neither the name of Digg Inc. nor the names of its contributors may be used to
endorse or promote products derived from this software without specific prior
written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

***** END LICENSE BLOCK *****/

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/service/gsDiggEventService.js");
Cu.import("resource://digg/service/gsDiggEventNotifier.js");

// Notification type constants.
const GS_DIGG_NOTIFICATION_TYPE_BOTTOM_BAR = 0;
const GS_DIGG_NOTIFICATION_TYPE_INNER_POPUP = 1;
const GS_DIGG_NOTIFICATION_TYPE_OUTER_POPUP = 2;
// Notification style constants.
const GS_DIGG_NOTIFICATION_STYLE_COMPACT = 0;
const GS_DIGG_NOTIFICATION_STYLE_DETAILED = 1;
// Notification autohide constants.
const GS_DIGG_NOTIFICATION_AUTOHIDE_NEVER_SHOW = 0;
const GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_FIVE = 1;
const GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_TEN = 2;
const GS_DIGG_NOTIFICATION_AUTOHIDE_KEEP_OPEN = 3;
// Notification animation constants.
const GS_DIGG_EVENT_BOX_WIDTH = 520;
const GS_DIGG_EVENT_COMPACT_BOX_HEIGHT = 60;
const GS_DIGG_EVENT_DETAILED_BOX_HEIGHT = 140;
const GS_DIGG_EVENT_ANIMATION_STEPS = 5;
const GS_DIGG_EVENT_ANIMATION_TIMEOUT = 50;

/**
 * Event Notification Viewer script.
 */
GlaxChrome.Digg.EventViewer = {
  /* Logger for this object. */
  _logger : null,
  /* Preference service */
  _preferenceService : null,
  /* Window manager */
  _windowManager : null,
  /* String bundle */
  _stringBundle : null,

  /* Index of the current event being viewed */
  _eventIndex : 0,
  /* Total number of events available */
  _eventTotal : null,
  /* Auto-hide timeout id */
  _autohideTimer : null,

  /**
   * Initializes the object.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxChrome.Digg.EventViewer");
    this._logger.debug("init");

    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._windowManager =
      Cc["@mozilla.org/appshell/window-mediator;1"].
        getService(Ci.nsIWindowMediator);
    this._stringBundle = document.getElementById("gs-digg-string-bundle");

    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.EventNotifier.TOPIC_NEW_EVENTS, false);
    GlaxDigg.ObserverService.addObserver(
      this, GlaxDigg.Digg.EventNotifier.TOPIC_DISPLAY_EVENTS, false);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(GS_DIGG_PREF_USER_NAME, this, false);
    this._preferenceService.addObserver(GS_DIGG_PREF_NOTIFY_NEWS, this, false);
    this._preferenceService.addObserver(GS_DIGG_PREF_NOTIFY_DIGGS, this, false);
    this._preferenceService.addObserver(GS_DIGG_PREF_NOTIFY_TOPIC, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_NOTIFY_VIDEOS, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_NOTIFY_IMAGES, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_NOTIFY_FRIENDS, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_NOTIFY_CONTAINER, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_NOTIFICATION_TYPE, this, false);
    this._preferenceService.addObserver(
      GS_DIGG_PREF_NOTIFICATION_STYLE, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);

    this._eventTotal = GlaxDigg.Digg.EventService.getEventCount();
    this._updateStatusBarButton(this._eventTotal);
  },

  /**
   * Uninitializes the object.
   */
  uninit : function() {
    this._logger.debug("uninit");

    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.EventNotifier.TOPIC_NEW_EVENTS);
    GlaxDigg.ObserverService.removeObserver(
      this, GlaxDigg.Digg.EventNotifier.TOPIC_DISPLAY_EVENTS);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.removeObserver(GS_DIGG_PREF_USER_NAME, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_NEWS, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_VIDEOS, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_IMAGES, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_FRIENDS, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_DIGGS, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_TOPIC, this);
    this._preferenceService.removeObserver(GS_DIGG_PREF_NOTIFY_CONTAINER, this);
    this._preferenceService.removeObserver(
      GS_DIGG_PREF_NOTIFICATION_TYPE, this);
    this._preferenceService.removeObserver(
      GS_DIGG_PREF_NOTIFICATION_STYLE, this);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Determines whether the event viewer is visible or not.
   * @return True if the viewer is visible, false otherwise.
   */
  _isViewerVisible : function() {
    this._logger.trace("_isViewerVisible");

    let popup = document.getElementById("gs-digg-event-popup");
    let bar = document.getElementById("gs-digg-event-bottom-bar");

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
    this._logger.trace("_hide");

    let popup = document.getElementById("gs-digg-event-popup");
    let bar = document.getElementById("gs-digg-event-bottom-bar");

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
    this._logger.trace("_loadEvent");

    let eventDTO = GlaxDigg.Digg.EventService.getEventAtIndex(this._eventIndex);

    if (null != eventDTO) {
      let notificationStyle =
        GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_STYLE).value;
      let eventBoxes = [
        document.getElementById("gs-digg-event-popup-box"),
        document.getElementById("gs-digg-event-bottom-bar-box")
      ];

      for (let i = 0; i < eventBoxes.length; i++) {
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
    this._logger.trace("_show");

    let win = this._windowManager.getMostRecentWindow("navigator:browser");
    let documentHasFocus = window.document.hasFocus();
    let event = null;

    if (win != window || this._isViewerVisible() || !documentHasFocus) {
      return;
    }

    event = this._loadEvent();

    if (null != event) {
      let popup;
      let notificationType =
        GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_TYPE).value;
      let notificationStyle =
        GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_STYLE).value;
      let boxHeight = (notificationStyle == GS_DIGG_NOTIFICATION_STYLE_COMPACT ?
        GS_DIGG_EVENT_COMPACT_BOX_HEIGHT : GS_DIGG_EVENT_DETAILED_BOX_HEIGHT);

      switch (notificationType) {
        case GS_DIGG_NOTIFICATION_TYPE_INNER_POPUP:
          popup = document.getElementById("gs-digg-event-popup");
          let anchor = document.getElementById("browser-bottombox");
          popup.openPopup(anchor, "before_end", 0, 0, false, false);
          this._animatePopup(true);
          break;

        case GS_DIGG_NOTIFICATION_TYPE_OUTER_POPUP:
          popup = document.getElementById("gs-digg-event-popup");
          let x = (window.screen.availWidth - GS_DIGG_EVENT_BOX_WIDTH);
          let y = (window.screen.availHeight - boxHeight);
          popup.openPopupAtScreen(x, y, false);
          this._animatePopup(true);
          break;

        default:
          let bar = document.getElementById("gs-digg-event-bottom-bar");
          bar.hidden = false;
          this._animateBar(true);
          break;
      }

      this.startAutoHide();
    }
  },

  /**
   * Starts the auto-hide timer depending on the current auto-hide preference.
   */
  startAutoHide : function() {
    this._logger.debug("startAutoHide");

    this.stopAutoHide();

    let autohide =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_AUTOHIDE).value;
    let delay = null;
    let that = this;

    if (GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_FIVE == autohide) {
      delay = 5000;
    } else if (GS_DIGG_NOTIFICATION_AUTOHIDE_AFTER_TEN == autohide) {
      delay = 10000;
    }

    if (null != delay) {
      this._autohideTimer =
        window.setTimeout(function() { that._hide(); }, delay);
    }
  },

  /**
   * Stops the auto-hide timer.
   */
  stopAutoHide : function() {
    this._logger.debug("stopAutoHide");

    window.clearTimeout(this._autohideTimer);
  },

  /**
   * Animates the notification popup (fade in/fade out).
   * @param aShow Whether to fade in (true) or fade out (false) the popup.
   */
  _animatePopup : function(aShow) {
    this._logger.trace("_animatePopup");

    // XXX: using var since we're going to use them out of the scope.
    var popup = document.getElementById("gs-digg-event-popup");
    var animationFunction = null;
    var opacity = null;
    var increment = null;
    var limit = null;

    if (aShow) {
      opacity = 0;
      increment = (100 / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = 100;
    } else {
      opacity = 100;
      increment = -(100 / GS_DIGG_EVENT_ANIMATION_STEPS);
      limit = 0;
    }

    animationFunction = function() {
      opacity += increment;
      popup.style.opacity = (opacity / 100);

      if (opacity != limit) {
        window.setTimeout(animationFunction, GS_DIGG_EVENT_ANIMATION_TIMEOUT);
      } else if (0 == opacity) {
        popup.hidePopup();
      }
    };

    animationFunction();
  },

  /**
   * Animates the notification bar (slide in/slide out).
   * @param aShow Whether to slide in (true) or slide out (false) the bar.
   */
  _animateBar : function(aShow) {
    this._logger.trace("_animateBar");

    // XXX: using var since we're going to use them out of the scope.
    var bar = document.getElementById("gs-digg-event-bottom-bar");
    var animationFunction = null;
    var height = null;
    var increment = null;
    var limit = null;

    let notificationType =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_STYLE).value;
    let boxHeight =
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
        window.setTimeout(animationFunction, GS_DIGG_EVENT_ANIMATION_TIMEOUT);
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

    let image = document.getElementById("gs-digg-statusbar-image");

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
    this._logger.trace("_updateEventCount");

    let newTotal = parseInt(aEventCount);

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
    this._logger.trace("_displayEvents");

    let autohide =
      GlaxDigg.Application.prefs.get(GS_DIGG_PREF_NOTIFICATION_AUTOHIDE).value;

    if (GS_DIGG_NOTIFICATION_AUTOHIDE_NEVER_SHOW != autohide) {
      this._show();
    }
  },

  /**
   * Observes global topic changes.
   * @param aSubject the object that experienced the change.
   * @param aTopic the topic being observed.
   * @param aData the data relating to the change.
   */
  observe: function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    switch (aTopic) {
      case GlaxDigg.Digg.EventNotifier.TOPIC_NEW_EVENTS:
        this._updateEventCount(aData);
        break;
      case GlaxDigg.Digg.EventNotifier.TOPIC_DISPLAY_EVENTS:
        this._displayEvents();
        break;
      case "nsPref:changed":
        switch (String(aData)) {
          case GS_DIGG_PREF_USER_NAME:
          case GS_DIGG_PREF_NOTIFY_NEWS:
          case GS_DIGG_PREF_NOTIFY_VIDEOS:
          case GS_DIGG_PREF_NOTIFY_IMAGES:
          case GS_DIGG_PREF_NOTIFY_FRIENDS:
          case GS_DIGG_PREF_NOTIFY_TOPIC:
          case GS_DIGG_PREF_NOTIFY_CONTAINER:
          case GS_DIGG_PREF_NOTIFY_DIGGS:
          case GS_DIGG_PREF_NOTIFICATION_TYPE:
          case GS_DIGG_PREF_NOTIFICATION_STYLE:
            this._eventIndex = 0;
            this._hide();
            break;
        }
        break;
    }
  }
};

window.addEventListener(
  "load", function() { GlaxChrome.Digg.EventViewer.init(); }, false);
window.addEventListener(
  "unload", function() { GlaxChrome.Digg.EventViewer.uninit(); }, false);
