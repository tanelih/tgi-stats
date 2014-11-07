'use strict'

var React  = require('react');
var moment = require('moment');

var PlayerPortrait = require('./player-portrait.jsx');

var MatchListItem = React.createClass({

	render: function() {

		var match       = this.props.match;
		var dotaBuffURL = 'http://www.dotabuff.com/matches/' + match.id;

		return (
			<li className="list-group-item">
				<div className="row">

					<div className="col-xs-8">
					{match.players.map(function(player) {
						return (
							<PlayerPortrait key={player.account.id}
							                account={player.account} />
						);
					})}
					</div>

					<div className="col-xs-4 text-right">
						<a href={dotaBuffURL} target="_blank">
							{moment(match.startedAt).fromNow()}
						</a>
					</div>

				</div>
			</li>
		);
	}
});

module.exports = React.createClass({

	render: function() {
		if(!this.props.matches.length) {
			return (
				<div>Nothing here...</div>
			);
		}

		return (
			<ul className="list-group">
			{this.props.matches.map(function(match) {
				return (
					<MatchListItem key={match.id} match={match} />
				);
			})}
			</ul>
		);
	}
});
