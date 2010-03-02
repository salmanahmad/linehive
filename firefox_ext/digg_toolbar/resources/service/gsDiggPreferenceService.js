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
Cu.import("resource://digg/dao/gsDiggPreferenceDAO.js");

/**
 * The Preference Service.
 */
GlaxDigg.Digg.PreferenceService = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initializes the resource.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.PreferenceService");
    this._logger.trace("_init");
  },

  /**
   * Stores a preference object in the database, either by inserting it or
   * updating its value.
   * @param aName the name of the preference.
   * @param aValue the value of the preference to be stored.
   */
  setPreference : function(aName, aValue) {
    this._logger.debug("setPreference");

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aName)) {
      this._logger.error("Invalid preference name.");
      throw "Invalid preference name.";
    }

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aValue)) {
      GlaxDigg.Digg.PreferenceDAO.deletePreference(aName);
    } else {
      let preference = GlaxDigg.Digg.PreferenceDAO.selectPreference(aName);

      if (null != preference) {
        preference.value = aValue;

        GlaxDigg.Digg.PreferenceDAO.updatePreference(preference);
      } else {
        preference = new GlaxDigg.Digg.PreferenceDTO(aName, aValue);

        GlaxDigg.Digg.PreferenceDAO.insertPreference(preference);
      }
    }
  },

  /**
   * Obtains a string preference value by its preference key from the database.
   * @param aName the name of the preference
   * @return the string preference value if found, null otherwise.
   */
  getPreference : function(aName) {
    this._logger.debug("getPreference");

    let preference = GlaxDigg.Digg.PreferenceDAO.selectPreference(aName);
    let preferenceValue = null;

    if (null != preference) {
      preferenceValue = preference.value;
    }

    return preferenceValue;
  },

  /**
   * Deletes a preference by its preference key from the database.
   * @param aName the name of the preference.
   */
  deletePreference : function(aName) {
    this._logger.debug("deletePreference");

    GlaxDigg.Digg.PreferenceDAO.deletePreference(aName);
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.PreferenceService);
