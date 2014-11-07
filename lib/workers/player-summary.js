'use strict';

var mongoose = require('mongoose');
var request  = require('../utils/request');
var convert  = require('../utils/convert');
var time     = require('../utils/time-constants');

var Player = mongoose.model('player');

/**
 * Fetches 'PlayerSummary' data for the given 'SteamIDs' from Steam API.
 */
function PlayerSummaryWorker(steamIDs, opts) {
	opts = opts || { }

	steamIDs = Array.isArray(steamIDs) ? steamIDs : [ steamIDs ];
	steamIDs = steamIDs.map(function(id) {
		return convert.to64Bit(id);
	});

	this.params = {
		'steamids': steamIDs.join(',')
	}

	this.interval = opts.interval || 10 * time.MINUTE;
	this.endpoint = '/ISteamUser/GetPlayerSummaries/V0002/';
}

/**
 * Fetch 'PlayerSummary' data from the Steam API.
 *
 * TODO What if there are 'a lot' of players?
 */
PlayerSummaryWorker.prototype.run = function() {

	/**
	 * The actual worker function.
	 */
	var worker = function() {
		return request(this.endpoint, this.params).then(

			/**
			 * Parse the player data and 'upsert' them into database.
			 */
			function onPlayerSummaries(data) {
				data.response.players.forEach(function(player) {

					var data = {
						'_id':         convert.to32Bit(player.steamid),
						'avatarURL':   player.avatarfull,
						'displayName': player.personaname,
					}

					var opts = {
						'upsert': true,
					}

					var query = {
						'_id': data._id,
					}

					Player.update(query, data, opts, function(err) {
						if(err) return console.error(err);
					});
				});
			},

			/**
			 * Log errors.
			 *
			 * TODO How to actually 'handle' errors.
			 */
			console.error.bind(null, '[PlayerSummaryWorker]:'));
	}

	worker.call(this);
	return setInterval(worker.bind(this), this.interval);
}

module.exports = PlayerSummaryWorker;
