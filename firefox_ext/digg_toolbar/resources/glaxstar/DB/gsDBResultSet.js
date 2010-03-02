/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/DB/gsDBCommon.js");

/**
 * Represents the result set from a DB query.
 */
GlaxDigg.DB.ResultSet = function(aStatement) {
  this._init(aStatement);
}

GlaxDigg.DB.ResultSet.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* The statement object. */
  _statement : null,
  /* Indicates if the set is already pointing at the next result. */
  _hasNext : false,

  /**
   * Initializes the object.
   * @param aStatement the statement used to initialize this object.
   */
  _init : function(aStatement) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.DB.ResultSet");
    this._logger.trace("_init");

    this._statement = aStatement;
  },

  /**
   * Indicates if there are more rows in the result set.
   * @return true if there are more rows in the result set, false otherwise.
   */
  hasMoreElements : function() {
    this._logger.debug("hasMoreElements");

    let hasMore = true;

    if (!this._hasNext) {
      hasMore = this._statement.executeStep();
      this._hasNext = hasMore;

      if (!hasMore) {
        this._statement.reset();
      }
    }

    return hasMore;
  },

  /**
   * Obtains the next result (row) in the result set.
   * @return GlaxDigg.DB.Result with the resulting row, null if there are no more
   * results available.
   */
  getNext : function() {
    this._logger.debug("getNext");

    let result = null;

    if (this.hasMoreElements()) {
      result = new GlaxDigg.DB.Result(this._statement);
      this._hasNext = false;
    }

    return result;
  }
};

/**
 * Represents a result (row) from a DB query.
 */
GlaxDigg.DB.Result = function(aStatement) {
  this._init(aStatement);
}

GlaxDigg.DB.Result.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* The statement object. */
  _statement : null,

  /**
   * Initializes the object.
   * @param aStatement the statement used to initialize this object.
   */
  _init : function(aStatement) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.DB.Result");
    this._logger.trace("_init");

    this._statement = aStatement;
  },

  /**
   * Gets the value for the column with the given name.
   * @param the column name to get the value from.
   * @return the value in the given column.
   */
  getValueForColumnName : function(aColumnName) {
    this._logger.debug("getValueForColumnName");

    return this.getValueForIndex(this._statement.getColumnIndex(aColumnName));
  },

  /**
   * Gets the value for the column with the given index.
   * @param the column index to get the value from.
   * @return the value in the given column.
   */
  getValueForIndex : function(aIndex) {
    this._logger.debug("getValueForIndex");

    let result = null;

    switch (this._statement.getTypeOfIndex(aIndex)) {
      case Ci.mozIStorageValueArray.VALUE_TYPE_NULL:
        result = null;
        break;
      case Ci.mozIStorageValueArray.VALUE_TYPE_INTEGER:
        result = this._statement.getInt64(aIndex);
        break;
      case Ci.mozIStorageValueArray.VALUE_TYPE_FLOAT:
        result = this._statement.getDouble(aIndex);
        break;
      case Ci.mozIStorageValueArray.VALUE_TYPE_TEXT:
        result = this._statement.getUTF8String(aIndex);
        break;
      case Ci.mozIStorageValueArray.VALUE_TYPE_BLOB:
        result = this._statement.getBlob(aIndex);
        break;
    }

    return result;
  }
};
