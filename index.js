'use strict';

var fs       = require('fs');
var cron     = require('cron');
var moment   = require('moment');
var Promise  = require('promise');
var mongoose = require('mongoose');

// Set 'moment' locale to 'fi'.
moment.locale('fi');

// Before we do anything, we set the 'STEAM_API_KEY' environmental variable to
// the contents of '.apikey' if present.
if(fs.existsSync('.apikey')) {
	process.env.STEAM_API_KEY = fs.readFileSync('.apikey', {
		'encoding': 'utf-8'
	});
}

// We also check for a '.members' file if present and set it to the
// 'CLAN_MEMBERS' environmental value.
if(fs.existsSync('.members')) {
	var members = fs.readFileSync('.members', { 'encoding': 'utf-8' })
		.split('\n');
	// Filter out any empty lines. Join it into a ','-separated string.
	process.env.CLAN_MEMBERS = members
		.filter(function(m) { return !!m; }).join(',');
}

// Setup 'mongoose' and its 'schemas'.
var Match = mongoose.connect('mongodb://localhost/tgistats')
	.model('match', require('./lib/schemas/match'));

/**
 * Calculate the top performing players and grant awards based on their stats.
 *
 * NOTE This is a 'cron'-like job which is run every 'monday' at '0200 AM'.
 */
new cron.CronJob('00 00 02 * * 1', function() {
	// db.matches.aggregate([
	// 	{
	// 		"$group": {
	// 			"_id": {
	// 				"year": { "$year": "$startedAt" },
	// 				"week": "$weekNumber",
	// 			},
	// 			"matches": { "$push": "$$ROOT" }
	// 		}
	// 	}
	// ])
	//
	// TODO Loop through each match in the group, figuring out top performances
	//      for various categories. Add 'awards' for players.
	//
	//      UPSERT {
	//      	'account_id': 123, 'week': 41, 'year': 2014, 'category': ...
	//      }
}).start();

/**
 * Start a 'PlayerSummaryWorker' for the given 'steamIDs' and a
 * 'MatchHistoryWorker' for each given 'steamID'.
 *
 * TODO Should we handle all data stuff in the workers themselves, or leave
 *      them in their current, reasonably generic state. By data stuff I mean
 *      having the workers actually store the mongoose documents etc...
 */
function startWorkers(playerQueries) {
	var SECOND = 1000;
	var MINUTE = 60 * SECOND;

	var MatchHistoryWorker  = require('./lib/workers/match-history');
	var PlayerSummaryWorker = require('./lib/workers/player-summary');

	var steamIDs = playerQueries.map(function(q) {
		return q.response.steamid;
	});

	// Run a single 'PlayerSummaryWorker' for all the users, because the Steam
	// 'PlayerSummary' API allows multiple users per request.
	var psworker = new PlayerSummaryWorker(steamIDs);

	psworker.on('player', function onPlayer(data) {
		require('purdy')(data);
	});

	setInterval(psworker.run.bind(psworker), 10 * SECOND);

	// Create a 'MatchHistoryWorker' for each user.
	steamIDs.forEach(function(steamID) {
		var mhworker = new MatchHistoryWorker(steamID);

		mhworker.on('match', function onMatch(match) {
			var startedAt = moment(match.start_time * 1000);

			// Pluck fields we want to preserve from the match data.
			var data = {
				'matchID':    match.match_id,
				'startedAt':  startedAt,
				'weekNumber': startedAt.week(),
			}

			var opts  = { 'upsert':  true }
			var query = { 'matchID': match.match_id }

			// Insert a new match if there isn't one, otherwise just update the
			// existing one.
			Match.update(query, data, opts, function(err) {
				if(err) {
					return console.error(err);
				}
			});
		});

		/**
		 * Run the 'MatchHistory' worker, passing in the latest match as an
		 * argument to limit the amount of requests made.
		 */
		setInterval(function getMatchHistory() {
			// Sort the matches by 'startedAt', in a descending order, so that
			// the newest match will be the first element.
			var latest = Match.find().sort({ 'startedAt': -1 }).limit(1);

			latest.exec(function(err, matches) {
				if(err) {
					return console.error(err);
				}
				// If we already have matches, use the latest match as
				// a starting point for retrieving new matches.
				if(matches[0]) {
					return mhworker.run({ 'startAt': matches[0].startedAt });
				}
				return mhworker.run();
			});
		}, 10 * SECOND);
	});
}

var server  = require('./lib/server');
var request = require('./lib/utils/request');

// Start our server and schedule necessary 'workers'.
//
// TODO Use 'moment' to get 'fi' locale week number, and add them to the
//      matches.
server.listen(process.env.PORT || 3000, function() {
	console.log('Server listening at ', this.address().port);

	// Resolve the 'members' to actual SteamIDs.

	var members  = process.env.CLAN_MEMBERS.split(',');
	var endpoint = '/ISteamUser/ResolveVanityURL/v0001/';
	var promises = [ ];

	for(var i = 0; i < members.length; i++) {
		promises.push(request(endpoint, { 'vanityurl': members[i] }));
	}

	// Once all members have been resolved, start workers for each one.
	//
	// TODO Do these need to be background processes? Can we utilize something
	//      like the 'child_process' module?
	Promise.all(promises).then(startWorkers, console.error);
});
