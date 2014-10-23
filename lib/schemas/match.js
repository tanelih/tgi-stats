'use strict';

var mongoose = require('mongoose');

var MatchSchema = new mongoose.Schema({

	'_id': {
		type:     String,
		unique:   true,
		required: true,
	},

	'start_time': {
		type:     Date,
		required: true,
	},

	'created_at': {
		type:    Date,
		default: Date.now,
	},
});

module.exports = MatchSchema;
