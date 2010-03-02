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
Cu.import("resource://digg/dao/gsDiggEventDAO.js");
Cu.import("resource://digg/dto/gsDiggCommentDTO.js");

// Preference keys.
const PREF_KEY_USER_NAME = GlaxDigg.Digg.PREF_BRANCH + "username";
const PREF_KEY_LAST_FETCH_TIME =  GlaxDigg.Digg.PREF_BRANCH + "lastFetchTime";
const PREF_KEY_NOTIFY_FRIENDS =
  GlaxDigg.Digg.PREF_BRANCH + "notify.friendsActivity";
const PREF_KEY_NOTIFY_NEWS = GlaxDigg.Digg.PREF_BRANCH + "notify.news";
const PREF_KEY_NOTIFY_VIDEOS = GlaxDigg.Digg.PREF_BRANCH + "notify.videos";
const PREF_KEY_NOTIFY_IMAGES = GlaxDigg.Digg.PREF_BRANCH + "notify.images";
const PREF_KEY_NOTIFY_TOPIC = GlaxDigg.Digg.PREF_BRANCH + "notify.topic.list";
const PREF_KEY_NOTIFY_CONTAINER =
  GlaxDigg.Digg.PREF_BRANCH + "notify.container.list";
const PREF_KEY_NOTIFY_DIGGS = GlaxDigg.Digg.PREF_BRANCH + "notify.diggCount";

// Media types.
const MEDIA_TYPE_NEWS = "news";
const MEDIA_TYPE_VIDEOS = "videos";
const MEDIA_TYPE_IMAGES = "images";

// Number of friend activity events to fetch.
const FRIEND_ACTIVITY_FETCH_COUNT = 50;

/**
 * Event Service. Fetches events (stories, friend activity) and provides
 * methods to retrieve them.
 */
GlaxDigg.Digg.EventService = {
  /* Logger for this object. */
  _logger : null,
  /* Preference service */
  _preferenceService : null,

  /* Counter for the open fetch event threads. */
  _fetchEventCount : 0,
  /* Flag that determines whether or not there were new events fetched. */
  _thereWereNewEvents : false,
  /* The most recent event Id, used to determine if there are in fact new events
     since last check */
  _mostRecentEventId : null,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.EventService");
    this._logger.trace("_init");

    this._preferenceService =
      Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);

    // Observers added to watch changes in the notification preferences
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch2);
    this._preferenceService.addObserver(PREF_KEY_USER_NAME, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_NEWS, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_VIDEOS, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_IMAGES, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_FRIENDS, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_TOPIC, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_CONTAINER, this, false);
    this._preferenceService.addObserver(PREF_KEY_NOTIFY_DIGGS, this, false);
    this._preferenceService.QueryInterface(Ci.nsIPrefBranch);
  },

  /**
   * Sets the flag that determines whether or not there were new events fetched.
   * @aValue The flag value to be set.
   */
  _handleNewEvents : function(aValue) {
    this._logger.trace("_handleNewEvents");

    let eventCount = this.getEventCount();

    this._thereWereNewEvents = true;

    GlaxDigg.ObserverService.notifyObservers(
      null, GlaxDigg.Digg.EventNotifier.TOPIC_NEW_EVENTS, eventCount);
  },

  /**
   * Gets the last time in which events were fetched.
   * @return The last time in which events were fetched if the value is found.
   * Null otherwise.
   */
  _getLastFetchTime : function() {
    this._logger.trace("_getLastFetchTime");

    let time = GlaxDigg.Application.prefs.get(PREF_KEY_LAST_FETCH_TIME).value;

    if (time <= 0) {
      time = null;
    }

    return time;
  },

  /**
   * Sets the last time in which events were fetched.
   * @param aValue The new time value.
   */
  _setLastFetchTime : function(aValue) {
    this._logger.trace("_lastFetchTime[set]");

    GlaxDigg.Application.prefs.setValue(PREF_KEY_LAST_FETCH_TIME, aValue);
  },

  /**
   * Obtains the array of user selected media types.
   */
  _getSelectedMediaTypes : function() {
    this._logger.trace("_getSelectedMediaTypes");

    let mediaTypes = new Array();
    let notifyNews = GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_NEWS).value;
    let notifyVideos =
      GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_VIDEOS).value;
    let notifyImages =
      GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_IMAGES).value;

    if (notifyNews) {
      mediaTypes.push(MEDIA_TYPE_NEWS);
    }
    if (notifyVideos) {
      mediaTypes.push(MEDIA_TYPE_VIDEOS);
    }
    if (notifyImages) {
      mediaTypes.push(MEDIA_TYPE_IMAGES);
    }

    return mediaTypes;
  },

  /**
   * Gets the minimum digg count when fetching new events.
   * @return the minimum digg count.
   */
  _getMinimumDiggCount : function() {
    this._logger.trace("_getMinimumDiggCount");

    let diggCount = 0;
    let diggPref = GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_DIGGS).value;

    switch (diggPref) {
      case 0: diggCount = 1;    break;
      case 1: diggCount = 500;  break;
      case 2: diggCount = 1000; break;
      case 3: diggCount = 2000; break;
      case 4: diggCount = 3000; break;
      case 5: diggCount = 4000; break;
      case 6: diggCount = 5000; break;
    }

    return diggCount;
  },

  /**
   * Starts the cycle to fetch new events (stories, friend activity).
   * @param aLoadHandler the callback method.
   */
  startFetchEventsCycle : function(aLoadHandler) {
    this._logger.debug("startFetchEventsCycle");

    let lastFetchTime = this._getLastFetchTime();

    this._fetchEventCount = 0;
    this._thereWereNewEvents = false;
    this._fetchPopularStoriesByContainer(lastFetchTime, aLoadHandler);
    this._fetchPopularStoriesByTopic(lastFetchTime, aLoadHandler);
    this._fetchFriendActivity(lastFetchTime, aLoadHandler);
  },

  /**
   * Fetches friend activity events if both a Digg user name is stored and
   * "notify friend activity" is active in the preferences.
   * @param aLastFetchTime The last time friend activity was fetched.
   * @param aLoadHandler the callback method.
   */
  _fetchFriendActivity : function(aLastFetchTime, aLoadHandler) {
    this._logger.trace("_fetchFriendActivity");

    let that = this;
    let notifyFriends =
      GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_FRIENDS).value;
    let userName = GlaxDigg.Application.prefs.get(PREF_KEY_USER_NAME).value;

    userName = GlaxDigg.Util.UtilityService.trim(userName);

    if (notifyFriends &&
        !GlaxDigg.Util.UtilityService.isNullOrEmpty(userName)) {
      let submittedParams = {
        "username" : userName, "count" : FRIEND_ACTIVITY_FETCH_COUNT
      };
      let commentedParams = {
        "username" : userName, "count" : FRIEND_ACTIVITY_FETCH_COUNT
      };
      let duggsParams = {
        "username" : userName, "count" : FRIEND_ACTIVITY_FETCH_COUNT
      };

      if (null != aLastFetchTime) {
        submittedParams.min_submit_date = aLastFetchTime;
        commentedParams.min_date = aLastFetchTime;
        duggsParams.min_date = aLastFetchTime;
      }

      // friend submissions
      GlaxDigg.Digg.APIService.readAPI.getFriendSubmissions(
        submittedParams,
        function(aResult, aResponse) {
          that._fetchFriendsEventsLoadHandler(aResult, aLoadHandler,
            GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_SUBMISSION);
          // updates the throttle based on response headers.
          GlaxDigg.Digg.EventNotifier.updateThrottle(aResponse);
        },
        function(aError, aResponse) {
          that._fetchFriendsEventsLoadHandler(aError, aLoadHandler,
            GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_SUBMISSION);
          // updates the throttle based on response headers.
          GlaxDigg.Digg.EventNotifier.updateThrottle(aResponse);
        });

      // friend comments
      GlaxDigg.Digg.APIService.readAPI.getFriendComments(
        commentedParams,
        function(aResult) {
          that._fetchFriendsEventsLoadHandler(aResult, aLoadHandler,
            GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_COMMENT);
        },
        function(aError) {
          that._fetchFriendsEventsLoadHandler(aError, aLoadHandler,
            GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_COMMENT);
        });

      // friend dugg stories
      GlaxDigg.Digg.APIService.readAPI.getFriendDugg(
        duggsParams,
        function(aResult) {
          that._fetchFriendsEventsLoadHandler(aResult, aLoadHandler,
            GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_DIGG);
        },
        function(aError) {
          that._fetchFriendsEventsLoadHandler(aError, aLoadHandler,
            GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_DIGG);
        });

      this._fetchEventCount += 3;
    }
  },

  /**
   * Handles the response from the friend fetch events methods.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   * @param aEventType the type of event.
   */
  _fetchFriendsEventsLoadHandler : function(aResult, aLoadHandler, aEventType) {
    this._logger.trace("_fetchFriendsEventsLoadHandler");

    this._fetchEventCount--;

    try {
      if (aResult && !aResult["error"] && aResult["stories"]) {
        let eventDTO = null;
        let storyDTO = null;
        let storiesJSON = aResult["stories"];
        let storiesTimestamp = aResult["timestamp"];
        let newEvents = false;

        this._setLastFetchTime(storiesTimestamp);

        for (let i = storiesJSON.length - 1; 0 <= i; i--) {
          storyDTO = new GlaxDigg.Digg.StoryDTO();
          storyDTO.populateFromJSON(storiesJSON[i]);

          if (GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_COMMENT == aEventType) {
            // fetch individual comments for each of the commented stories
            this._fetchComments(storyDTO, aLoadHandler);
          } else {
            eventDTO = new GlaxDigg.Digg.EventDTO();
            eventDTO.populateFromStory(storyDTO, aEventType);

            if (GlaxDigg.Digg.EventDAO.insertEvent(eventDTO)) {
              newEvents = true;
            }
          }
        }

        if (newEvents) {
          this._handleNewEvents();
        }
      } else if (aResult["message"]) {
        this._logger.warn(
          "_fetchFriendsEventsLoadHandler: Error received: " +
          aResult["message"]);
      }
    } catch (e) {
      this._logger.error("_fetchFriendsEventsLoadHandler:\n" + e);
    }

    this._finishFetchEventsCycle(aLoadHandler);
  },

  /**
   * Fetches individual comments for each of the friends who commented on the
   * given story.
   * @param aStory The story to which friend users added comments.
   * @param aLoadHandler the callback method.
   */
  _fetchComments : function(aStoryDTO, aLoadHandler) {
    this._logger.trace("_fetchComments");

    if (GlaxDigg.Util.UtilityService.isArray(aStoryDTO.friends)) {
      let that = this;
      let friendDTO;
      let params;

      for (let i = 0; i < aStoryDTO.friends.length; i++) {
        friendDTO = aStoryDTO.friends[i];

        params = {
          "username" : friendDTO.userName,
          "sort" : "date-desc"
        };

        GlaxDigg.Digg.APIService.readAPI.getUserComments(
          params,
          function(aResult) {
            that._fetchCommentsLoadHandler(aResult, aStoryDTO, aLoadHandler);
          },
          function(aError) {
            that._fetchCommentsLoadHandler(aError, aStoryDTO, aLoadHandler);
          });
        this._fetchEventCount++;
      }
    }
  },

  /**
   * Handles the response from the fetch comments method. Comments that belong
   * to the given story are stored as events.
   * @param aResult the result returned by the server.
   * @param aStoryDTO the story dto.
   * @param aLoadHandler the callback method.
   */
  _fetchCommentsLoadHandler : function(aResult, aStoryDTO, aLoadHandler) {
    this._logger.trace("_fetchCommentsLoadHandler");

    this._fetchEventCount--;

    try {
      if (aResult && !aResult["error"] && aResult["comments"]) {
        let eventDTO = null;
        let commentDTO = null;
        let commentsJSON = aResult["comments"];
        let commentsTimestamp = aResult["timestamp"];
        let newEvents = false;

        this._setLastFetchTime(commentsTimestamp);

        for (let i = commentsJSON.length - 1; 0 <= i; i--) {
          commentDTO = new GlaxDigg.Digg.CommentDTO();
          commentDTO.populateFromJSON(commentsJSON[i]);

          if (commentDTO.storyId == aStoryDTO.storyId) {
            eventDTO = new GlaxDigg.Digg.EventDTO();
            eventDTO.populateFromStoryComment(aStoryDTO, commentDTO);

            if (GlaxDigg.Digg.EventDAO.insertEvent(eventDTO)) {
              newEvents = true;
            }
          }
        }

        if (newEvents) {
          this._handleNewEvents();
        }
      } else if (aResult["message"]) {
        this._logger.warn(
          "_fetchCommentsLoadHandler: Error received: " +
          aResult["message"]);
      }
    } catch (e) {
      this._logger.error("_fetchCommentsLoadHandler:\n" + e);
    }

    this._finishFetchEventsCycle(aLoadHandler);
  },

  /**
   * Fetches popular stores for the selected media types and topics from the
   * preferences.
   * @param aLastFetchTime The last time popular stories were fetched.
   * @param aLoadHandler the callback method.
   */
  _fetchPopularStoriesByContainer : function(aLastFetchTime, aLoadHandler) {
    this._logger.trace("_fetchPopularStoriesByContainer");

    let that = this;
    let mediaTypes = this._getSelectedMediaTypes();
    let containersString =
      GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_CONTAINER).value;

    if (0 < mediaTypes.length && 0 < containersString.length) {
      let containerArray = containersString.split(",");
      let params = {
        "media" : mediaTypes.toString(),
        "sort" : "promote_date-desc"
      };

      if (null != aLastFetchTime) {
        params.min_promote_date = aLastFetchTime;
      }

      for (let i = containerArray.length - 1; 0 <= i; i--) {
        params.container = containerArray[i].replace(/"/g, "");

        GlaxDigg.Digg.APIService.readAPI.getPopularStories(
          params,
          function(aResult) {
            that._fetchPopularStoriesLoadHandler(
              aResult, aLoadHandler, GlaxDigg.Digg.EventDTO.EVENT_TYPE_STORY);
          },
          function(aError) {
            that._fetchPopularStoriesLoadHandler(
              aError, aLoadHandler, GlaxDigg.Digg.EventDTO.EVENT_TYPE_STORY);
          });
        this._fetchEventCount++;
      }
    }
  },

  /**
   * Fetches popular stores for the selected media types and topics from the
   * preferences.
   * @param aLastFetchTime The last time popular stories were fetched.
   * @param aLoadHandler the callback method.
   */
  _fetchPopularStoriesByTopic : function(aLastFetchTime, aLoadHandler) {
    this._logger.trace("_fetchPopularStoriesByTopic");

    let that = this;
    let mediaTypes = this._getSelectedMediaTypes();
    let topicsString =
      GlaxDigg.Application.prefs.get(PREF_KEY_NOTIFY_TOPIC).value;

    if (0 < mediaTypes.length && 0 < topicsString.length) {
      let topicArray = topicsString.split(",");
      let params = {
        "media" : mediaTypes.toString(),
        "sort" : "promote_date-desc"
      };

      if (null != aLastFetchTime) {
        params.min_promote_date = aLastFetchTime;
      }

      for (let i = topicArray.length - 1; 0 <= i; i--) {
        params.topic = topicArray[i].replace(/"/g, "");

        GlaxDigg.Digg.APIService.readAPI.getPopularStories(
          params,
          function(aResult) {
            that._fetchPopularStoriesLoadHandler(
              aResult, aLoadHandler, GlaxDigg.Digg.EventDTO.EVENT_TYPE_STORY);
          },
          function(aError) {
            that._fetchPopularStoriesLoadHandler(
              aError, aLoadHandler, GlaxDigg.Digg.EventDTO.EVENT_TYPE_STORY);
          });
        this._fetchEventCount++;
      }
    }
  },

  /**
   * Handles the response from the popular fetch events methods.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   * @param aEventType the type of event.
   */
  _fetchPopularStoriesLoadHandler : function(
    aResult, aLoadHandler, aEventType) {
    this._logger.trace("_fetchPopularStoriesLoadHandler");

    this._fetchEventCount--;

    try {
      if (aResult && !aResult["error"] && aResult["stories"]) {
        let eventDTO = null;
        let storyDTO = null;
        let storiesJSON = aResult["stories"];
        let storiesTimestamp = aResult["timestamp"];
        let newEvents = false;
        let diggCount = this._getMinimumDiggCount();

        this._setLastFetchTime(storiesTimestamp);

        for (let i = storiesJSON.length - 1; 0 <= i; i--) {
          storyDTO = new GlaxDigg.Digg.StoryDTO();
          storyDTO.populateFromJSON(storiesJSON[i]);

          if (storyDTO.diggs >= diggCount) {
            eventDTO = new GlaxDigg.Digg.EventDTO();
            eventDTO.populateFromStory(storyDTO, aEventType);

            if (GlaxDigg.Digg.EventDAO.insertEvent(eventDTO)) {
              newEvents = true;
            }
          }
        }

        if (newEvents) {
          this._handleNewEvents();
        }
      } else if (aResult["message"]) {
        this._logger.warn(
          "_fetchPopularStoriesLoadHandler: Error received: " +
          aResult["message"]);
      }
    } catch (e) {
      this._logger.error("_fetchPopularStoriesLoadHandler:\n" + e);
    }

    this._finishFetchEventsCycle(aLoadHandler);
  },

  /**
   * Finishes the fetch events cycle.
   * Calls the load handler to notify observers.
   */
  _finishFetchEventsCycle : function(aLoadHandler) {
    this._logger.trace("_finishFetchEventsCycle");

    if (this._fetchEventCount == 0 && this._thereWereNewEvents) {
      let mostRecentEvent = this.getEventAtIndex(0);

      if (mostRecentEvent && mostRecentEvent.id != this._mostRecentEventId) {
        this._mostRecentEventId = mostRecentEvent.id;

        aLoadHandler();
      }
    }
  },

  /**
   * Gets the event at the given index.
   * @param aIndex The index of the event to get. If null, zero is assumed.
   * @return An event object. Null if there isn't any.
   */
  getEventAtIndex : function(aIndex) {
    this._logger.debug("getEventAtIndex");

    let event = null;
    let eventCount = GlaxDigg.Digg.EventDAO.getEventCount();

    if (0 < eventCount) {
      if (null == aIndex) {
        aIndex = 0;
      }

      while (0 > aIndex) {
        aIndex += eventCount;
      }
      while (eventCount <= aIndex) {
        aIndex -= eventCount;
      }

      event = GlaxDigg.Digg.EventDAO.getEventAtIndex(aIndex);
    }

    return event;
  },

  /**
   * Obtains the current number of available events.
   * @return The number of events.
   */
  getEventCount : function() {
    this._logger.debug("getEventCount");

    return GlaxDigg.Digg.EventDAO.getEventCount();
  },

  /**
   * Clears (deletes) all the stored events and resets the last fetch time
   * preference.
   */
  _clearEvents : function() {
    this._logger.trace("_clearEvents");

    this._setLastFetchTime(0);
    this._mostRecentEventId = null;
    GlaxDigg.Digg.EventDAO.clearEvents();
    GlaxDigg.ObserverService.notifyObservers(
      null, GlaxDigg.Digg.EventNotifier.TOPIC_NEW_EVENTS, 0);
  },

  /**
   * Observes changes in the notifications preferences.
   * @param aSubject The object that experienced the change.
   * @param aTopic The topic being observed.
   * @param aData The data relating to the change.
   */
  observe : function(aSubject, aTopic, aData) {
    this._logger.debug("observe");

    switch (String(aData)) {
      case PREF_KEY_USER_NAME:
      case PREF_KEY_NOTIFY_NEWS:
      case PREF_KEY_NOTIFY_VIDEOS:
      case PREF_KEY_NOTIFY_IMAGES:
      case PREF_KEY_NOTIFY_FRIENDS:
      case PREF_KEY_NOTIFY_TOPIC:
      case PREF_KEY_NOTIFY_CONTAINER:
      case PREF_KEY_NOTIFY_DIGGS:
        this._clearEvents();
        break;
    }
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.EventService);
