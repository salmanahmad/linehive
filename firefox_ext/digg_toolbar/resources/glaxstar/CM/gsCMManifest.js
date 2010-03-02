/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMCommon.js");
Cu.import("resource://glaxdigg/CM/gsCMDomain.js");
Cu.import("resource://glaxdigg/CM/gsCMError.js");
Cu.import("resource://glaxdigg/CM/gsCMMethod.js");
Cu.import("resource://glaxdigg/CM/gsCMFixedParameter.js");
Cu.import("resource://glaxdigg/Util/gsUtilUtilityService.js");

/**
 * Represents the specification for an API, with its methods and possible
 * calling domains.
 */
GlaxDigg.CM.Manifest = function(aJSONObj) {
  this._init(aJSONObj);
}

GlaxDigg.CM.Manifest.prototype = {
  /* Logger for this object. */
  _logger : null,
  /* The result of the manifest generation. true if the manifest was obtained
     and generated successfully, false otherwise. */
  _result : false,
  /* The domains contained in this manifest. */
  _domains : null,
  /* The methods contained in this manifest. */
  _methods : null,
  /* The fixed parameters contained in the manifest. */
  _fixedParameters : null,
  /* The errors that were returned with this manifest. */
  _errors : null,

  /**
   * Initializes the manifest.
   * @param aJSONObj the JSON object that holds the manifest information.
   * @throws Exception if the JSON object is an invalid or incomplete manifest.
   */
  _init : function(aJSONObj) {
    this._logger = GlaxDigg.getLogger("GlaxDigg.CM.Manifest");
    this._logger.trace("_init");

    if (null != aJSONObj) {
      try {
        // initialize domain array.
        this._domains = new Array();

        if (aJSONObj["domains"]) {
          let domains = aJSONObj["domains"];

          if (GlaxDigg.Util.UtilityService.isArray(domains)) {
            let domainCount = domains.length;
            let domain;

            for (let i = 0; i < domainCount; i++) {
              domain = new GlaxDigg.CM.Domain(domains[i]["hostname"]);
              this._domains.push(domain);
            }
          } else {
            throw "Invalid JSON object.";
          }
        }

        // initialize method array.
        this._methods = new Array();

        if (aJSONObj["methods"]) {
          let methods = aJSONObj["methods"];

          if (GlaxDigg.Util.UtilityService.isArray(methods)) {
            let methodCount = methods.length;
            let method;

            for (let i = 0; i < methodCount; i++) {
              method =
                new GlaxDigg.CM.Method(
                  methods[i]["mnemonic"], methods[i]["entry_point"],
                  (methods[i]["protocol"] ? methods[i]["protocol"] : "http://"),
                  (methods[i]["method"] ? methods[i]["method"] : null),
                  methods[i]["file_upload"], (methods[i]["entry_method"] ?
                    methods[i]["entry_method"] : null));
              this._methods.push(method);
            }
          } else {
            throw "Invalid JSON object.";
          }
        }

        // initialize fixed parameters array.
        this._fixedParameters = new Array();

        if (aJSONObj["fixed_parameters"]) {
          let params = aJSONObj["fixed_parameters"];

          if (GlaxDigg.Util.UtilityService.isArray(params)) {
            let paramCount = params.length;
            let param;

            for (let i = 0; i < paramCount; i++) {
              param =
                new GlaxDigg.CM.FixedParameter(
                  params[i]["name"], params[i]["value"]);
              this._fixedParameters.push(param);
            }
          } else {
            throw "Invalid JSON object.";
          }
        }

        // initialize error array.
        this._errors = new Array();

        if (aJSONObj["errors"]) {
          let errors = aJSONObj["errors"];

          if (GlaxDigg.Util.UtilityService.isArray(errors)) {
            let errorCount = errors.length;
            let error;

            for (let i = 0; i < errorCount; i++) {
              error =
                new GlaxDigg.CM.Error(
                  errors[i]["error_code"],
                  (errors[i]["error_msg"] ? errors[i]["error_msg"] : null),
                  (errors[i]["for_parameter"] ? errors[i]["for_parameter"] :
                   null));
              this._errors.push(error);
            }
          } else {
            throw "Invalid JSON object.";
          }
        }
      } catch (e) {
        this._logger.error("_init. Invalid JSON object.\n" + e);
        throw "Invalid JSON object.";
      }

      // verify we have a good result and no errors.
      if ((0 < this._domains.length) && (0 < this._methods.length) &&
          (0 == this._errors.length)) {
        this._result = true;
      }
    } else {
      this._logger.error("_init. Null JSON object.");
      throw "Null JSON object.";
    }
  },

  /**
   * Obtains the domain list.
   * @return the domain list.
   */
  get domains() {
    this._logger.debug("get domains");

    return this._domains;
  },

  /**
   * Obtains the method list.
   * @return the method list.
   */
  get methods() {
    this._logger.debug("get methods");

    return this._methods;
  },

  /**
   * Obtains the fixed parameter list.
   * @return the fixed parameter list.
   */
  get fixedParameters() {
    this._logger.debug("get fixedParameters");

    return this._fixedParameters;
  },

  /**
   * Obtains the error list.
   * @return the error list.
   */
  get errors() {
    this._logger.debug("get errors");

    return this._errors;
  },

  /**
   * Returns the result of the manifest generation. true if the manifest was
   * obtained and generated successfully, false otherwise.
   * @return true if the manifest was obtained and generated successfully, false
   * otherwise.
   */
  get result() {
    this._logger.debug("get result");

    return this._result;
  }
};
