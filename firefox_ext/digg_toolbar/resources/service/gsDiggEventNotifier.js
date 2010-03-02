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

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/common/gsDiggAPIService.js");
Cu.import("resource://digg/service/gsDiggEventService.js");

// Key of the snooze preference
const PREF_KEY_SNOOZE = GlaxDigg.Digg.PREF_BRANCH + "snooze";
const PREF_KEY_DISPLAY_TIME =
  GlaxDigg.Digg.PREF_BRANCH + "notification.displayTime";

// Notification display time constants.
const NOTIFICATION_DISPLAY_TIME_LIVE_FEED = 0;
// Time to check for new events, default is 6 minutes.
const DEFAULT_LIVE_FEED_TIME = 6 * 60 * 1000;

/**
 * Event Notifier. Uses the event manager to check for new events once every
 * certain amount of time, and sends out notifications using an observer topic.
 */
GlaxDigg.Digg.EventNotifier = {
  /* Logger for this object. */
  _logger : null,
  /* Preference service */
  _preferenceService : null,

  /* Timer to check for events */
  _checkTimer : null,
  /* Timer to display events */
  _displayTimer : null,
  /* Throttle time (milliseconds, how often the event checkup occurs) */
  _throttle : DEFAULT_LIVE_FEED_TIME,

  /* Observer Topics */
  get TOPIC_NEW_EVENTS() { return "gs-digg-new-events-topic"; },
  get TOPIC_DISPLAY_EVENTS() { return "gs-digg-display-events-topic"; },

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.EventNotifier");
    this._logger.trace("_init");

    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    this._checkTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    this._displayTimer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(PREF_KEY_SNOOZE, this, false);
    this._preferenceService.addObserver(PREF_KEY_DISPLAY_TIME, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Initialize the timer for notifications. This method is required to delay
   * the timer startup until the startup service initializes the API.
   */
  initialize : function() {
    this._logger.debug("initialize");

    this.checkForEvents(true);
    this._updateCheckTimer();
    this._updateDisplayTimer();
  },

  /**
   * Updates the throttle value based on the response headers. Slows the check
   * events cycle if we are running out of API calls.
   * The process checks how many cycles are still to go and compares the
   * available api calls with the pronosticate api calls, if it's bigger then
   * keeps the default value, otherwise reestimate the pending laps, therefore
   * the throttle value is bigger.
   * @param aResponse the response object.
   */
  updateThrottle : function(aResponse) {
    this._logger.debug("updateThrottle");

    if (aResponse) {
      let rateLimitCurrent = aResponse.getResponseHeader("X-RateLimit-Current");
      let rateLimitMax = aResponse.getResponseHeader("X-RateLimit-Max");
      let rateLimitReset = aResponse.getResponseHeader("X-RateLimit-Reset");
      let defaultLiveFeedSeconds = DEFAULT_LIVE_FEED_TIME / 1000;

      if (((rateLimitMax / 2) > rateLimitCurrent) ||
          (defaultLiveFeedSeconds > rateLimitReset)) {
        this._throttle = DEFAULT_LIVE_FEED_TIME;
      } else {
        let availableAPICalls = rateLimitMax - rateLimitCurrent;
        let pendingFetchCycles = rateLimitReset / defaultLiveFeedSeconds;
        let estimatedApiCallsNeeded = pendingFetchCycles * 100;

        if (availableAPICalls > estimatedApiCallsNeeded) {
          this._throttle = DEFAULT_LIVE_FEED_TIME;
        } else {
          let newPendingFetchCycles = availableAPICalls / 100;
          let newThrottle =
            Math.round(rateLimitReset / newPendingFetchCycles) * 1000;

          if (DEFAULT_LIVE_FEED_TIME < newThrottle) {
            this._throttle = newThrottle;
          } else {
            this._throttle = DEFAULT_LIVE_FEED_TIME;
          }
        }
      }
    } else {
      this._throttle = DEFAULT_LIVE_FEED_TIME;
    }
  },

  /**
   * Updates the notifications timer according to the snooze preference.
   */
  _updateCheckTimer : function() {
    this._logger.trace("_updateCheckTimer");

    let that = this;
    let snoozed = GlaxDigg.Application.prefs.get(PREF_KEY_SNOOZE).value;

    this._checkTimer.cancel();
    if (!snoozed) {
      this._checkTimer.initWithCallback({
        notify: function(aTimer) {
          let time = that._getDisplayTime();
          let displayEvents = (NOTIFICATION_DISPLAY_TIME_LIVE_FEED == time);

          that.checkForEvents(displayEvents);
        }
      }, this._throttle, Ci.nsITimer.TYPE_REPEATING_SLACK);
    }
  },

  /**
   * Updates the timer to display the notifications.
   */
  _updateDisplayTimer : function() {
    this._logger.trace("_updateDisplayTimer");

    let that = this;
    let displayTime = this._getDisplayTime();

    this._displayTimer.cancel();

    if (NOTIFICATION_DISPLAY_TIME_LIVE_FEED != displayTime) {
      this._displayTimer.initWithCallback({
        notify: function(aTimer) {
          GlaxDigg.ObserverService.notifyObservers(
            null, that.TOPIC_DISPLAY_EVENTS, null);
        }
      }, displayTime, Ci.nsITimer.TYPE_REPEATING_SLACK);
    }
  },

  /**
   * Gets the display time according to the preference value.
   * @return the display time.
   */
  _getDisplayTime : function() {
    this._logger.trace("_getDisplayTime");

    let displayTime = 0;
    let timeValue = GlaxDigg.Application.prefs.get(PREF_KEY_DISPLAY_TIME).value;

    switch (timeValue) {
      case 0: displayTime =  0 *  0 * 60 * 1000; break; // Live feed.
      case 1: displayTime =  1 * 30 * 60 * 1000; break; // 30 minutes.
      case 2: displayTime =  1 * 60 * 60 * 1000; break; // 1 hour.
      case 3: displayTime =  6 * 60 * 60 * 1000; break; // 6 hours.
      case 4: displayTime = 12 * 60 * 60 * 1000; break; // 12 hours.
      case 5: displayTime = 24 * 60 * 60 * 1000; break; // 24 hours.
    }

    return displayTime;
  },

  /**
   * Uses the event manager to check for new events. If there are, in fact, new
   * events available then the "new events" topic is fired. Only executes if
   * the snooze preference is set to false.
   * @param aDisplayEvents true if display events, false otherwise.
   */
  checkForEvents : function(aDisplayEvents) {
    this._logger.debug("checkForEvents");

    let that = this;
    let callback = function() {
      let snoozed = GlaxDigg.Application.prefs.get(PREF_KEY_SNOOZE).value;

      if (aDisplayEvents && !snoozed) {
        GlaxDigg.ObserverService.notifyObservers(
          null, that.TOPIC_DISPLAY_EVENTS, null);
      }
    };

    GlaxDigg.Digg.EventService.startFetchEventsCycle(callback);
  },

  /**
   * Observes changes in the snooze notifications preference.
   * @param aSubject The object that experienced the change.
   * @param aTopic The topic being observed.
   * @param aData The data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    switch (String(aData)) {
      case PREF_KEY_SNOOZE:
        this._updateCheckTimer();
        break;
      case PREF_KEY_DISPLAY_TIME:
        this._updateDisplayTimer();
      break;
    }
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.EventNotifier);
