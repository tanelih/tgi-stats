'use strict';

var moment = require('moment');

module.exports = function($scope, $routeParams, $http) {

	var year = $routeParams.year || moment().year();
	var week = $routeParams.week || moment().week();

	$scope.year = year;
	$scope.week = week;

	$http.get('/matches/' + year + '/' + week + '').then(function(response) {
		console.log('hep!');

		var scores  = { }
		var matches = $scope.matches = response.data;

		for(var i = 0; i < matches.length; i++) {
			var match = matches[i];

			for(var j = 0; j < match.players.length; j++) {

				var id     = match.players[j].accountID;
				var player = match.players[j];

				scores[id] = scores[id] || {
					'kills':   0,
					'deaths':  0,
					'assists': 0,
					'matches': 0,
				}

				scores[id].kills   += player.kills;
				scores[id].deaths  += player.deaths;
				scores[id].assists += player.assists;

				scores[id].matches++;
			}
		}

		// Format maybe something like:
		//
		// {
		//  'id':     123456,
		//  'played': 17,
		//  'matches': {
		//    'hero_id': k, d, a...
		//  }
		// }

		var players = [ ];

		for(var id in scores) {
			players.push({
				'id': id,
				'totals': {
					'kills':   scores[id].kills,
					'deaths':  scores[id].deaths,
					'assists': scores[id].assists,
				},
				'averages': {
					'kills':   scores[id].kills   / scores[id].matches,
					'deaths':  scores[id].deaths  / scores[id].matches,
					'assists': scores[id].assists / scores[id].matches,
				},
			});
		}

		console.log(players);
	});
}
