'use strict';

var purdy = require('purdy');

var request = require('../utils/request');
var convert = require('../utils/convert');

var SECOND = 1000;
var MINUTE = 60 * SECOND;

/**
 * TODO Refactor into an 'EventEmitter'.
 */
function PlayerSummaryWorker(steamIDs, opts) {
	steamIDs = Array.isArray(steamIDs) ? steamIDs : [ steamIDs ];
	steamIDs = steamIDs.map(function(id) {
		return convert.to64Bit(id);
	});

	opts          = opts || { }
	this.interval = opts.interval || 20 * MINUTE;

	this.params = {
		'steamids': steamIDs.join(',')
	}

	this.endpoint = '/ISteamUser/GetPlayerSummaries/V0002/';
}

/**
 *
 */
PlayerSummaryWorker.prototype.run = function() {

	/**
	 * The actual worker function, that does the heavy lifting.
	 */
	var worker = function() {
		request(this.endpoint, this.params).then(
			function(data) {
				// TODO Maybe we should extend an 'EventEmitter' and 'emit' the
				//      player each time we receive one, this would probably
				//      work best in case we need to switch to a child process
				//      model.
				var players = data.response.players;

				//return purdy(players);
			},
			console.error.bind(null, '[PlayerSummaryWorker]:'));
	}

	// Run the worker now, and every 'this.interval'.
	return worker.call(this) && setInterval(worker.bind(this), this.interval);
}

module.exports = PlayerSummaryWorker;
