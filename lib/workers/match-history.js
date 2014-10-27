'use strict';

var _       = require('lodash');
var util    = require('util');
var events  = require('events');
var moment  = require('moment');
var convert = require('../utils/convert');
var request = require('../utils/request');

var SECOND = 1000;
var MINUTE = 60 * SECOND;

/**
 * Represents a 'worker' class that queries the Steam API for 'Dota2' match
 * results.
 */
function MatchHistoryWorker(steamID) {
	// Inherit from 'EventEmitter'.
	events.EventEmitter.call(this);

	this.params = {
		'account_id': convert.to32Bit(steamID)
	}

	this.endpoint = '/IDOTA2Match_570/GetMatchHistory/V001/';
}

// Inherit from 'EventEmitter'.
util.inherits(MatchHistoryWorker, events.EventEmitter);

/**
 * Runs the 'worker' that fetches match history data from the Steam API.
 */
MatchHistoryWorker.prototype.run = function(opts) {
	// Copy the attributes from 'this.params' to 'opts' so we can do some
	// recursion where we pass in additional options to ourselves.
	opts = opts ? _.merge(opts, this.params) : this.params;

	require('purdy')(opts);

	// Query the Steam API.
	request(this.endpoint, opts).then(

		/**
		 * Parses the set of match history received, invoking the
		 * 'MatchHistoryWorker.run' method recursively if there are still
		 * results to retrieve.
		 */
		function onMatchHistory(data) {
			var matches = data.result.matches;

			// for(var i = 0; i < matchData.length; i++) {
			// 	// TODO Figure out a correct format for the 'match' object.
			// 	matches.push(matchData[i]);
			// }

			// Sort the matches by their 'start_time'.
			matches = _.sortBy(matches, function(m) {
				return m.start_time;
			});

			// If a 'latest' option is passed, it is a 'Date' object which
			// indicates the latest match we currently possess.
			if(opts.startAt) {
				// Filter matches that are older than the latest match.
				matches = _.filter(matches, function(m) {
					return new Date(m.start_time * 1000) > opts.startAt;
				});
			}

			// Using our 'EventEmitter' inheritance, we can notify listeners of
			// new 'matches'.
			matches.forEach(this.emit.bind(this, 'match'));

			// If there were more results than actual 'new' matches, we can
			// bail out even though 'results_remaining' might say otherwise.
			if(data.result.num_results > matches.length) return;

			if(data.result.results_remaining) {
				// Recursively call the 'run' method with a 'start_at_match_id'
				// set to the earliest match's 'match_id'.
				opts = _.merge(opts, {
					'start_at_match_id': _.first(matches).match_id,
				});

				MatchHistoryWorker.prototype.run.call(this, opts);
			}
		}.bind(this),
		console.error.bind(null, '[MatchHistoryWorker]:'));
}

module.exports = MatchHistoryWorker;
