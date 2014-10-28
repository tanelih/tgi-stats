'use strict';

var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({

	'displayName': {
		'type':     String,
		'required': true,
	},

	'steamID': {
		'type':     String,
		'required': true,
	},

	'accountID': {
		'type':     String,
		'required': true,
	},

	'avatarURL': {
		'type': String,
	},
});

module.exports = PlayerSchema;
