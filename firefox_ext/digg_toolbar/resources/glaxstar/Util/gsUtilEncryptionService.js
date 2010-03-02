/**
 * Copyright (c) 2008-2009 Glaxstar Ltd. All rights reserved.
 */

var EXPORTED_SYMBOLS = [];

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://glaxdigg/gsCommon.js");
Cu.import("resource://glaxdigg/Util/gsUtilCommon.js");
Cu.import("resource://glaxdigg/Util/gsUtilBase64Encoder.js");

// Regular expression used for escaping controls characters.
const RE_ESCAPE_REPLACE = /[\0\v\f\xa0+!]/g;
// Regular expression used for unescaping controls characters.
const RE_UNESCAPE_REPLACE = /!\d\d?\d?!/g;
// Pre-computed multiplicative inverse in GF(2^8).
const SBOX =
  [ 0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
    0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
    0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
    0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
    0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
    0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
    0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
    0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
    0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
    0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
    0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
    0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
    0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
    0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
    0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
    0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
    0xb0, 0x54, 0xbb, 0x16 ];
// Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)].
const RCON =
  [ [ 0x00, 0x00, 0x00, 0x00 ], [ 0x01, 0x00, 0x00, 0x00 ],
    [ 0x02, 0x00, 0x00, 0x00 ], [ 0x04, 0x00, 0x00, 0x00 ],
    [ 0x08, 0x00, 0x00, 0x00 ], [ 0x10, 0x00, 0x00, 0x00 ],
    [ 0x20, 0x00, 0x00, 0x00 ], [ 0x40, 0x00, 0x00, 0x00 ],
    [ 0x80, 0x00, 0x00, 0x00 ], [ 0x1b, 0x00, 0x00, 0x00 ],
    [ 0x36, 0x00, 0x00, 0x00 ] ];
// Hexadecimal character mapping.
const HEX_CHARS = "0123456789abcdef";
/* MD5 bits per input character. 8 - ASCII; 16 - Unicode */
const MD5_BITS_PER_CHAR = 8;

/**
 * Encryption service. It handles encryption and decryption of strings.
 * Taken from:
 * FIRE ENCRYPTER BUILD 2.9 / 3.0
 * By Ronald van den Heetkamp
 * www.jungsonnstudios.com
 */
GlaxDigg.Util.EncryptionService = {
  /* Logger for this object. */
  _logger : null,

  /**
   * Initialize the component.
   */
  _init : function() {
    this._logger = GlaxDigg.getLogger("GlaxDigg.Util.EncryptionService");
    this._logger.trace("_init");
  },

  /**
   * Encrypts a string of data using the 128 bit AES encryption algorithm.
   * Note: This method is based on code inside Fire Encrypter:
   * https://addons.mozilla.org/en-US/firefox/addon/3208
   * @author Ronald van den Heetkamp
   * @author jorge@glaxstar.com (minor modifications)
   * @param aData the data to encrypt.
   * @param aKey the key used to encrypt the data.
   * @return the given data encrypted with the 128 bit AES algorithm, using the
   * given key.
   * @throws Exception if any of the arguments is invalid.
   */
  encryptAES128 : function(aData, aKey) {
    this._logger.debug("encryptAES128");

    let pwBytes = new Array(16);
    let pwKeySchedule =
      this._keyExpansion([ 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ]);
    let counterBlock = new Array(16);
    let ctrTxt = "";
    let blockCount;
    let aEncryptedData;
    let nonce;
    let key;
    let keySchedule;
    let cipherCntr;
    let blockLength;
    let ct;
    let dataByte;
    let cipherByte;
    let byteArray;
    let result;

    if (null == aData) {
      this._logger.error("encryptAES128. Invalid (null) string to encrypt.");
      throw "Invalid (null) string to encrypt.";
    } else if ((null == aKey) || ("" == aKey)) {
      this._logger.error(
        "encryptAES128. Invalid (null or empty) encryption key.");
      throw "Invalid (null or empty) encryption key.";
    }

    blockCount = Math.ceil(aData.length / 16);
    aEncryptedData = new Array(blockCount);

    for (let i = 0; i < 16; i++) {
      pwBytes[i] = aKey.charCodeAt(i);
    }

    key = this._cipher(pwBytes, pwBytes, pwKeySchedule);
    // initialise counter block (NIST SP800-38A §B.2).
    nonce = (new Date()).getTime();

    for (let i = 0; i < 8; i++) {
      counterBlock[i] = (nonce >>> i*8) & 0xff;
    }
    // generate key schedule - an expansion of the key into distinct Key Rounds
    // for each round.
    keySchedule = this._keyExpansion(key);

    for (let b = 0; b < blockCount; b++) {
      for (let c = 0; c < 8; c++) {
        // set counter in counter block.
        counterBlock[15 - c] = (b >>> c * 8) & 0xff;
      }
      // encrypt counter block.
      cipherCntr = this._cipher(counterBlock, key, keySchedule);
      // calculate length of final block:
      blockLength = ((b < blockCount - 1) ? 16 : (aData.length - 1) % 16 + 1);
      ct = "";
      // xor aData with ciphered counter byte-by-byte.
      for (let i = 0; i < blockLength; i++) {
        dataByte = aData.charCodeAt(b * 16 + i);
        cipherByte = dataByte ^ cipherCntr[i];

        ct += String.fromCharCode(cipherByte);
      }
      // escape troublesome characters in aEncryptedData.
      aEncryptedData[b] = this._escCtrlChars(ct);
    }

    for (let i = 0; i < 4; i++) {
      ctrTxt += String.fromCharCode(counterBlock[i]);
    }

    ctrTxt = this._escCtrlChars(ctrTxt);
    result =
      GlaxDigg.Util.Base64Encoder.encodeString(
        ctrTxt + "+" + aEncryptedData.join("+"));

    return result;
  },

  /**
   * Decrypts a string of data using the 128 bit AES encryption algorithm.
   * Note: This method is based on code inside Fire Encrypter:
   * https://addons.mozilla.org/en-US/firefox/addon/3208
   * @author Ronald van den Heetkamp.
   * @author jorge@glaxstar.com (minor modifications)
   * @param aEncryptedData the data to decrypt.
   * @param aKey the key used to decrypt the data.
   * @return the decrypted data with the 128 bit AES algorithm, using the given
   * key.
   * @throws Exception if any of the arguments is invalid.
   */
  decryptAES128 : function(aEncryptedData, aKey) {
    this._logger.debug("decryptAES128");

    let pwBytes = new Array(16);
    let counterBlock = new Array(16);
    let pwKeySchedule =
      this._keyExpansion([ 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1 ]);
    let key;
    let keySchedule;
    let ctrTxt;
    let plaintext;
    let cipherCntr;
    let pt;
    let encryptedDataByte;
    let plaintextByte;

    if (null == aEncryptedData) {
      this._logger.error("decryptAES128. Invalid (null) string to encrypt.");
      throw "Invalid (null) string to encrypt.";
    } else if ((null == aKey) || ("" == aKey)) {
      this._logger.error(
        "decryptAES128: Invalid (null or empty) encryption key.");
      throw "Invalid (null or empty) encryption key.";
    }

    for (let i = 0; i < 16; i++) {
      pwBytes[i] = aKey.charCodeAt(i);
    }

    key = this._cipher(pwBytes, pwBytes, pwKeySchedule);
    keySchedule = this._keyExpansion(key);
    // split aEncryptedData into array of block-length strings.
    aEncryptedData =
      GlaxDigg.Util.Base64Encoder.decodeString(aEncryptedData).split('+');
    // recover nonce from 1st element of aEncryptedData.
    ctrTxt = this._unescCtrlChars(aEncryptedData[0]);

    for (let i = 0; i < 8; i++) {
      counterBlock[i] = ctrTxt.charCodeAt(i % 4);
    }

    plaintext = new Array(aEncryptedData.length - 1);

    for (let b = 1; b < aEncryptedData.length; b++) {
      for (let c = 0; c < 8; c++) {
        // set counter in counter block.
        counterBlock[15 - c] = ((b - 1) >>> c * 8) & 0xff;
      }
      // encrypt counter block.
      cipherCntr = this._cipher(counterBlock, key, keySchedule);
      aEncryptedData[b] = this._unescCtrlChars(aEncryptedData[b]);
      pt = '';

      for (let i = 0; i < aEncryptedData[b].length; i++) {
        encryptedDataByte = aEncryptedData[b].charCodeAt(i);
        plaintextByte = encryptedDataByte ^ cipherCntr[i];
        pt += String.fromCharCode(plaintextByte);
      }

      plaintext[b] = pt;
    }

    return unescape(plaintext.join(''));
  },

  /**
   * Performs a one way hash on a string of data using the 512 bit SHA
   * algorithm.
   * @param aData the data to hash.
   * @return the given data hashed with the 512 bit SHA algorithm.
   * @throws Exception if the data string is null.
   */
  hashSHA512 : function(aData) {
    this._logger.debug("hashSHA512");

    let hash = null;

    if (null != aData) {
      hash = this._hashSHA(aData, Ci.nsICryptoHash.SHA512);

    } else {
      this._logger.error("hashSHA512. Invalid (null) data to hash.");
      throw "Invalid (null) data to hash.";
    }

    return hash;
  },

  /**
   * Adds some salt to the data passed as a parameter. The salt string is also
   * passed as a parameter.
   * @param aData the data to hash.
   * @param aSaltString the string to be used to salt the data.
   * @return the salted string.
   */
  addSalt : function(aData, aSaltString) {
    this._logger.debug("addSalt");

    let saltedData = aData;

    if (null != aSaltString) {
      saltedData += aSaltString;
    }

    return saltedData;
  },

  /**
   * Performs an MD5 hash over a string and returns the hexadecimal
   * representation of the hashed value.
   * @param aData The string to be hashed.
   * @return The hexadecimal representation of the hashed value.
   */
  hashMD5Hex : function(aData) {
    this._logger.debug("hashMD5Hex");

    let hashObject =
      Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
    let inputStream =
      Cc["@mozilla.org/io/string-input-stream;1"].
        createInstance(Ci.nsIStringInputStream);
    let resultHex;

    inputStream.setData(aData, -1);
    hashObject.init(Ci.nsICryptoHash.MD5);
    hashObject.updateFromStream(inputStream, -1);
    resultHex = this._convertToHex(hashObject.finish(false));

    return resultHex;
  },

  /** Performs an MD5 hash over a string and returns the hexadecimal
   * representation of the hashed value.
   * @param aData The string to be hashed.
   * @return The hexadecimal representation of the hashed value.
   */
  hashMD5HexString : function (aString) {
    this._logger.debug("hashMD5HexString");

    let converter =
      Cc["@mozilla.org/intl/scriptableunicodeconverter"]
	.createInstance(Ci.nsIScriptableUnicodeConverter);
    /* result is an out parameter,
       result.value will contain the array length */
    let result = {};
    let hash;

    // we use UTF-8 here, you can choose other encodings.
    converter.charset = "UTF-8";

    // data is an array of bytes
    let data = converter.convertToByteArray(aString, result);
    let ch =
      Cc["@mozilla.org/security/hash;1"]
	.createInstance(Ci.nsICryptoHash);
    ch.init(ch.MD5);
    ch.update(data, data.length);
    hash = ch.finish(false);

    // returns the convertion of the binary hash data to a hex string
    return [this.toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
  },

  /**
   * returns the two-digit hexadecimal code for a byte
   */
  toHexString : function(charCode) {
    return ("0" + charCode.toString(16)).slice(-2);
  },

  /**
   * Converts a binary string to its hexadecimal representation.
   * @param aData the binary string.
   * @return hexadecimal representation of the bits in the string.
   */
  _convertToHex : function(aData) {
    this._logger.trace("_convertToHex");

    let bin = new Array();
    let mask = (1 << MD5_BITS_PER_CHAR) - 1;
    let hexString = "";

    /* convert the string to an array of little-endian words. */
    for (let i = 0; i < (aData.length * MD5_BITS_PER_CHAR);
         i += MD5_BITS_PER_CHAR) {
      bin[i >> 5] |=
      (aData.charCodeAt(i / MD5_BITS_PER_CHAR) & mask) << (i % 32);
    }

    /* convert the array to the hexadecimal representation. */
    for (let i = 0; i < (bin.length * 4); i++) {
      hexString +=
        HEX_CHARS.charAt((bin[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
        HEX_CHARS.charAt((bin[i >> 2] >> ((i % 4) * 8 )) & 0xF);
    }

    return hexString;
  },

  /**
   * Apply the AES cypher.
   * @param aInput the input to cypher.
   * @param aKey the key used to encrypt / decrypt.
   * @param aKeySchedule the key shedule to use for the cypher.
   * @return input string with the cypher applied to it.
   */
  _cipher : function(aInput, aKey, aKeySchedule) {
    this._logger.trace("_cipher");

    let Nk = aKey.length / 4; // key length (in words).
    let Nr = Nk + 6; // no of rounds.
    let Nb = 4; // block size: no of columns in state (fixed at 4 for AES).
    let state = [[],[],[],[]];
    let output;

    // initialise 4xNb byte-array 'state' with input.
    for (let i = 0; i < 4 * Nb; i++) {
      state[i % 4][Math.floor(i / 4)] = aInput[i];
    }

    state = this._addRoundKey(state, aKeySchedule, 0, Nb);

    for (let round = 1; round < Nr; round++) {
      state = this._subBytes(state, Nb);
      state = this._shiftRows(state, Nb);
      state = this._mixColumns(state, Nb);
      state = this._addRoundKey(state, aKeySchedule, round, Nb);
    }

    state = this._subBytes(state, Nb);
    state = this._shiftRows(state, Nb);
    state = this._addRoundKey(state, aKeySchedule, Nr, Nb);
    output = new Array(4*Nb); // convert to 1-d array before returning

    for (let i = 0; i< 4 * Nb; i++) {
      output[i] = state[i % 4][Math.floor(i / 4)];
    }

    return output;
  },

  /**
   * Apply sbox to state S [§5.1.1].
   * @param aState the state to transform.
   * @param aColumnCount the number of columns in the state.
   * @return the transformed state.
   */
  _subBytes : function(aState, aColumnCount) {
    this._logger.trace("_subBytes");

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < aColumnCount; c++) {
        aState[r][c] = SBOX[aState[r][c]];
      }
    }

    return aState;
  },

  /**
   * Shift row r of state S left by r bytes [§5.1.2].
   * @param aState the state to transform.
   * @param aColumnCount the number of columns in the state.
   * @return the transformed state.
   */
  _shiftRows : function(aState, aColumnCount) {
    this._logger.trace("_shiftRows");

    let t = new Array(4);
    // note that this will work for Nb=4,5,6, but not 7,8: see
    // fp.gladman.plus.com/cryptography_technology/rijndael/aes.spec.311.pdf
    for (let r = 1; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        t[c] = aState[r][(c + r) % aColumnCount]; // shift into temp copy.
      }

      for (let c = 0; c < 4; c++) {
        aState[r][c] = t[c]; // and copy back.
      }
    }

    return aState;
  },

  /**
   * Combine bytes of each col of state S [§5.1.3].
   * @param aState the state to transform.
   * @param aColumnCount the number of columns in the state.
   * @return the transformed state.
   */
  _mixColumns : function(aState, aColumnCount) {
    this._logger.trace("_mixColumns");

    let a;
    let b;

    for (let c = 0; c < 4; c++) {
      a = new Array(4);  // 'a' is a copy of the current column from 's'.
      b = new Array(4);  // 'b' is a{02} in GF(2^8).

      for (let i = 0; i < 4; i++) {
        a[i] = aState[i][c];
        b[i] =
          ((aState[i][c] & 0x80) ? (aState[i][c] << 1 ^ 0x011b) :
           (aState[i][c] << 1));
      }

      // a[n] ^ b[n] is a{03} in GF(2^8).
      aState[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
      aState[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 * 2*a1 + 3*a2 + a3
      aState[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + 2*a2 + 3*a3
      aState[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // 3*a0 + a1 + a2 + 2*a3
    }

    return aState;
  },

  /**
   * xor Round Key into state S [§5.1.4].
   * @param aState the state to transform.
   * @param aKeySchedule the key shedule to use for the cypher.
   * @param aRound the round number.
   * @param aColumnCount the number of columns in the state.
   * @return the transformed state.
   */
  _addRoundKey : function(aState, aKeySchedule, aRound, aColumnCount) {
    this._logger.trace("_addRoundKey");

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < aColumnCount; c++) {
        aState[r][c] ^= aKeySchedule[aRound * 4 + c][r];
      }
    }

    return aState;
  },

  /**
   * Generate Key Schedule (byte-array Nr+1 x Nb) from Key [§5.2].
   * @param aKey the key used to generate the schedule.
   * @return the key schedule generated with the key.
   */
  _keyExpansion : function(aKey) {
    this._logger.trace("_keyExpansion");

    let Nk = aKey.length / 4; // key length (in words).
    let Nr = Nk + 6; // no of rounds.
    let Nb = 4; // block size: no of columns in state (fixed at 4 for AES).
    let w = new Array(Nb * (Nr + 1));
    let temp = new Array(4);
    let r;

    for (let i = 0; i < Nk; i++) {
      r = [aKey[4 * i], aKey[4 * i + 1], aKey[4 * i + 2], aKey[4 * i + 3]];
      w[i] = r;
    }

    for (let i = Nk; i < (Nb * (Nr + 1)); i++) {
      w[i] = new Array(4);

      for (let t = 0; t < 4; t++) {
        temp[t] = w[i - 1][t];
      }

      if (i % Nk == 0) {
        temp = this._subWord(this._rotWord(temp));

        for (let t = 0; t < 4; t++) {
          temp[t] ^= RCON[i / Nk][t];
        }
      } else if (Nk > 6 && i % Nk == 4) {
        temp = this._subWord(temp);
      }

      for (let t = 0; t < 4; t++) {
        w[i][t] = w[i-Nk][t] ^ temp[t];
      }
    }

    return w;
  },

  /**
   * Apply sbox to 4-byte word w.
   * @param aWord the word to transform.
   * @return the transformed word.
   */
  _subWord : function(aWord) {
    this._logger.trace("_subWord");

    for (let i = 0; i < 4; i++) {
      aWord[i] = SBOX[aWord[i]];
    }

    return aWord;
  },

  /**
   * Rotate 4-byte word w left by one byte.
   * @param aWord the word to transform.
   * @return the transformed word.
   */
  _rotWord : function(aWord) {
    this._logger.trace("_rotWord");

    aWord[4] = aWord[0];

    for (let i = 0; i < 4; i++) {
      aWord[i] = aWord[i + 1];
    }

    return aWord;
  },

  /**
   * Performs a one way hash on a string of data using the SHA algorithm, with
   * the provided strength.
   * @param aData the data to hash.
   * @param aStrength the strength that the SHA hash will have. It can be any of
   * the constants in nsICryptoHash.
   * @return the given data hashed with the SHA algorithm and given strength.
   */
  _hashSHA : function(aData, aStrength) {
    this._logger.trace("_hashSHA");

    let hashEngine =
      Cc["@mozilla.org/security/hash;1"].createInstance(Ci.nsICryptoHash);
    let charCodes = new Array();
    let dataLength = aData.length;
    let binaryString;

    hashEngine.init(aStrength);

    for (let i = 0; i < dataLength; i++) {
      charCodes.push(aData.charCodeAt(i));
    }

    hashEngine.update(charCodes, dataLength);
    binaryString = hashEngine.finish(false);

    return this._getHexStringFromBinary(binaryString);
  },

  /**
   * Escape control chars which might cause problems handling ciphertext.
   * @param aString the string to escape.
   * @return the escaped string.
   */
  _escCtrlChars : function(aString) {
    this._logger.trace("_escCtrlChars");

    // \xa0 to cater for bug in Firefox; include '+' to leave it free for use as
    // a block marker.
    let escaped =
      aString.replace(
        RE_ESCAPE_REPLACE,
        function(c) { return('!' + c.charCodeAt(0) + '!'); });

    return escaped;
  },

  /**
   * Unescape potentially problematic control characters.
   * @param aString the string to unescape.
   * @return the unescaped string.
   */
  _unescCtrlChars : function(aString) {
    this._logger.trace("_unescCtrlChars");

    let unescaped =
      aString.replace(
        RE_UNESCAPE_REPLACE,
        function(c) { return String.fromCharCode(c.slice(1, -1)); });

    return unescaped;
  },

  /**
   * Converts a binary string into its hexadecimal representation.
   * @param aBinaryString the binary string to convert to hexadecimal.
   * @return the hexadecimal representation of the given binary string.
   */
  _getHexStringFromBinary : function(aBinaryString) {
    this._logger.trace("_getHexStringFromBinary");

    let hexrep = new Array(aBinaryString.length * 2);
    let stringLength = aBinaryString.length;

    for (let i = 0; i < stringLength; ++i) {
      hexrep[i * 2] = HEX_CHARS.charAt((aBinaryString.charCodeAt(i) >> 4) & 15);
      hexrep[i * 2 + 1] = HEX_CHARS.charAt(aBinaryString.charCodeAt(i) & 15);
    }

    return hexrep.join("");
  }
};

/**
 * Constructor.
 */
(function() {
  this._init();
}).apply(GlaxDigg.Util.EncryptionService);
