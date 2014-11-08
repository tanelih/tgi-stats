'use strict';

var _       = require('lodash');
var limiter = require('limiter');
var Promise = require('promise');
var request = require('superagent');

var key = process.env.STEAM_API_KEY;
var api = 'http://api.steampowered.com';

var rateLimiter = new limiter.RateLimiter(1, 750);

module.exports = function(endpoint, params) {
	var qs = _.merge(_.clone(params || { }), { 'key': key });

	return new Promise(function(resolve, reject) {
		rateLimiter.removeTokens(1, function() {
			request(api + endpoint).query(qs).end(function(res) {
				if(res.error) {
					var error            = new Error(res.body);
					    error.statusCode = res.status;
					return reject(error);
				}
				return resolve(res.body);
			});
		});
	});
}
