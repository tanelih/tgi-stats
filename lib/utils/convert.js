'use strict';

var BigInteger = require('big-integer');

/**
 * What is the meaning of this magic number.
 */
var STEAM_MAGIC = BigInteger('61197960265728');

/**
 * Convert the given 'SteamID' to a 'AccountID'.
 */
module.exports.to32Bit = function(id64Bit) {
	if(id64Bit.length == 17) {
		return BigInteger(id64Bit.substr(3)).minus(STEAM_MAGIC).toString()
	}
	return id64Bit;
}

/**
 * Convert the given 'AccountID' to a 'SteamID'.
 */
module.exports.to64Bit = function(id32Bit) {
	if(id32Bit.length == 17) {
		return id32Bit;
	}
	return '765' + BigInteger(id32Bit).plus(STEAM_MAGIC).toString();
}
