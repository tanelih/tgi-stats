'use strict';

var _       = require('lodash');
var request = require('request');
var limiter = require('limiter');
var Promise = require('promise');

var key = process.env.STEAM_API_KEY;
var api = 'http://api.steampowered.com';

var rateLimiter = new limiter.RateLimiter(1, 750);

module.exports = function(endpoint, params) {
	var qs = _.merge(_.clone(params || { }), { 'key': key });

	return new Promise(function(resolve, reject) {
		var options = {
			'qs': qs, 'url': api + endpoint,
		}

		rateLimiter.removeTokens(1, function() {
			request(options, function(err, res, body) {
				if(err) {
					return reject(err);
				}

				if(res.statusCode != 200) {
					var error            = new Error(body);
					    error.statusCode = res.statusCode;
					return reject(error);
				}

				return resolve(JSON.parse(body));
			});
		});
	});
}
