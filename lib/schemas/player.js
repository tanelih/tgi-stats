'use strict';

var mongoose = require('mongoose');

var PlayerSchema = new mongoose.Schema({

	/**
	 * DOTA2 'account_id'.
	 */
	'_id': {
		type: String,
	},

	/**
	 * The player's current 'personaname'.
	 */
	'displayName': {
		'type':     String,
		'required': true,
	},

	/**
	 * Max resolution Steam avatar.
	 */
	'avatarURL': {
		'type': String,
	},
});

if(!PlayerSchema.options.toJSON) {
	PlayerSchema.options.toJSON = {
		transform: function(doc, ret) {
			delete ret._id;
			delete ret.__v;

			ret.id = doc._id;
		}
	}
}


module.exports = PlayerSchema;
