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
Cu.import("resource://digg/common/gsDiggDBService.js");
Cu.import("resource://digg/dto/gsDiggPreferenceDTO.js");

// SQL statements.
const INSERT_PREFERENCE =
  "INSERT INTO preferences (name, value) VALUES (?1, ?2)";
const UPDATE_PREFERENCE =
  "UPDATE preferences SET value = ?2 WHERE name = ?1";
const DELETE_PREFERENCE = "DELETE FROM preferences WHERE name = ?1";
const SELECT_PREFERENCE_BY_NAME =
  "SELECT name, value FROM preferences WHERE name = ?1";

/**
 * The Preference DAO.
 */
GlaxDigg.Digg.PreferenceDAO = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initializes the resource.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.PreferenceDAO");
    this._logger.trace("_init");
  },

  /**
   * Inserts a new preference to the table.
   * @param aPreference PreferenceDTO with preference data.
   */
  insertPreference : function(aPreference) {
    this._logger.debug("insertPreference");

    try {
      if ((null == aPreference) ||
          !(aPreference instanceof GlaxDigg.Digg.PreferenceDTO) ||
          GlaxDigg.Util.UtilityService.isNullOrEmpty(aPreference.name)) {
        throw "Invalid preference DTO.";
      }

      let query =
        GlaxDigg.Digg.DBService.connection.createStatement(INSERT_PREFERENCE);

      query.bindUTF8StringParameter(0, aPreference.name);
      query.bindUTF8StringParameter(1, aPreference.value);

      GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
    } catch (e) {
      this._logger.error("insertPreference. Operation failed:\n" + e);
      throw e;
    }
  },

  /**
   * Updates the preference in the table.
   * @param aPreference PreferenceDTO with preference data.
   */
  updatePreference : function(aPreference) {
    this._logger.debug("updatePreference");

    try {
      if ((null == aPreference) ||
          !(aPreference instanceof GlaxDigg.Digg.PreferenceDTO) ||
          GlaxDigg.Util.UtilityService.isNullOrEmpty(aPreference.name)) {
        throw "Invalid preference DTO.";
      }

      let query =
        GlaxDigg.Digg.DBService.connection.createStatement(UPDATE_PREFERENCE);

      query.bindUTF8StringParameter(0, aPreference.name);
      query.bindUTF8StringParameter(1, aPreference.value);

      GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
    } catch (e) {
      this._logger.error("updatePreference. Operation failed:\n" + e);
      throw e;
    }
  },

  /**
   * Deletes the preference from the table.
   * @param aName the name of the preference to delete.
   */
  deletePreference : function(aName) {
    this._logger.debug("deletePreference");

    try {
      if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aName)) {
        throw "Invalid preference name.";
      }

      let query =
        GlaxDigg.Digg.DBService.connection.createStatement(DELETE_PREFERENCE);

      query.bindUTF8StringParameter(0, aName);

      GlaxDigg.Digg.DBService.connection.executeNonQuery(query);
    } catch (e) {
      this._logger.error("deletePreference. Operation failed:\n" + e);
      throw e;
    }
  },

  /**
   * Gets the preference for a given name.
   * @param aName the preference name.
   * @return a preferenceDTO.
   */
  selectPreference : function(aName) {
    this._logger.debug("selectPreference");

    let preference = null;

    try {
      if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aName)) {
        throw "Invalid preference name.";
      }

      let query =
        GlaxDigg.Digg.DBService.connection.createStatement(
          SELECT_PREFERENCE_BY_NAME);
      let resultSet;

      query.bindUTF8StringParameter(0, aName);

      resultSet = GlaxDigg.Digg.DBService.connection.executeQuery(query);

      if (resultSet.hasMoreElements()) {
        preference = this._populatePreferenceDTO(resultSet.getNext());
      }
    } catch (e) {
      this._logger.error("selectPreference. Operation failed:\n" + e);
      throw e;
    }

    return preference;
  },

  /**
   * Populates a PreferenceDTO from a Result.
   * @param aRow Result object representing the row.
   * @return a populated PreferenceDTO.
   */
  _populatePreferenceDTO : function(aRow) {
    this._logger.trace("_populatePreferenceDTO");

    let preference = new GlaxDigg.Digg.PreferenceDTO(
      aRow.getValueForColumnName("name"),
      aRow.getValueForColumnName("value"));

    return preference;
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.PreferenceDAO);
