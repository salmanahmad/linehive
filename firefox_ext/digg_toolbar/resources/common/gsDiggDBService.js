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
Cu.import("resource://glaxdigg/DB/gsDBConnection.js");
Cu.import("resource://glaxdigg/Util/gsUtilUtilityService.js");
Cu.import("resource://digg/common/gsDiggCommon.js");

// Database file name
const DB_FILE_NAME = "digg.sqlite";
const DB_TEMPLATE_FILE_NAME = "digg.template.sqlite";
// Remember to modify the sqlite template file and add a new record to the
// scheme_migrations table when you change this value.
const SCHEME_VERSION = 1;

/**
 * The DB Service. It holds the connection to the database file.
 */
GlaxDigg.Digg.DBService = {
  /* Logger */
  _logger : null,
  /* Connection */
  _connection : null,
  /* Database file */
  _dbFile : null,

  /**
   * Returns the database connection.
   * @returns GlaxDigg.DB.Connection object holding the DB connection.
   */
  get connection() {
    return this._connection;
  },

  /**
   * Initialize the service.
   */
  _init : function() {
    // get a Logger specifically for this object
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.DBService");
    this._logger.trace("init");

    this._initializeDatabase();
  },

  /**
   * Sets up the database file if it doesn't exist and opens the connection.
   */
  _initializeDatabase : function() {
    this._logger.trace("_initializeDatabase");

    let dbSchemeVersion;

    this._dbFile = GlaxDigg.Digg.getExtensionDirectory();
    this._dbFile.append(DB_FILE_NAME);

    // check if the file already exists.
    if (!this._dbFile.exists()) {
      // if not, copy the template file.
      let defaultFile =
        GlaxDigg.Util.UtilityService.getDefaultsFolder(
          GlaxDigg.Digg.EXTENSION_ID);

      defaultFile.append(DB_TEMPLATE_FILE_NAME);
      defaultFile.copyTo(this._dbFile.parent, this._dbFile.leafName);
    }

    this._connection = new GlaxDigg.DB.Connection(this._dbFile);

    dbSchemeVersion = this._getDBSchemeVersion();
    if (dbSchemeVersion < SCHEME_VERSION) {
      this._migrateDatabase(dbSchemeVersion);
    }
  },

  /**
   * Gets the scheme version from the database.
   * @return version the scheme version.
   */
  _getDBSchemeVersion : function() {
    this._logger.trace("_getDBSchemeVersion");

    let version = 0;
    let query = null;

    try {
      let sql =
        "SELECT version FROM scheme_migrations ORDER BY version DESC LIMIT 1;"
      let query = this._connection.createStatement(sql);
      let resultSet = this._connection.executeQuery(query);

      if (resultSet.hasMoreElements()) {
        version = (resultSet.getNext()).getValueForColumnName("version");
      }
    } catch (e) {
      // XXX: ignore error, since the scheme_migrations table needs to be added.
    } finally {
      if (null != query) {
        query.finalize();
      }
    }

    return version;
  },

  /**
   * Migrates database.
   * @param aCurrentVersion the current scheme version in the database.
   */
  _migrateDatabase : function(aCurrentVersion) {
    this._logger.trace("_migrateDatabase");

    let sql = null;
    let query = null;

    // update to version 1 scheme.
    if (aCurrentVersion < 1) {
      // create table preferences.
      sql = "CREATE TABLE preferences (name TEXT, value TEXT);";
      query = this._connection.createStatement(sql);
      this._connection.executeNonQuery(query);
      // create table scheme_migrations.
      sql = "CREATE TABLE scheme_migrations (version INTEGER PRIMARY KEY);";
      query = this._connection.createStatement(sql);
      this._connection.executeNonQuery(query);
      // update table scheme_migrations.
      sql = "INSERT INTO scheme_migrations (version) VALUES (1);";
      query = this._connection.createStatement(sql);
      this._connection.executeNonQuery(query);
    }
  }
};

/**
 * Constructor
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.DBService);
