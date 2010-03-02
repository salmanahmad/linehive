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
Cu.import("resource://digg/common/gsDiggDBService.js");
Cu.import("resource://digg/dto/gsDiggEventDTO.js");

// Maximum number of events to store
const MAX_EVENTS = 50;

// Query constants
const QUERY_CREATE_EVENT =
  "INSERT INTO DIGGEVENT ("+
  "id, type, href, link, date, title, description, topic, media, " +
  "imageURL, diggs, comments, user, friends) " +
  "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)";
const QUERY_UPDATE_EVENT =
  "UPDATE DIGGEVENT SET type = ?2, href = ?3, link = ?4, date = ?5, " +
  "title = ?6, description = ?7, topic = ?8, media = ?9, imageURL = ?10, " +
  "diggs = ?11, comments = ?12, user = ?13, friends = ?14 WHERE id = ?1";
const QUERY_DELETE_EVENT =
  "DELETE FROM DIGGEVENT WHERE id = ?1 AND type = ?2";
const QUERY_DELETE_OLDEST_EVENT =
  "DELETE FROM DIGGEVENT WHERE id in (SELECT id FROM DIGGEVENT " +
  "ORDER BY date ASC LIMIT 1 OFFSET 0)";
const QUERY_SELECT_EVENT =
  "SELECT * FROM DIGGEVENT WHERE id = ?1 AND type = ?2";
const QUERY_SELECT_EVENT_AT_INDEX =
  "SELECT * FROM DIGGEVENT ORDER BY date DESC LIMIT 1 OFFSET ?1";
const QUERY_SELECT_EVENT_COUNT =
  "SELECT COUNT(*) AS eventCount FROM DIGGEVENT";
const QUERY_CLEAR_EVENTS =
  "DELETE FROM DIGGEVENT";

// Constants for _bindParameters columns
const PARAM_INDEX_ID          = 0;
const PARAM_INDEX_TYPE        = 1;
const PARAM_INDEX_HREF        = 2;
const PARAM_INDEX_LINK        = 3;
const PARAM_INDEX_DATE        = 4;
const PARAM_INDEX_TITLE       = 5;
const PARAM_INDEX_DESCRIPTION = 6;
const PARAM_INDEX_TOPIC       = 7;
const PARAM_INDEX_MEDIA       = 8;
const PARAM_INDEX_IMAGEURL    = 9;
const PARAM_INDEX_DIGGS       = 10;
const PARAM_INDEX_COMMENTS    = 11;
const PARAM_INDEX_USER        = 12;
const PARAM_INDEX_FRIENDS     = 13;

/**
 * Manages events stored in the database.
 */
GlaxDigg.Digg.EventDAO = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initializes the component.
   */
  init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.EventDAO");
    this._logger.debug("init");
  },

  /**
   * Inserts an event in the database.
   * @param aEvent The event object to be inserted.
   * @return True if the event was inserted, false if it already existed.
   * @throws Exception if the event is invalid.
   */
  insertEvent : function(aEvent) {
    this._logger.debug("insertEvent");

    if (!this._isValidEvent(aEvent)) {
      throw "Invalid event object";
    }

    let inserted = false;

    if (!this._existEvent(aEvent)) {
      let query =
        GlaxDigg.Digg.DBService.connection.createStatement(QUERY_CREATE_EVENT);

      query = this._bindParameters(aEvent, query);
      GlaxDigg.Digg.DBService.connection.executeNonQuery(query);

      this._deleteOldestEventIfLimitReached();
      inserted = this._existEvent(aEvent);
    }

    return inserted;
  },

  /**
   * Updates an event in the database.
   * @param aEvent The event object to be inserted.
   * @throws Exception if the event is invalid.
   */
  updateEvent : function(aEvent) {
    this._logger.debug("updateEvent");

    if (!this._isValidEvent(aEvent)) {
      throw "Invalid event object";
    }

    let query =
      GlaxDigg.Digg.DBService.connection.createStatement(QUERY_UPDATE_EVENT);

    query = this._bindParameters(aEvent, query);
    GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
  },

  /**
   * Deletes the oldest event if the storage limit (preference) has been
   * reached.
   */
  _deleteOldestEventIfLimitReached : function() {
    this._logger.debug("insertPreference");

    let count = this.getEventCount();
    let query;

    while (MAX_EVENTS < count) {
      query =
        GlaxDigg.Digg.DBService.connection.createStatement(
          QUERY_DELETE_OLDEST_EVENT);
      GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
      count--;
    }
  },

  /**
   * Deletes an event from the database.
   * @param aEvent The event to be deleted.
   * @throws Exception if aEvent is invalid.
   */
  deleteEvent : function(aEvent) {
    this._logger.debug("deleteEvent");

    if (!this._isValidEvent(aEvent)) {
      throw "Invalid event object";
    }

    let query =
      GlaxDigg.Digg.DBService.connection.createStatement(QUERY_DELETE_EVENT);

    query.bindUTF8StringParameter(0, aEvent.id);
    query.bindInt32Parameter(1, aEvent.type);
    GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
  },

  /**
   * Obtains the event object at the given index.
   * @param aIndex The index of the event to obtain.
   * @return The event at the given index. Null if no event is found.
   */
  getEventAtIndex : function(aIndex) {
    this._logger.debug("getEventAtIndex");

    let event = null;
    let resultSet;
    let resultRow;
    let query =
      GlaxDigg.Digg.DBService.connection.createStatement(
        QUERY_SELECT_EVENT_AT_INDEX);

    query.bindUTF8StringParameter(0, aIndex);
    resultSet = GlaxDigg.Digg.DBService.connection.executeQuery(query);

    if (resultSet.hasMoreElements()) {
      resultRow = resultSet.getNext();
      event = this._populateEvent(resultRow);
    }

    return event;
  },

  /**
   * Obtains the current number of events stored in the database.
   * @return The number of events.
   */
  getEventCount : function() {
    this._logger.debug("getEventCount");

    let count = 0;
    let resultSet;
    let resultRow;
    let query =
      GlaxDigg.Digg.DBService.connection.createStatement(
        QUERY_SELECT_EVENT_COUNT);

    resultSet = GlaxDigg.Digg.DBService.connection.executeQuery(query);

    if (resultSet.hasMoreElements()) {
      resultRow = resultSet.getNext();
      count = parseInt(resultRow.getValueForColumnName("eventCount"));
    }

    return count;
  },

  /**
   * Truncates the event table from the database.
   */
  clearEvents : function() {
    this._logger.debug("clearEvents");

    let query =
      GlaxDigg.Digg.DBService.connection.createStatement(QUERY_CLEAR_EVENTS);

    GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
  },

  /**
   * Determines whether an event exists in the database.
   * @param aEvent The event to look for.
   * @return True if the event exists, false otherwise.
   */
  _existEvent : function(aEvent) {
    this._logger.trace("_existEvent");

    let resultSet = null;
    let query =
      GlaxDigg.Digg.DBService.connection.createStatement(QUERY_SELECT_EVENT);

    query.bindUTF8StringParameter(0, aEvent.id);
    query.bindInt32Parameter(1, aEvent.type);
    resultSet = GlaxDigg.Digg.DBService.connection.executeQuery(query);

    return resultSet.hasMoreElements();
  },

  /**
   * Populates an event from a property bag.
   * @param aPropertyBag The property bag with the information.
   * @return The populated event object.
   */
  _populateEvent : function(aRow) {
    this._logger.trace("_populateEvent");

    let event = new GlaxDigg.Digg.EventDTO();

    event.id = aRow.getValueForColumnName("id");
    event.type = aRow.getValueForColumnName("type");
    event.href = aRow.getValueForColumnName("href");
    event.link = aRow.getValueForColumnName("link");
    event.date = aRow.getValueForColumnName("date");
    event.title = aRow.getValueForColumnName("title");
    event.description = aRow.getValueForColumnName("description");
    event.topic = aRow.getValueForColumnName("topic");
    event.media = aRow.getValueForColumnName("media");
    event.imageURL = aRow.getValueForColumnName("imageURL");
    event.diggs = aRow.getValueForColumnName("diggs");
    event.comments = aRow.getValueForColumnName("comments");
    event.user = aRow.getValueForColumnName("user");
    event.friends = aRow.getValueForColumnName("friends");

    return event;
  },

  /**
   * Binds the parameters to a prepared statement.
   * @param aEvent The event object from which to extract the values.
   * @param aStatement The query statement.
   * @return aStatement with the bound parameters.
   */
  _bindParameters : function(aEvent, aStatement) {
    this._logger.trace("_bindParameters");

    aStatement.bindUTF8StringParameter(PARAM_INDEX_ID, aEvent.id);
    aStatement.bindInt32Parameter(PARAM_INDEX_TYPE, aEvent.type);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_HREF, aEvent.href);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_LINK, aEvent.link);
    aStatement.bindInt32Parameter(PARAM_INDEX_DATE, aEvent.date);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_TITLE, aEvent.title);
    aStatement.
      bindUTF8StringParameter(PARAM_INDEX_DESCRIPTION, aEvent.description);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_TOPIC, aEvent.topic);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_MEDIA, aEvent.media);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_IMAGEURL, aEvent.imageURL);
    aStatement.bindInt32Parameter(PARAM_INDEX_DIGGS, aEvent.diggs);
    aStatement.bindInt32Parameter(PARAM_INDEX_COMMENTS, aEvent.comments);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_USER, aEvent.user);
    aStatement.bindUTF8StringParameter(PARAM_INDEX_FRIENDS, aEvent.friends);

    return aStatement;
  },

  /**
   * Determines whether the given event object is valid.
   * @param aEvent The event object to be validated.
   * @return True if valid, false if invalid.
   */
  _isValidEvent : function(aEvent) {
    this._logger.trace("_isValidEvent");

    let isValid = false;

    if ((aEvent instanceof GlaxDigg.Digg.EventDTO) &&
        (!GlaxDigg.Util.UtilityService.isNullOrEmpty(aEvent.id))) {
      isValid = true;
    }

    return isValid;
  }
};

/**
 * Constructor.
 */
(function() {
  this.init();
}).apply(GlaxDigg.Digg.EventDAO);
