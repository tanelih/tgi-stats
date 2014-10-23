'use strict';

var BigInteger = require('big-integer');

/**
 * What is the meaning of this magic number.
 */
var STEAMID_THRESHOLD = BigInteger('76561197960265728');

/**
 * Convert the given 'SteamID' to a 'AccountID'.
 */
module.exports.to32Bit = function(id64Bit) {
	var id = BigInteger(id64Bit);

	if(id.greater(STEAMID_THRESHOLD)) {
		return id.minus(STEAMID_THRESHOLD).toString();
	}
	return id.toString();
}

/**
 * Convert the given 'AccountID' to a 'SteamID'.
 */
module.exports.to64Bit = function(id32Bit) {
	var id = BigInteger(id32Bit);

	if(id.lesser(STEAMID_THRESHOLD)) {
		return id.plus(STEAMID_THRESHOLD).toString();
	}
	return id.toString();
}
