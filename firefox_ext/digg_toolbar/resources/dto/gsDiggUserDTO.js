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
 * User DTO
 * Stores users info.
 */
GlaxDigg.Digg.UserDTO = function() {
  this._init();
}

GlaxDigg.Digg.UserDTO.prototype = {
  /* Logger for this object. */
  _logger : null,

  /* User name */
  _userName : null,
  /* User icon */
  _icon : null,
  /* Registration date */
  _registered : null,
  /* User profile views */
  _profileViews : null,
  /* Date of the event (digg, comment) related with this user */
  _eventDate : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.UserDTO");
    this._logger.debug("init");
  },

  /**
   * Returns the user name.
   * @return user name
   */
  get userName() {
    this._logger.debug("userName[get]");
    return this._userName;
  },

  /**
   * Sets the user name.
   * @param aValue user name
   */
  set userName(aValue) {
    this._logger.debug("userName[set]");
    this._userName = aValue;
  },

  /**
   * Returns the user icon.
   * @return user icon
   */
  get icon() {
    this._logger.debug("icon[get]");
    return this._icon;
  },

  /**
   * Sets the user icon.
   * @param aValue user icon
   */
  set icon(aValue) {
    this._logger.debug("icon[set]");
    this._icon = aValue;
  },

  /**
   * Returns the user registered.
   * @return user registered
   */
  get registered() {
    this._logger.debug("registered[get]");
    return this._registered;
  },

  /**
   * Sets the user registered.
   * @param aValue user registered
   */
  set registered(aValue) {
    this._logger.debug("registered[set]");
    this._registered = aValue;
  },

  /**
   * Returns the user profile views.
   * @return user profile views
   */
  get profileViews() {
    this._logger.debug("profileViews[get]");
    return this._profileViews;
  },

  /**
   * Sets the user profile views.
   * @param aValue user profile views
   */
  set profileViews(aValue) {
    this._logger.debug("profileViews[set]");
    this._profileViews = aValue;
  },

  /**
   * Returns the event (digg, comment) date related with this user.
   * @return The event date.
   */
  get eventDate() {
    this._logger.debug("eventDate[get]");
    return this._eventDate;
  },

  /**
   * Sets the event (digg, comment) date related with this user.
   * @return The event date.
   */
  set eventDate(aValue) {
    this._logger.debug("eventDate[set]");
    this._eventDate = aValue;
  },

  /**
   * Populates the DTO from a JSON object.
   * @param aJSON the JSON object.
   */
  populateFromJSON : function(aJSON) {
    this._logger.debug("populateFromJSON");

    if (null != aJSON) {
      this.userName = aJSON["name"];
      this.icon = aJSON["icon"];
      this.registered = aJSON["registered"];
      this.profileViews = aJSON["profileviews"];
      this.eventDate = aJSON["date"];
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
