'use strict';

var React = require('react');

/**
 *
 */
module.exports = React.createClass({

	propTypes: {
	    'account': React.PropTypes.shape({
	    	'id':          React.PropTypes.string,
	    	'avatarURL':   React.PropTypes.string,
	    	'displayName': React.PropTypes.string,
	    }),
		'diameter':  React.PropTypes.number,
	},

	getDefaultProps: function() {
		return {
			'diameter': 32,
		}
	},

	render: function() {
		var acc = this.props.account;

		if(!acc) {
			return (
				<a href="#" title="unknown" target="_blank">
					<img src="http://placehold.it/64x64"
					     className="player-portrait" />
				</a>
			);
		}

		var avatarURL   = acc.avatarURL;
		var linkTitle   = acc.displayName;
		var dotaBuffURL = 'http://www.dotabuff.com/players/' + acc.id + '';

		return (
			<a href={dotaBuffURL} title={linkTitle} target="_blank">
				<img src={avatarURL} className="player-portrait" />
			</a>
		);
	}
});
