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
	},

	'players': [{
		'heroID':    String,
		'accountID': String,

		'kills':   Number,
		'deaths':  Number,
		'assists': Number,

		'xpm': Number,
		'gpm': Number,

		'denies':   Number,
		'lastHits': Number,

		'fantasyPoints': Number,
	}],
});

module.exports = MatchSchema;
