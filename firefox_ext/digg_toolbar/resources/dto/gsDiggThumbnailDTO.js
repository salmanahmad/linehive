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
 * Thumbnail DTO
 * Stores thumbnails info.
 */
GlaxDigg.Digg.ThumbnailDTO = function() {
  this._init();
}

GlaxDigg.Digg.ThumbnailDTO.prototype = {
  /* Logger for this object. */
  _logger : null,

  /* Thumbnail original width */
  _originalWidth : null,
  /* Thumbnail original height */
  _originalHeight : null,
  /* Thumbnail content type */
  _contentType : null,
  /* Thumbnail src */
  _src : null,
  /* Thumbnail width */
  _width : null,
  /* Thumbnail height */
  _height : null,

  /**
   * Initialize the component
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.ThumbnailDTO");
    this._logger.debug("init");
  },

  /**
   * Returns the thumbnail original width.
   * @return thumbnail original width
   */
  get originalWidth() {
    this._logger.debug("originalWidth[get]");
    return this._originalWidth;
  },

  /**
   * Sets the thumbnail original width.
   * @param aValue thumbnail original width
   */
  set originalWidth(aValue) {
    this._logger.debug("originalWidth[set]");
    this._originalWidth = aValue;
  },

  /**
   * Returns the thumbnail original height.
   * @return thumbnail original height
   */
  get originalHeight() {
    this._logger.debug("originalHeight[get]");
    return this._originalHeight;
  },

  /**
   * Sets the thumbnail original height.
   * @param aValue thumbnail original height
   */
  set originalHeight(aValue) {
    this._logger.debug("originalHeight[set]");
    this._originalHeight = aValue;
  },

  /**
   * Returns the thumbnail content type.
   * @return thumbnail content type
   */
  get contentType() {
    this._logger.debug("contentType[get]");
    return this._contentType;
  },

  /**
   * Sets the thumbnail content type.
   * @param aValue thumbnail content type
   */
  set contentType(aValue) {
    this._logger.debug("contentType[set]");
    this._contentType = aValue;
  },

  /**
   * Returns the thumbnail src.
   * @return thumbnail src
   */
  get src() {
    this._logger.debug("src[get]");
    return this._src;
  },

  /**
   * Sets the thumbnail src.
   * @param aValue thumbnail src
   */
  set src(aValue) {
    this._logger.debug("src[set]");
    this._src = aValue;
  },

  /**
   * Returns the thumbnail width.
   * @return thumbnail width
   */
  get width() {
    this._logger.debug("width[get]");
    return this._width;
  },

  /**
   * Sets the thumbnail width.
   * @param aValue thumbnail width
   */
  set width(aValue) {
    this._logger.debug("width[set]");
    this._width = aValue;
  },

  /**
   * Returns the thumbnail height.
   * @return thumbnail height
   */
  get height() {
    this._logger.debug("height[get]");
    return this._height;
  },

  /**
   * Sets the thumbnail height.
   * @param aValue thumbnail height
   */
  set height(aValue) {
    this._logger.debug("height[set]");
    this._height = aValue;
  },

  /**
   * Populates the DTO from a JSON object.
   * @param aJSON the JSON object.
   */
  populateFromJSON : function(aJSON) {
    this._logger.debug("populateFromJSON");

    if (null != aJSON) {
      this.originalWidth = aJSON["originalwidth"];
      this.originalHeight = aJSON["originalheight"];
      this.contentType = aJSON["contentType"];
      this.src = aJSON["src"];
      this.width = aJSON["width"];
      this.height = aJSON["height"];
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
