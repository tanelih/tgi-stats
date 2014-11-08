'use strict';

var moment   = require('moment');
var express  = require('express');
var mongoose = require('mongoose');

var Match  = mongoose.model('match');
var Player = mongoose.model('player');

var app    = express();
var router = express.Router();

router.get('/matches/:year/:week', function(req, res) {
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

	Match.find(query).populate('players.account').select('-players._id')
		.exec(function(err, matches) {
			if(err) {
				return res.status(500).json(err);
			}
			return res.status(200).json(matches);
		});
});

app.use('/api', router);

/**
 * Setup static content, 'html', 'js', 'css'...
 *
 * NOTE The server will default to serving the 'index' of public if the route
 *      does not match anything else.
 */
app.use(express.static('public'));
app.use('*', express.static('public'));

module.exports = app;
