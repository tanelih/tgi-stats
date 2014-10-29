'use strict';

var moment = require('moment');
    moment.locale('fi');

angular.module('tgi-stats', [ 'ngRoute' ])
	.config(function routeConfiguration($routeProvider, $locationProvider) {

		var year = moment().year();
		var week = moment().week();

		$routeProvider
			.when('/matches/:year/:week', {
				template:   require('../partials/week-view.html'),
				controller: require('./controllers/week-view'),
			})
			// .when('/account/:id', {
			// 	template: 'partials/account-view.html',
			// 	controller: function() {
			// 		console.log('account-view');
			// 	}
			// })
			.otherwise('/matches/' + year + '/' + week + '');

		$locationProvider.html5Mode(true);
	})
	.run(function run() {
		console.log('asd');
	});
