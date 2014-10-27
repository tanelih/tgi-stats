'use strict';

var mongoose = require('mongoose');

var MatchSchema = new mongoose.Schema({

	'matchID': {
		type:     String,
		unique:   true,
		required: true,
	},

	'startedAt': {
		type:     Date,
		required: true,
	},

	'createdAt': {
		type:    Date,
		default: Date.now,
	},

	'weekNumber': {
		type:     Number,
		required: true,
	}
});

module.exports = MatchSchema;
