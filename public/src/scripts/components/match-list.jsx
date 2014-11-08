'use strict'

var React  = require('react');
var moment = require('moment');

var PlayerPortrait = require('./player-portrait.jsx');

module.exports = React.createClass({

	render: function() {
		return (
			<div className="panel panel-default">
				<div className="panel-heading">Match History</div>

				<ul className="list-group">
				{this.props.matches.map(function(m) {
					var dotaBuffURL = 'http://www.dotabuff.com/matches/' + m.id;

					return (
						<li key={m.id} className="list-group-item">
							<div className="row">

								<div className="col-xs-8">
								{m.players.map(function(player) {
									return (
										<PlayerPortrait key={player.account.id}
											account={player.account} />
									);
								})}
								</div>

								<div className="col-xs-4 text-right">
									<a href={dotaBuffURL} target="_blank">
										{moment(m.startedAt).fromNow()}
									</a>
								</div>

							</div>
						</li>
					);
				})}
				</ul>
			</div>
		);
	}
});
