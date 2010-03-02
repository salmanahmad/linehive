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

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/dto/gsDiggUserDTO.js");
Cu.import("resource://digg/dto/gsDiggThumbnailDTO.js");
Cu.import("resource://digg/dto/gsDiggTopicDTO.js");
Cu.import("resource://digg/dto/gsDiggContainerDTO.js");

/**
 * Story DTO.
 * Stores stories info.
 */
GlaxDigg.Digg.StoryDTO = function() {
  this._init();
}

GlaxDigg.Digg.StoryDTO.prototype = {
  /* Logger for this object. */
  _logger : null,

  /* Story id */
  _storyId : null,
  /* Story link */
  _link : null,
  /* Story submit date */
  _submitDate : null,
  /* Story promote date */
  _promoteDate : null,
  /* Story title */
  _title : null,
  /* Story description */
  _description : null,
  /* Story status */
  _status : null,
  /* Story href */
  _href : null,
  /* Story diggs (count) */
  _diggs : null,
  /* Story comments (count) */
  _comments : null,
  /* Story views (count) */
  _views : null,
  /* Short url */
  _shortUrl : null,
  /* Story user */
  _user: null,
  /* Story media */
  _media: null,
  /* Story topic */
  _topic: null,
  /* Story container */
  _container : null,
  /* Story thumbnail */
  _thumbnail : null,
  /* Friends related with this story */
  _friends : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.StoryDTO");
    this._logger.debug("init");
  },

  /**
   * Returns the story id.
   * @return story id.
   */
  get storyId() {
    this._logger.debug("storyId[get]");
    return this._storyId;
  },

  /**
   * Sets the story id.
   * @param aValue story id
   */
  set storyId(aValue) {
    this._logger.debug("storyId[set]");
    this._storyId = aValue;
  },

  /**
   * Returns the story link.
   * @return story link.
   */
  get link() {
    this._logger.debug("link[get]");
    return this._link;
  },

  /**
   * Sets the story link.
   * @param aValue story link
   */
  set link(aValue) {
    this._logger.debug("link[set]");
    this._link = aValue;
  },

  /**
   * Returns the story submit date.
   * @return The story submit date.
   */
  get submitDate() {
    this._logger.debug("submitDate[get]");
    return this._submitDate;
  },

  /**
   * Sets the story submit date.
   * @param aValue The new story submit date.
   */
  set submitDate(aValue) {
    this._logger.debug("submitDate[set]");
    this._submitDate = aValue;
  },

  /**
   * Returns the story promote date.
   * @return The story promote date.
   */
  get promoteDate() {
    this._logger.debug("promoteDate[get]");
    return this._promoteDate;
  },

  /**
   * Sets the story promote date.
   * @param aValue The new story promote date.
   */
  set promoteDate(aValue) {
    this._logger.debug("promoteDate[set]");
    this._promoteDate = aValue;
  },

  /**
   * Returns the story title.
   * @return story title.
   */
  get title() {
    this._logger.debug("title[get]");
    return this._title;
  },

  /**
   * Sets the story title.
   * @param aValue story title
   */
  set title(aValue) {
    this._logger.debug("title[set]");
    this._title = aValue;
  },

  /**
   * Returns the story description.
   * @return story description.
   */
  get description() {
    this._logger.debug("description[get]");
    return this._description;
  },

  /**
   * Sets the story description.
   * @param aValue story description
   */
  set description(aValue) {
    this._logger.debug("description[set]");
    this._description = aValue;
  },

  /**
   * Returns the story status.
   * @return story status.
   */
  get status() {
    this._logger.debug("status[get]");
    return this._status;
  },

  /**
   * Sets the story status.
   * @param aValue story status
   */
  set status(aValue) {
    this._logger.debug("status[set]");
    this._status = aValue;
  },

  /**
   * Returns the story href.
   * @return story href.
   */
  get href() {
    this._logger.debug("href[get]");
    return this._href;
  },

  /**
   * Sets the story href.
   * @param aValue story href
   */
  set href(aValue) {
    this._logger.debug("href[set]");
    this._href = aValue;
  },

  /**
   * Returns the story diggs.
   * @return story diggs.
   */
  get diggs() {
    this._logger.debug("diggs[get]");
    return this._diggs;
  },

  /**
   * Sets the story diggs.
   * @param aValue story diggs
   */
  set diggs(aValue) {
    this._logger.debug("diggs[set]");
    this._diggs = aValue;
  },

  /**
   * Returns the story comments.
   * @return story comments.
   */
  get comments() {
    this._logger.debug("comments[get]");
    return this._comments;
  },

  /**
   * Sets the story comments.
   * @param aValue story comments
   */
  set comments(aValue) {
    this._logger.debug("comments[set]");
    this._comments = aValue;
  },

  /**
   * Returns the story views.
   * @return story views.
   */
  get views() {
    this._logger.debug("views[get]");
    return this._views;
  },

  /**
   * Sets the story views.
   * @param aValue story views.
   */
  set views(aValue) {
    this._logger.debug("views[set]");
    this._views = aValue;
  },

  /**
   * Returns the short url.
   * @return short url.
   */
  get shortUrl() {
    this._logger.debug("shortUrl[get]");
    return this._shortUrl;
  },

  /**
   * Sets the short url.
   * @param aValue short url.
   */
  set shortUrl(aValue) {
    this._logger.debug("shortUrl[set]");
    this._shortUrl = aValue;
  },

  /**
   * Returns the story user.
   * @return story user.
   */
  get user() {
    this._logger.debug("user[get]");
    return this._user;
  },

  /**
   * Sets the story user.
   * @param aValue story user
   */
  set user(aValue) {
    this._logger.debug("user[set]");
    this._user = aValue;
  },

  /**
   * Returns the story media.
   * @return story media.
   */
  get media() {
    this._logger.debug("media[get]");
    return this._media;
  },

  /**
   * Sets the story media.
   * @param aValue story media
   */
  set media(aValue) {
    this._logger.debug("media[set]");
    this._media = aValue;
  },

  /**
   * Returns the story topic.
   * @return story topic.
   */
  get topic() {
    this._logger.debug("topic[get]");
    return this._topic;
  },

  /**
   * Sets the story topic.
   * @param aValue story topic
   */
  set topic(aValue) {
    this._logger.debug("topic[set]");
    this._topic = aValue;
  },

  /**
   * Returns the story container.
   * @return story container.
   */
  get container() {
    this._logger.debug("container[get]");
    return this._container;
  },

  /**
   * Sets the story container.
   * @param aValue story container
   */
  set container(aValue) {
    this._logger.debug("container[set]");
    this._container = aValue;
  },

  /**
   * Returns the story thumbnail.
   * @return story thumbnail.
   */
  get thumbnail() {
    this._logger.debug("thumbnail[get]");
    return this._thumbnail;
  },

  /**
   * Sets the story thumbnail.
   * @param aValue story thumbnail
   */
  set thumbnail(aValue) {
    this._logger.debug("thumbnail[set]");
    this._thumbnail = aValue;
  },

  /**
   * Returns the array of friends.
   * @return The array of friends related with this story.
   */
  get friends() {
    this._logger.debug("friends[get]");
    return this._friends;
  },

  /**
   * Sets the array of friends.
   * @param aValue The array of friends related with this story.
   */
  set friends(aValue) {
    this._logger.debug("friends[set]");
    this._friends = aValue;
  },

  /**
   * Populates the DTO from a JSON object.
   * @param aJSON the JSON object.
   */
  populateFromJSON : function(aJSON) {
    this._logger.debug("populateFromJSON");

    if (null != aJSON) {
      this.storyId = aJSON["id"];
      this.link = aJSON["link"];
      this.submitDate = aJSON["submit_date"];
      this.promoteDate = aJSON["promote_date"];
      this.title = aJSON["title"];
      this.description = aJSON["description"];
      this.status = aJSON["status"];
      this.href = aJSON["href"];
      this.diggs = aJSON["diggs"];
      this.comments = aJSON["comments"];
      this.media = aJSON["media"];
      // XXX: the short url and views can be inside an array or alone.
      if (null == aJSON["shorturl"]["view_count"]) {
        this.views = aJSON["shorturl"][0]["view_count"];
        this.shortUrl = aJSON["shorturl"][0]["short_url"];
      } else {
        this.views = aJSON["shorturl"]["view_count"];
        this.shortUrl = aJSON["shorturl"]["short_url"];
      }

      this.user = new GlaxDigg.Digg.UserDTO();
      this.user.populateFromJSON(aJSON["user"]);
      this.topic = new GlaxDigg.Digg.TopicDTO();
      this.topic.populateFromJSON(aJSON["topic"]);
      this.container = new GlaxDigg.Digg.ContainerDTO();
      this.container.populateFromJSON(aJSON["container"]);
      this.thumbnail = new GlaxDigg.Digg.ThumbnailDTO();
      this.thumbnail.populateFromJSON(aJSON["thumbnail"]);
      this.friends = this._populateFriends(aJSON["friends"]);
    }
  },

  /**
   * Populates friends from JSON object.
   * @param aJSON the JSON object.
   * @return the friends array.
   */
  _populateFriends : function(aJSON) {
    this._logger.trace("_populateFriends");

    let friendDTO = null;
    let friends = new Array();

    if (null != aJSON) {
      let friendsJSON = aJSON["users"];

      for (let i = 0; i < friendsJSON.length; i++) {
        friendDTO = new GlaxDigg.Digg.UserDTO();
        friendDTO.populateFromJSON(friendsJSON[i]);

        friends.push(friendDTO);
      }
    }

    return friends;
  },

  /**
   * Gets the wrapped inner object.
   * XXX: this is a workaround so that we can pass this object through an
   * observer without having to explicitly declare an interface for it. See:
   * http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg01505.html
   */
  get wrappedJSObject() { return this; }
};
