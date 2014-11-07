'use strict';

var mongoose = require('mongoose');

var MatchSchema = new mongoose.Schema({

	/**
	 * DOTA2 'match_id'.
	 */
	'_id': {
		'type': String
	},

	/**
	 * DOTA2 match 'start_time'.
	 */
	'startedAt': {
		'type':     Date,
		'required': true,
	},

	/**
	 * Due to MongoDB using sunday as the first day of the week we explicitly
	 * store the week number based on our locale ('fi').
	 */
	'weekNumber': {
		'type':     Number,
		'required': true,
	},

	/**
	 * Participants of the match. Filtered to contain only the players
	 * identified as 'members' in the initial setup.
	 */
	'players': [{

		/**
		 * Reference to the 'player'.
		 */
		'account': {
			'ref':  'player',
			'type': String,
		},

		/**
		 * DOTA2 API's 'hero_id' attribute.
		 */
		'hero': String,

		/**
		 * Match specific stats.
		 */
		'stats': {
			'kills':   Number,
			'deaths':  Number,
			'assists': Number,

			'xpm': Number,
			'gpm': Number,

			'denies':   Number,
			'lastHits': Number,
		}
	}],
});

if(!MatchSchema.options.toJSON) {
	MatchSchema.options.toJSON = {
		transform: function(doc, ret) {
			delete ret._id;
			delete ret.__v;

			ret.id = doc._id;
		}
	}
}


module.exports = MatchSchema;
