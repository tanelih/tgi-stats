'use strict';

var _       = require('lodash');
var request = require('request');
var Promise = require('promise');

var key = process.env.STEAM_API_KEY;
var api = 'http://api.steampowered.com';

module.exports = function(endpoint, params) {
	var qs = _.merge(_.clone(params || { }), { 'key': key });

	return new Promise(function(resolve, reject) {
		var options = {
			'qs': qs, 'url': api + endpoint,
		}

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
}
