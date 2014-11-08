'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');
var request  = require('../utils/request');
var time     = require('../utils/time-constants');

var Match              = mongoose.model('match');
var MatchDetailsWorker = require('./match-details');

/**
 * Represents a 'worker' class that queries the Steam API for 'Dota2' match
 * results.
 */
function MatchHistoryWorker(member, opts) {
	opts = opts || { }

	this.params = {
		'account_id': member.account_id,
	}

	this.interval = opts.interval || 10 * time.MINUTE;
	this.endpoint = '/IDOTA2Match_570/GetMatchHistory/V001/';
}

/**
 * Runs the 'worker' that fetches match history data from the Steam API.
 */
MatchHistoryWorker.prototype.run = function() {
	var accountID = this.params['account_id'];

	/**
	 * Spawn a 'MatchDetailsWorker' for each given 'match'.
	 */
	var spawnMatchDetailWorkers = function(matches) {
		matches.forEach(function(match) {
			new MatchDetailsWorker(match.match_id, accountID).run();
		});
		console.log('[', accountID, ']', 'spawned', matches.length, 'workers!');
	}

	/**
	 * Fetches 'MatchHistory' data from the Steam API, calls itself recursively
	 * if there are still matches that need to be retrieved.
	 */
	var worker = function(opts, latestMatchStartedAt, matches) {
		opts    = opts ? _.merge(opts, this.params) : this.params;
		matches = matches || [ ];

		// Query the Steam API for 'MatchHistory' results.
		return request(this.endpoint, opts).then(

			/**
			 * Figure out the amount of actual 'new' matches in the results.
			 * Then either call 'worker' recursively or spawn
			 * 'MatchDetailWorkers' for each new match.
			 */
			function onMatchHistory(data) {
				var newMatches = [ ];
				// If a 'startAt' option is passed, it is a 'Date' object which
				// indicates the latest match we currently possess.
				if(latestMatchStartedAt) {
					// Filter out matches that are older than the latest match.
					newMatches = _.filter(data.result.matches, function(m) {
						var matchStartedAt = new Date(m.start_time * 1000);
						return matchStartedAt > latestMatchStartedAt;
					});
				}
				else {
					newMatches = data.result.matches;
				}

				// Represents the total amount of new matches retrieved,
				// including the matches from the recursion.
				var totalNewMatches = matches.concat(newMatches);

				// If there were more results than actual 'new' matches, we can
				// bail out even though 'results_remaining' might say otherwise.
				if(data.result.num_results > newMatches.length) {
					return spawnMatchDetailWorkers(totalNewMatches);
				}

				if(data.result.results_remaining) {
					// Recursively call the 'worker' with 'start_at_match_id'
					// set to the earliest match's 'match_id'.
					var last = _.last(data.result.matches).match_id;
					    opts = _.merge(opts, { 'start_at_match_id': last });

					return worker(opts, latestMatchStartedAt, totalNewMatches);
				}
				else {
					return spawnMatchDetailWorkers(totalNewMatches);
				}
			}.bind(this),

			/**
			 * Log any errors.
			 *
			 * TODO How do we handle errors? Retry or something?
			 */
			console.error.bind(null, '[MatchHistoryWorker]:'));
	}.bind(this)

	/**
	 * Runs the 'worker'. Provides a 'startAt' option if there are any matches
	 * already in the database for the 'player' with the given 'steamID'.
	 */
	var getMatchHistory = function() {
		Match.find({ 'players.account': accountID })
			.sort({ 'startedAt': -1 }).limit(1)
			.exec(function(err, matches) {
				if(err) {
					return console.error(err);
				}
				// If we already have matches, use the latest match as a
				// starting point for retrieving new matches.
				if(matches[0]) {
					return worker(null, matches[0].startedAt);
				}
				return worker();
			});
	}

	getMatchHistory();
	return setInterval(getMatchHistory, this.interval);
}

module.exports = MatchHistoryWorker;
