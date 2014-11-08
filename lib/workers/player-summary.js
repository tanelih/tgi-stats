'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');
var request  = require('../utils/request');
var time     = require('../utils/time-constants');

var Player = mongoose.model('player');

/**
 * Fetches 'PlayerSummary' data for the given 'SteamIDs' from Steam API.
 */
function PlayerSummaryWorker(members, opts) {
	opts = opts || { }

	this.params = {
		'steamids': _.pluck(members, 'steam_id').join(',')
	}

	this.members  = members;
	this.interval = opts.interval || 10 * time.MINUTE;
	this.endpoint = '/ISteamUser/GetPlayerSummaries/V0002/';
}

/**
 * Fetch 'PlayerSummary' data from the Steam API.
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
				data.response.players.forEach(function(p) {

					var member = _.find(this.members, function(m) {
						return m.steam_id == p.steamid;
					});

					if(!member) {
						return console.error('Member not found:', p.steamid);
					}

					var player = {
						'avatarURL':   p.avatarfull,
						'displayName': p.personaname,
					}

					var opts = {
						'upsert': true,
					}

					var query = {
						'_id': member.account_id,
					}

					Player.update(query, player, opts, function(err) {
						if(err) return console.error(err);
					});
				}.bind(this));
			}.bind(this),

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
