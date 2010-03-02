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

/**
 * Comment DTO
 * Stores comments info.
 */
GlaxDigg.Digg.CommentDTO = function() {
  this._init();
}

GlaxDigg.Digg.CommentDTO.prototype = {
  /* Logger for this object. */
  _logger : null,

  /* Id of the comment */
  _commentId : null,
  /* Date in which the comment was made */
  _date : null,
  /* Id of the story the comment belongs to */
  _storyId : null,
  /* User name of the user who made the comment */
  _userName : null,
  /* Content of the comment */
  _content : null,
  /* Number of thumbs up */
  _up : null,
  /* Number of thumbs down */
  _down : null,
  /* Number of replies */
  _replies : null,
  /* Id of the comment thread root */
  _threadRootId : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.CommentDTO");
    this._logger.debug("init");
  },

  /**
   * Returns the comment id.
   * @return comment id.
   */
  get commentId() {
    this._logger.debug("commentId[get]");
    return this._commentId;
  },

  /**
   * Sets the comment id.
   * @param aValue comment id
   */
  set commentId(aValue) {
    this._logger.debug("commentId[set]");
    this._commentId = aValue;
  },

  /**
   * Returns the comment date.
   * @return comment date.
   */
  get date() {
    this._logger.debug("date[get]");
    return this._date;
  },

  /**
   * Sets the comment date.
   * @param aValue comment date
   */
  set date(aValue) {
    this._logger.debug("date[set]");
    this._date = aValue;
  },

  /**
   * Returns the comment story id.
   * @return comment story id.
   */
  get storyId() {
    this._logger.debug("storyId[get]");
    return this._storyId;
  },

  /**
   * Sets the comment story id.
   * @param aValue comment story id
   */
  set storyId(aValue) {
    this._logger.debug("storyId[set]");
    this._storyId = aValue;
  },

  /**
   * Returns the comment user name.
   * @return comment user name.
   */
  get userName() {
    this._logger.debug("userName[get]");
    return this._userName;
  },

  /**
   * Sets the comment user name.
   * @param aValue comment user name
   */
  set userName(aValue) {
    this._logger.debug("userName[set]");
    this._userName = aValue;
  },

  /**
   * Returns the content of the comment.
   * @return The content of the comment.
   */
  get content() {
    this._logger.debug("content[get]");
    return this._content;
  },

  /**
   * Sets the content of the comment.
   * @param aValue The new value for content.
   */
  set content(aValue) {
    this._logger.debug("content[set]");
    this._content = aValue;
  },

  /**
   * Returns the number of thumbs up of the comment.
   * @return The number of thumbs up.
   */
  get up() {
    this._logger.debug("up[get]");
    return this._up;
  },

  /**
   * Sets the number of thumbs up of the comment.
   * @param aValue The number of thumbs up.
   */
  set up(aValue) {
    this._logger.debug("up[set]");
    this._up = aValue;
  },

  /**
   * Returns the number of thumbs down of the comment.
   * @return The number of thumbs down.
   */
  get down() {
    this._logger.debug("down[get]");
    return this._down;
  },

  /**
   * Sets the number of thumbs down of the comment.
   * @param aValue The number of thumbs down.
   */
  set down(aValue) {
    this._logger.debug("down[set]");
    this._down = aValue;
  },

  /**
   * Returns the number of replies of the comment.
   * @return The number of replies.
   */
  get replies() {
    this._logger.debug("replies[get]");
    return this._replies;
  },

  /**
   * Sets the number of replies of the comment.
   * @param aValue The number of replies.
   */
  set replies(aValue) {
    this._logger.debug("replies[set]");
    this._replies = aValue;
  },

  /**
   * Returns the id of the comment thread root.
   * @return The thread root id.
   */
  get threadRootId() {
    this._logger.debug("threadRootId[get]");
    return this._threadRootId;
  },

  /**
   * Sets the id of the comment thread root.
   * @param aValue The id of the comment thread root.
   */
  set threadRootId(aValue) {
    this._logger.debug("threadRootId[set]");
    this._threadRootId = aValue;
  },

  /**
   * Populates the DTO from a JSON object.
   * @param aJSON the JSON object.
   */
  populateFromJSON : function(aJSON) {
    this._logger.debug("populateFromJSON");

    if (null != aJSON) {
      this.commentId = aJSON["id"];
      this.storyId = aJSON["story"];
      this.date = aJSON["date"];
      this.userName = aJSON["user"];
      this.content = aJSON["content"];
      this.up = aJSON["up"];
      this.down = aJSON["down"];
      this.replies = aJSON["replies"];
      this.threadRootId = aJSON["root"];
    }
  },

  /**
   * Gets the wrapped inner object.
   * XXX: this is a workaround so that we can pass this object through an
   * observer without having to explicitly declare an interface for it. See:
   * http://www.mail-archive.com/dev-tech-xpcom@lists.mozilla.org/msg01505.html
   */
  get wrappedJSObject() { return this; }
};
