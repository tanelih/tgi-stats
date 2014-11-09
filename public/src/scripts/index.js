'use strict'

var page   = require('page');
var React  = require('react');
var moment = require('moment');

var WeekView = React.createFactory(require('./views/week.jsx'));

page('/', function(ctx) {
	var year = moment().locale('fi').year();
	var week = moment().locale('fi').week();

	return page.show('/matches/' + year + '/' + week + '');
});

page('/matches/:year/:week', function(ctx) {
	var weekView = WeekView({
		'year': parseInt(ctx.params.year),
		'week': parseInt(ctx.params.week),
	});
	return React.render(weekView, document.getElementById('view'));
});

// 'moment' requires the locale-module when you set a locale through
// 'moment.locale', hence 'browserify' does not pick it up.
require('moment/locale/fi') && page.start();
