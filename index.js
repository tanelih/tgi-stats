'use strict';

var fs       = require('fs');
var Promise  = require('promise');
var mongoose = require('mongoose');

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
mongoose.model('match', require('./lib/schemas/match'));
mongoose.connect('mongodb://localhost/tgistats');

var server  = require('./lib/server');
var request = require('./lib/utils/request');

var Match               = mongoose.model('match');
var MatchHistoryWorker  = require('./lib/workers/match-history');
var PlayerSummaryWorker = require('./lib/workers/player-summary');

// Start our server and schedule necessary 'workers'.
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
	Promise.all(promises).then(
		function(queries) {

			var SECOND = 1000;
			var MINUTE = 60 * SECOND;

			var ids = queries.map(function(q) { return q.response.steamid; });

			// PlayerSummaryWorker will keep polling the Steam servers for
			// changes to any of the members' user details.
			new PlayerSummaryWorker(ids).run();

			// A MatchHistoryWorker is started for each member separately.
			queries.forEach(function(query) {
				// MatchHistoryWorker keeps track of the user's match history.
				var worker = new MatchHistoryWorker(query.response.steamid);

				worker.on('match', function(m) {
					var q    = { '_id':    m.id }
					var opts = { 'upsert': true }
					var data = {
						'_id':        m.id,
						'start_time': m.started,
					}

					Match.update(q, data, opts, function(err) {
						if(err) {
							return console.error(err);
						}
						// TODO Remove this, this is just for debugging...
						console.log('received:'); require('purdy')(data);
					});
				});

				var getMatchHistory = function() {
					// Find the latest 'match' we have in store.
					var latest = Match.find({ }).sort({ 'start_time': -1 })
						.limit(1);

					latest.exec(function(err, matches) {
						if(err) {
							return console.error(err);
						}

						// If we already have matches, use the latest match as
						// a starting point for retrieving new matches.
						var match = matches[0];

						if(match) {
							return worker.run({ 'latest': match.start_time });
						}
						return worker.run();
					});
				}

				getMatchHistory();
				return setInterval(getMatchHistory, 10 * SECOND);
			});
		},
		console.error.bind(console));
});
