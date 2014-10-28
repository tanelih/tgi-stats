'use strict';

var util    = require('util');
var events  = require('events');
var request = require('../utils/request');
var convert = require('../utils/convert');

var SECOND = 1000;
var MINUTE = 60 * SECOND;

/**
 * Fetches 'PlayerSummary' data for the given 'SteamIDs' from Steam API.
 */
function PlayerSummaryWorker(steamIDs) {
	events.EventEmitter.call(this);

	steamIDs = Array.isArray(steamIDs) ? steamIDs : [ steamIDs ];
	steamIDs = steamIDs.map(function(id) {
		return convert.to64Bit(id);
	});

	this.params = {
		'steamids': steamIDs.join(',')
	}

	this.endpoint = '/ISteamUser/GetPlayerSummaries/V0002/';
}

util.inherits(PlayerSummaryWorker, events.EventEmitter);

/**
 * Fetch 'PlayerSummary' data from the Steam API.
 *
 * TODO What if there are 'a lot' of players?
 */
PlayerSummaryWorker.prototype.run = function() {
	return request(this.endpoint, this.params).then(

		/**
		 * Emit each received 'player' using the inherited 'EventEmitter'.
		 */
		function onPlayerSummaries(data) {
			data.response.players.forEach(this.emit.bind(this, 'player'));
		}.bind(this),

		/**
		 * Log any errors.
		 *
		 * TODO How do we handle errors? Retry or something?
		 */
		console.error.bind(null, '[PlayerSummaryWorker]:'));
}

module.exports = PlayerSummaryWorker;
