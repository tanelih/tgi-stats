'use strict';

var fs         = require('fs');
var cron       = require('cron');
var moment     = require('moment');
var Promise    = require('promise');
var mongoose   = require('mongoose');
var BigInteger = require('big-integer');

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
mongoose.connect('mongodb://localhost/tgistats');
mongoose.model('match',  require('./lib/schemas/match'));
mongoose.model('player', require('./lib/schemas/player'));

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

var server  = require('./lib/server');
var request = require('./lib/utils/request');

// Start our server and schedule necessary 'workers'.
//
// TODO Use 'moment' to get 'fi' locale week number, and add them to the
//      matches.
server.listen(process.env.PORT || 3000, function onServerListening() {
	console.log('Server listening at ', this.address().port);

	var endpoint   = '/ISteamUser/ResolveVanityURL/v0001/';
	var promises   = [ ];
	var steamIDs   = [ ];
	var vanityURLs = process.env.CLAN_MEMBERS.split(',');

	// Filter out actual 'SteamIDs' from 'vanityURLs'.
	for(var i = 0; i < vanityURLs.length; i++) {
		try {
			steamIDs.push(BigInteger(vanityURLs[i]));
		}
		catch(err) {
			promises.push(request(endpoint, { 'vanityurl': vanityURLs[i] }));
		}
	}

	var MatchHistoryWorker  = require('./lib/workers/match-history');
	var PlayerSummaryWorker = require('./lib/workers/player-summary');

	// Once all members have been resolved, start workers for each one.
	//
	// TODO Do these need to be background processes? Can we utilize something
	//      like the 'child_process' module?
	Promise.all(promises).then(
		function onResolvedVanityURLs(queries) {
			var resolvedIDs = queries.map(function(q) {
				return q.response.steamid;
			});

			// We finally have all of our Steam IDs in one place.
			var playerSteamIDs = resolvedIDs.concat(steamIDs);

			// Start a 'PlayerSummaryWorker' for our players.
			new PlayerSummaryWorker(playerSteamIDs).run();

			// Start 'MatchHistoryWorker' for each player, which will in turn
			// run 'MatchDetailsWorker' for found matches.
			playerSteamIDs.forEach(function(playerSteamID) {
				new MatchHistoryWorker(playerSteamID).run();
			});
		},
		console.error);
});
