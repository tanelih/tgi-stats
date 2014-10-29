'use strict';

var moment   = require('moment');
var restify  = require('restify');
var mongoose = require('mongoose');

var Match  = mongoose.model('match');
var server = restify.createServer();

server.get('/matches/:year/:week', function(req, res) {
	var year        = req.params.year;
	var week        = req.params.week;
	var endOfWeek   = moment().year(year).week(week).endOf('week');
	var startOfWeek = moment().year(year).week(week).startOf('week');

	var query = {
		'startedAt': {
			'$gte': startOfWeek.toDate(),
			'$lte': endOfWeek.toDate(),
		}
	}

	Match.find(query, function(err, matches) {
		if(err) {
			return res.send(500, err);
		}
		return res.json(200, matches);
	});
});

server.get('/.*/', restify.serveStatic({
	'default':   'index.html',
	'directory': 'public/',
}));

module.exports = server;
