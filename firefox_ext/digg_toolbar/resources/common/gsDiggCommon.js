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

var EXPORTED_SYMBOLS = ["GlaxDigg"];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");

/**
 * GlaxDigg.Digg namespace.
 */
if ("undefined" == typeof(GlaxDigg.Digg)) {
  GlaxDigg.Digg = {
    /* Logger for this object. */
    _logger : null,

    // preference branch.
    get PREF_BRANCH() { return "extensions.digg."; },

    // the id of this extension.
    get EXTENSION_ID() { return "{671c8440-f787-11dc-95ff-0800200c9a66}"; },

    /**
     * Initialize this object.
     */
    _init : function() {
      this._logger = GlaxDigg.getLogger("GlaxDigg.Digg");
      this._logger.trace("_init");
    },

    /**
     * Gets a reference to the directory where the extension will keep its
     * files. The directory is created if it doesn't exist.
     * @return reference (nsIFile) to the extension directory.
     */
    getExtensionDirectory : function() {
      this._logger.debug("getExtensionDirectory");

      let profDir = GlaxDigg.getProfileDirectory();

      profDir.append("Digg");

      if (!profDir.exists() || !profDir.isDirectory()) {
        // read and write permissions to owner and group, read-only for others.
        profDir.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);
      }

      return profDir;
    }
  };

  /**
   * Constructor.
   */
  (function() {
    this._init();
  }).apply(GlaxDigg.Digg);
}
