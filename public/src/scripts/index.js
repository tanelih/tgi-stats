'use strict'

var page  = require('page');
var React = require('react');
var moment = require('moment');

var WeekView = React.createFactory(require('./views/week.jsx'));

page('/', function(ctx) {
	var year = moment().year();
	var week = moment().week();

	return page.show('/matches/' + year + '/' + week + '');
});

page('/matches/:year/:week', function(ctx) {
	var weekView = WeekView({
		'year': parseInt(ctx.params.year),
		'week': parseInt(ctx.params.week),
	});
	return React.render(weekView, document.getElementById('view'));
});

moment.locale('fi') && page.start();
