/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/DB/gsDBCommon.js");
Cu.import("resource://glaxdigg/DB/gsDBResultSet.js");

// This statement is used to find out if a column exists in a table.
const SELECT_STATEMENT = "SELECT * FROM ";
const SELECT_STATEMENT_LIMIT = " LIMIT 1";

/**
 * Represents a connection to an SQLite file, with utility methods that
 * facilitate its access.
 */
GlaxDigg.DB.Connection = function(aFile) {
  this._init(aFile);
}

GlaxDigg.DB.Connection.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* SQLite storage service. */
  _storageService : null,
  /* Database connection. */
  _dbConnection : null,
  /* Database file. */
  _dbFile : null,

  /**
   * Initializes the component.
   * @param aFile the nsIFile that corresponds to the database to use.
   */
  _init : function(aFile) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.DB.Connection");
    this._logger.trace("_init");

    this._storageService =
      Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);

    if ((null != aFile) && (aFile instanceof Ci.nsIFile)) {
      this._dbFile = aFile.clone();
    } else {
      this._logger.error("_init. Invalid database file.");
      throw "Invalid database file";
    }
  },

  /**
   * Obtains a connection to the database, creating one if necessary.
   * @return the connection object.
   * @throws Exception of the database file does not exist.
   */
  _getDBConnection : function() {
    this._logger.trace("_getDBConnection");

    if ((null == this._dbConnection) || !this._dbConnection.connectionReady) {
      if (!this._dbFile.exists()) {
        this._logger.error(
          "_getDBConnection. The database file doesn't exist.");
        throw "The database file does not exist.";
      } else {
        this._dbConnection = this._storageService.openDatabase(this._dbFile);
      }
    }

    return this._dbConnection;
  },

  /**
   * Closes the database connection.
   */
  closeConnection : function() {
    this._logger.debug("closeConnection");

    try {
      this._dbConnection.close();
      delete this._dbConnection;
      this._dbConnection = null;
    } catch (e) {
      this._dbConnection = null;
      this._logger.error("_closeDBConnection: " + e);
    }
  },

  /**
   * Creates a query statement based on the given string.
   * @param aQueryString the query string.
   * @return the query statement.
   */
  createStatement : function(aQueryString) {
    this._logger.debug("createStatement");

    let connection = this._getDBConnection();

    return connection.createStatement(aQueryString);
  },

  /**
   * Executes a non query statement.
   * @param aStatement the statement to be executed.
   * @return the last inserted row id.
   */
  executeNonQuery : function(aStatement) {
    this._logger.debug("executeNonQuery");

    let connection = this._getDBConnection();

    aStatement.execute();

    return connection.lastInsertRowID;
  },

  /**
   * Executes a query statement.
   * @param aQueryStatement the query statement to be executed.
   * @return the resulting set from the query.
   */
  executeQuery : function(aQueryStatement) {
    this._logger.debug("executeQuery");

    return new GlaxDigg.DB.ResultSet(aQueryStatement);
  },

  /**
   * Checks if a column exists in the specified table.
   * @param aTable the table where to look for the column.
   * @param aColumn the column to look for in the table.
   * @return true if exists, false otherwise.
   */
  existsColumnInTable : function(aTable, aColumn) {
    this._logger.debug("existsColumnInTable");

    let exists = false;
    let queryStatement =
      this.createStatement(SELECT_STATEMENT + aTable + SELECT_STATEMENT_LIMIT);

    queryStatement.executeStep();

    for (let i = queryStatement.columnCount - 1; 0 <= i; i--) {
      if (queryStatement.getColumnName(i) == aColumn) {
        exists = true;
        break;
      }
    }

    queryStatement.reset();

    return exists;
  }
};
