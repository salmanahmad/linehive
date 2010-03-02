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
Cu.import("resource://glaxdigg/Util/gsUtilEncryptionService.js");
Cu.import("resource://digg/common/gsDiggCommon.js");
Cu.import("resource://digg/common/gsDiggAPIService.js");
Cu.import("resource://digg/dto/gsDiggStoryDTO.js");

/**
 * Story service.
 */
GlaxDigg.Digg.StoryService = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initializes the component.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Digg.StoryService");
    this._logger.trace("_init");
  },

  /**
   * Gets a story object from a result from the API. If more than one story is
   * contained in the result, the one with the highest Digg count is chosen.
   * @param aResult The API result element.
   * @return The story DTO, NULL if none found.
   */
  _getStoryDTOFromResult : function(aResult) {
    this._logger.trace("_getStoryDTOFromResult");

    let storyArray = aResult["stories"];
    let storyDTO = null;
    let bestStoryDTO = null;

    for (let i = storyArray.length - 1; 0 <= i; i--) {
      storyDTO = new GlaxDigg.Digg.StoryDTO();
      storyDTO.populateFromJSON(storyArray[i]);

      if (null == bestStoryDTO || bestStoryDTO.diggs < storyDTO.diggs) {
        bestStoryDTO = storyDTO;
      }
    }

    return bestStoryDTO;
  },

  /**
   * Gets a story object from its link URL using the API.
   * @param aURL The URL used to obtain the story.
   * @param aLoadHandler the callback method.
   */
  getStoryByURL : function(aURL, aLoadHandler) {
    this._logger.debug("getStoryByURL");

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aURL)) {
      throw "Url is null or empty";
    }

    let that = this;
    let params = {
      "link_hash" : GlaxDigg.Util.EncryptionService.hashMD5Hex(aURL)
    };

    GlaxDigg.Digg.APIService.readAPI.getAllStories(
      params,
      function(aResult) {
        that._getStoryByURLLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._getStoryByURLLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the getStoryByURL method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _getStoryByURLLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_getStoryByURLLoadHandler");

    try {
      if (!aResult["error"] && aResult["stories"]) {
        let storyDTO = this._getStoryDTOFromResult(aResult);

        if (null != storyDTO) {
          aLoadHandler(storyDTO);
        } else {
          aLoadHandler(null);
        }
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_getStoryByURLLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_getStoryByURLLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Gets a story object from its link title using the API.
   * @param aTitle The title used to obtain the story.
   * @param aLoadHandler the callback method.
   */
  getStoryByTitle : function(aTitle, aLoadHandler) {
    this._logger.debug("getStoryByTitle");

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aTitle)) {
      throw "Url is null or empty";
    }

    let that = this;
    let params = {
      "clean_title" : aTitle
    };

    GlaxDigg.Digg.APIService.readAPI.getStory(
      params,
      function(aResult) {
        that._getStoryByTitleLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._getStoryByTitleLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the getStoryByTitle method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _getStoryByTitleLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_getStoryByTitleLoadHandler");

    try {
      if (!aResult["error"] && aResult["stories"]) {
        let storyDTO = this._getStoryDTOFromResult(aResult);

        if (null != storyDTO) {
          aLoadHandler(storyDTO);
        } else {
          aLoadHandler(null);
        }
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_getStoryByTitleLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_getStoryByTitleLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Gets a story object from its short url using the API.
   * @param aShortURL The short url used to obtain the story.
   * @param aLoadHandler the callback method.
   */
  getStoryByShortURL : function(aShortURL, aLoadHandler) {
    this._logger.debug("getStoryByShortURL");

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aShortURL)) {
      throw "Short url is null or empty";
    }

    let that = this;
    let params = {
      "short_url" : aShortURL
    };

    GlaxDigg.Digg.APIService.readAPI.getStory(
      params,
      function(aResult) {
        that._getStoryByShortURLLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._getStoryByShortURLLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the getStoryByShortURL method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _getStoryByShortURLLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_getStoryByShortURLLoadHandler");

    try {
      if (!aResult["error"] && aResult["stories"]) {
        let storyDTO = this._getStoryDTOFromResult(aResult);

        if (null != storyDTO) {
          aLoadHandler(storyDTO);
        } else {
          aLoadHandler(null);
        }
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_getStoryByShortURLLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_getStoryByShortURLLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Gets the short url of an url.
   * @param aURL the url.
   * @param aLoadHandler the callback method.
   */
  getShortURL : function(aURL, aLoadHandler) {
    this._logger.debug("getShortURL");

    let that = this;
    let params = {
      url : encodeURI(aURL)
    };

    GlaxDigg.Digg.APIService.readAPI.createShortUrl(
      params,
      function(aResult) {
        that._getShortURLLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._getShortURLLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the createShortUrl method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _getShortURLLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_getShortURLLoadHandler");

    try {
      if (!aResult["error"] && aResult["shorturls"]) {
        let shortUrlsArray = aResult["shorturls"];
        let shortUrl = null;

        if (0 < shortUrlsArray.length) {
          shortUrl = shortUrlsArray[0]["short_url"];
        }

        aLoadHandler(shortUrl, null);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_getShortURLLoadHandler: Error received: " + aResult["message"]);
        }
        aLoadHandler(null, null);
      }
    } catch (e) {
      this._logger.error("_getShortURLLoadHandler:\n" + e);
      aLoadHandler(null, null);
    }
  },

  /**
   * Gets a random short url.
   * @param aLoadHandler the callback method.
   */
  getRandomShortURL : function(aLoadHandler) {
    this._logger.debug("getRandomShortURL");

    let that = this;

    GlaxDigg.Digg.APIService.readAPI.getRandomShortUrl(
      null,
      function(aResult) {
        that._getRandomShortURLLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._getRandomShortURLLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the getRandomShortUrl method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _getRandomShortURLLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_getRandomShortURLLoadHandler");

    try {
      if (!aResult["error"] && aResult["shorturl"]) {
        let shortUrl = aResult["shorturl"];

        aLoadHandler(shortUrl);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_getRandomShortURLLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_getRandomShortURLLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Gets the link from a short url.
   * @param aShortUrl the short url.
   * @param aLoadHandler the callback method.
   */
  getLinkFromShortURL : function(aShortUrl, aLoadHandler) {
    this._logger.debug("getLinkFromShortURL");

    let that = this;
    let params = {
      short_url : aShortUrl
    };

    GlaxDigg.Digg.APIService.readAPI.getShortUrl(
      params,
      function(aResult) {
        that._getLinkFromShortURLLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._getLinkFromShortURLLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the getShortURL method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _getLinkFromShortURLLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_getLinkFromShortURLLoadHandler");

    try {
      if (!aResult["error"] && aResult["shorturls"]) {
        let shortUrlsArray = aResult["shorturls"];
        let link = null;

        if (0 < shortUrlsArray.length) {
          link = shortUrlsArray[0]["link"];
        }

        aLoadHandler(link);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_getLinkFromShortURLLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_getLinkFromShortURLLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Lists the related stories by keywords, source or diggs .
   * @param aStoryId the story id.
   * @param aRelatedBy the related by value: keywords, source or diggs.
   * @param aLoadHandler the callback method.
   */
  listRelatedStories : function(aStoryId, aRelatedBy, aLoadHandler) {
     this._logger.debug("listRelatedStories");

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aStoryId)) {
      throw "Story id is null or empty";
    }

    let that = this;
    let params = {
      "story_id" : aStoryId,
      "related_by" : aRelatedBy
    };

    GlaxDigg.Digg.APIService.readAPI.getRelatedStories(
      params,
      function(aResult) {
        that._listRelatedStoriesLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._listRelatedStoriesLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the listRelatedStoriesByKeyword method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _listRelatedStoriesLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_listRelatedStoriesLoadHandler");

    try {
      if (aResult && !aResult["error"] && aResult["stories"]) {
        let storiesArray = aResult["stories"];
        let stories = new Array();
        let storyDTO = null;

        for (let i = 0; i < storiesArray.length; i++) {
          storyDTO = new GlaxDigg.Digg.StoryDTO();
          storyDTO.populateFromJSON(storiesArray[i]);

          stories.push(storyDTO);
        }

        aLoadHandler(stories);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_listRelatedStoriesLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_listRelatedStoriesLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  },

  /**
   * Lists the stories dugg them by the given user.
   * @param aUsername the username.
   * @param aLoadHandler the callback method.
   */
  listUserDuggStories : function(aUsername, aLoadHandler) {
     this._logger.debug("listUserDuggStories");

    if (GlaxDigg.Util.UtilityService.isNullOrEmpty(aUsername)) {
      throw "Username is null or empty";
    }

    let that = this;
    let params = {
      "username" : aUsername
    };

    GlaxDigg.Digg.APIService.readAPI.getUserDugg(
      params,
      function(aResult) {
        that._listUserDuggStoriestLoadHandler(aResult, aLoadHandler);
      },
      function(aError) {
        that._listUserDuggStoriestLoadHandler(aError, aLoadHandler);
      });
  },

  /**
   * Handles the response from the listUserDuggStories method.
   * @param aResult the result returned by the server.
   * @param aLoadHandler the callback method.
   */
  _listUserDuggStoriestLoadHandler : function(aResult, aLoadHandler) {
    this._logger.trace("_listUserDuggStoriestLoadHandler");

    try {
      if (aResult && !aResult["error"] && aResult["stories"]) {
        let storiesArray = aResult["stories"];
        let stories = new Array();
        let storyDTO = null;

        for (let i = 0; i < storiesArray.length; i++) {
          storyDTO = new GlaxDigg.Digg.StoryDTO();
          storyDTO.populateFromJSON(storiesArray[i]);

          stories.push(storyDTO);
        }

        aLoadHandler(stories);
      } else {
        if (aResult["message"]) {
          this._logger.warn(
            "_listUserDuggStoriestLoadHandler: Error received: " +
            aResult["message"]);
        }
        aLoadHandler(null);
      }
    } catch (e) {
      this._logger.error("_listUserDuggStoriestLoadHandler:\n" + e);
      aLoadHandler(null);
    }
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Digg.StoryService);
