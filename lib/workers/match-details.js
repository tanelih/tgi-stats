'use strict';

var _        = require('lodash');
var moment   = require('moment');
var mongoose = require('mongoose');
var request  = require('../utils/request');

var Match = mongoose.model('match');

/**
 *
 */
function MatchDetailsWorker(matchID, accountID) {
	this.params = {
		'match_id': matchID,
	}

	this.endpoint  = '/IDOTA2Match_570/GetMatchDetails/V001/';
	this.accountID = accountID;
}

/**
 *
 */
MatchDetailsWorker.prototype.run = function() {
	request(this.endpoint, this.params).then(

		/**
		 *
		 */
		function onMatchDetails(data) {
			var accountID  = this.accountID;
			var matchData  = data.result;
			var playerData = _.find(matchData.players, function(p) {
				return p.account_id == accountID;
			});

			if(!playerData) {
				return console.error('Player not found!');
			}

			// First we form the 'player' model, picking only the stuff we want
			// from the player with the given 'accountID'.
			//
			// TODO Add fantasy point calculation!!
			// TODO Add a 'victory' stat.
			var player = {
				'heroID':    playerData.hero_id,
				'accountID': playerData.account_id,

				'kills':   playerData.kills,
				'deaths':  playerData.deaths,
				'assists': playerData.assists,

				'xpm': playerData.xp_per_min,
				'gpm': playerData.gold_per_min,

				'denies':   playerData.denies,
				'lastHits': playerData.last_hits,
			}

			// Then the actual 'match' model.
			var match = {
				'matchID':    matchData.match_id,
				'startedAt':  moment(matchData.start_time * 1000),
				'weekNumber': moment(matchData.start_time * 1000).week(),
				'$addToSet': {
					'players': player,
				}
			}

			var query = {
				'matchID': match.matchID,
			}

			var opts = {
				'upsert': true,
			}

			Match.update(query, match, opts, function(err) {
				if(err) return console.error(err);
			});

		}.bind(this),

		/**
		 * Log any errors.
		 */
		console.error.bind(null, '[MatchDetailsWorker]:'));
}

module.exports = MatchDetailsWorker;
