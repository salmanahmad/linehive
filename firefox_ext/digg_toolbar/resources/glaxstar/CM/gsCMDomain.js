/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMCommon.js");

// Hostname regular expression.
const RE_HOSTNAME =
  new RegExp(
    "^(?:[a-z0-9](?:[a-z0-9\\-]{0,61}[a-z0-9])?\\.)*[a-z0-9]" +
    "(?:[a-z0-9\\-]{0,61}[a-z0-9])?(?:\\:[0-9]{1,7})?" +
    "(?:[a-z\\/\\?\\=])*$", "i");

/**
 * Represents a domain in an API specification.
 */
GlaxDigg.CM.Domain = function(aHostname) {
  this._init(aHostname);
}

GlaxDigg.CM.Domain.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* Hostname. */
  _hostname : null,

  /**
   * Initialize the object.
   * @param aHostname the hostname to set on the domain.
   * @throws Exception is the hostname is invalid.
   */
  _init : function(aHostname) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.Domain");
    this._logger.trace("_init");

    if ((null == aHostname) || !RE_HOSTNAME.test(aHostname)) {
      this._logger.error("_init. Invalid hostname: " + aHostname);
      throw "The hostname provided is invalid.";
    }

    this._hostname = aHostname;
  },

  /**
   * Returns the hostname in the domain.
   * @return the hostname in the domain.
   */
  get hostname() {
    this._logger.debug("get hostname");

    return this._hostname;
  }
};
