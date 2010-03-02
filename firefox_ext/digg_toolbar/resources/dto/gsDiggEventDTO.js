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

/**
 * Event DTO
 * Stores events info.
 */
GlaxDigg.Digg.EventDTO = function() {
  this._init();
}

// Event types.
GlaxDigg.Digg.EventDTO.EVENT_TYPE_STORY =             1;
GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_SUBMISSION = 2;
GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_COMMENT =    3;
GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_DIGG =       4;

GlaxDigg.Digg.EventDTO.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* IO service, used to create nsURI objects. */
  _ioService : null,

  /* Id of the event */
  _id : null,
  /* Target url to be opened by the event */
  _href : null,
  /* The event direct link */
  _link : null,
  /* Domain of the link URL */
  _domain : null,
  /* Date of the event */
  _date : null,
  /* Event title */
  _title : null,
  /* Event description */
  _description : null,
  /* Event story topic */
  _topic : null,
  /* Event story media */
  _media : null,
  /* URL of the event's image */
  _imageURL : null,
  /* Number of diggs */
  _diggs : null,
  /* Number of comments */
  _comments : null,
  /* Friend user names (comma-separated) related with the event */
  _friends : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.EventDTO");
    this._logger.debug("init");

    this._ioService =
      Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  },

  /**
   * Getter of the id attribute.
   * @return The id of the event.
   */
  get id() {
    this._logger.debug("id[get]");
    return this._id;
  },

  /**
   * Setter of the id attribute.
   * @param aValue The new value for the event id.
   */
  set id(aValue) {
    this._logger.debug("id[set]");
    this._id = aValue;
  },

  /**
   * Getter of the type attribute.
   * @return The type of the event.
   */
  get type() {
    this._logger.debug("type[get]");
    return this._type;
  },

  /**
   * Setter of the type attribute.
   * @param aValue The new value for the event type.
   */
  set type(aValue) {
    this._logger.debug("type[set]");
    this._type = aValue;
  },

  /**
   * Getter of the href attribute.
   * @return The href of the event.
   */
  get href() {
    this._logger.debug("href[get]");
    return this._href;
  },

  /**
   * Setter of the href attribute.
   * @param aValue The new value for the href.
   */
  set href(aValue) {
    this._logger.debug("href[set]");
    this._href = aValue;
  },

  /**
   * Getter of the link attribute.
   * @return The direct link of the event.
   */
  get link() {
    this._logger.debug("link[get]");
    return this._link;
  },

  /**
   * Setter of the link attribute.
   * @param aValue The new value for the link.
   */
  set link(aValue) {
    this._logger.debug("link[set]");
    this._link = aValue;

    let uri;

    try {
      uri = this._ioService.newURI(this._link, null, null);
    } catch (e) {
      uri = this._ioService.newURI("http://" + this._link, null, null);
    }

    this._domain = uri.host;
  },

  /**
   * Getter of the link URL domain.
   * @return The domain of the link URL.
   */
  get domain() {
    this._logger.debug("domain[get]");
    return this._domain;
  },

  /**
   * Getter of the date attribute.
   * @return The date of the event.
   */
  get date() {
    this._logger.debug("date[get]");
    return this._date;
  },

  /**
   * Setter of the date attribute.
   * @param aValue The new value for the date.
   */
  set date(aValue) {
    this._logger.debug("date[set]");
    this._date = aValue;
  },

  /**
   * Getter of the title attribute.
   * @return The title of the event.
   */
  get title() {
    this._logger.debug("title[get]");
    return this._title;
  },

  /**
   * Setter of the title attribute.
   * @param aValue The new value for the title.
   */
  set title(aValue) {
    this._logger.debug("title[set]");
    this._title = aValue;
  },

  /**
   * Getter of the description attribute.
   * @return The date of the event.
   */
  get description() {
    this._logger.debug("description[get]");
    return this._description;
  },

  /**
   * Setter of the description attribute.
   * @param aValue The new value for the description.
   */
  set description(aValue) {
    this._logger.debug("description[set]");
    this._description = aValue;
  },

  /**
   * Getter of the topic attribute.
   * @return The topic of the event story.
   */
  get topic() {
    this._logger.debug("topic[get]");
    return this._topic;
  },

  /**
   * Setter of the topic attribute.
   * @param aValue The new value for the topic.
   */
  set topic(aValue) {
    this._logger.debug("topic[set]");
    this._topic = aValue;
  },

  /**
   * Getter of the story media.
   * @return The media of the event story.
   */
  get media() {
    this._logger.debug("media[get]");
    return this._media;
  },

  /**
   * Setter of the story media.
   * @param aValue The new value for the media.
   */
  set media(aValue) {
    this._logger.debug("media[set]");
    this._media = aValue;
  },

  /**
   * Getter of the imageURL attribute.
   * @return The URL of the event's image.
   */
  get imageURL() {
    this._logger.debug("imageURL[get]");
    return this._imageURL;
  },

  /**
   * Setter of the imageURL attribute.
   * @param aValue The new value for the URL of the event's image.
   */
  set imageURL(aValue) {
    this._logger.debug("imageURL[set]");
    this._imageURL = aValue;
  },

  /**
   * Getter of the user attribute.
   * @return The user name of the user who submitted the story.
   */
  get user() {
    this._logger.debug("user[get]");
    return this._user;
  },

  /**
   * Setter of the user attribute.
   * @param aValue The new user name of the user who submitted the story.
   */
  set user(aValue) {
    this._logger.debug("user[set]");
    this._user = aValue;
  },

  /**
   * Getter of the diggs attribute.
   * @return The number of diggs of the event.
   */
  get diggs() {
    this._logger.debug("diggs[get]");
    return this._diggs;
  },

  /**
   * Setter of the diggs attribute.
   * @param aValue The new value for the diggs attribute.
   */
  set diggs(aValue) {
    this._logger.debug("diggs[set]");
    this._diggs = aValue;
  },

  /**
   * Getter of the comments attribute.
   * @return The number of comments of the event.
   */
  get comments() {
    this._logger.debug("comments[get]");
    return this._comments;
  },

  /**
   * Setter of the comments attribute.
   * @param aValue The new value for the comments attribute.
   */
  set comments(aValue) {
    this._logger.debug("comments[set]");
    this._comments = aValue;
  },

  /**
   * Getter of the friends attribute.
   * @return The friends related with this event.
   */
  get friends() {
    this._logger.debug("friends[get]");
    return this._friends;
  },

  /**
   * Setter of the friends attribute.
   * @param aValue The new value for the friends attribute.
   */
  set friends(aValue) {
    this._logger.debug("friends[set]");
    this._friends = aValue;
  },

  /**
   * Populates the event object with the information from a story.
   * @param aStoryDTO The storyDTO object used to populate the event.
   * @param aEventType The type of this event object.
   * @throws Exception if aStoryDTO is invalid.
   */
  populateFromStory : function(aStoryDTO, aEventType) {
    this._logger.debug("populateFromStory");

    if (null == aStoryDTO) {
      throw "StoryDTO object is null";
    }

    this.type = aEventType;
    this.id = aStoryDTO.storyId;
    this.href = aStoryDTO.href;
    this.link = aStoryDTO.link;

    if (GlaxDigg.Digg.EventDTO.EVENT_TYPE_STORY == aEventType) {
      this.date = aStoryDTO.promoteDate;
    } else {
      this.date = aStoryDTO.submitDate;
    }

    this.title = aStoryDTO.title;
    this.description = aStoryDTO.description;
    this.media = aStoryDTO.media;

    if (null != aStoryDTO.topic) {
      this.topic = aStoryDTO.topic.name;
    }
    if (null != aStoryDTO.thumbnail) {
      this.imageURL = aStoryDTO.thumbnail.src;
    }

    this.user = aStoryDTO.user.userName;
    this.diggs = aStoryDTO.diggs;
    this.comments = aStoryDTO.comments;

    if (GlaxDigg.Util.UtilityService.isArray(aStoryDTO.friends)) {
      let storyFriends = aStoryDTO.friends;
      let friendArray = new Array();

      for (let i = 0; i < storyFriends.length; i++) {
        friendArray.push(storyFriends[i].userName);

        // XXX: if the event is a friend digg, set the oldest digg date as
        // this event's date.
        if (GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_DIGG == aEventType) {
          this.date = storyFriends[i].eventDate;
        }
      }

      this.friends = friendArray.toString();
    }
  },

  /**
   * Populates the event object with the information from a story comment.
   * @param aStoryDTO The story to which the comment belongs.
   * @param aCommentDTO The comment used to populate this event.
   * @throws Exception if either aStoryDTO or aCommentDTO are invalid.
   */
  populateFromStoryComment : function(aStoryDTO, aCommentDTO) {
    this._logger.debug("populateFromStory");

    if (null == aStoryDTO) {
      throw "StoryDTO object is null";
    }
    if (null == aCommentDTO) {
      throw "CommentDTO object is null";
    }

    this.type = GlaxDigg.Digg.EventDTO.EVENT_TYPE_FRIEND_COMMENT;
    this.id = aCommentDTO.commentId;
    this.href = aStoryDTO.href +
      "?t=" + aCommentDTO.threadRootId + "#c" + aCommentDTO.commentId;
    this.link = aStoryDTO.link;
    this.date = aCommentDTO.date;
    this.title = aStoryDTO.title;
    this.description = aCommentDTO.content;
    this.media = aStoryDTO.media;

    if (null != aStoryDTO.topic) {
      this.topic = aStoryDTO.topic.name;
    }
    if (null != aStoryDTO.thumbnail) {
      this.imageURL = aStoryDTO.thumbnail.src;
    }

    this.user = aStoryDTO.user.userName;
    this.diggs = aStoryDTO.diggs;
    this.comments = aStoryDTO.comments;
    this.friends = aCommentDTO.userName;
  },

  /**
   * Gets the wrapped inner object.
   * XXX: this is a workaround so that we can pass this object through an
   * observer without having to explicitly declare an interface for it. See:
   * http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg01505.html
   */
  get wrappedJSObject() { return this; }
};
