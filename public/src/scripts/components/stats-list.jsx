'use strict'

var _     = require('lodash');
var React = require('react');

var PlayerPortrait = require('./player-portrait.jsx');

module.exports = React.createClass({

	propTypes: {
		'title':   React.PropTypes.string.isRequired,
	    'track':   React.PropTypes.string.isRequired,
	    'matches': React.PropTypes.array.isRequired,
	    'average': React.PropTypes.bool,
	},

	getInitialState: function() {
		return {
			'stats': [ ],
		}
	},

	getDefaultProps: function() {
		return {
			'average': false,
		}
	},

	componentDidMount: function() {
		return this._addStatsFor(this.props);
	},

	componentWillReceiveProps: function(nextProps) {
		return this._addStatsFor(nextProps);
	},

    render: function() {
    	if(!this.props.matches.length) {
    		return (
    			<div />
    		);
    	}

        return (
            <div className="panel panel-default stats-list">
            	<div className="panel-heading">{this.props.title}</div>
            	<ul className="list-group">
        		{this.state.stats.map(function(s) {
        			return (
        				<li key={s.account.id} className="list-group-item">
							<div className="row">
								<div className="col-xs-2">
									<PlayerPortrait key={s.account.id}
										            account={s.account} />
								</div>
								<div className="col-xs-6">
									<span className="sample-size">
										Over {s.sample} matches
									</span>
								</div>
								<div className="col-xs-4 text-right">
									<span className="sample-value">
										{s.value}
									</span>
								</div>
							</div>
						</li>
        			);
        		})}
            	</ul>
            </div>
        );
    },

	_addStatsFor: function(props) {
		// First pluck the 'players' attr from matches and flatten the array.
		// Then group the results by the players 'account.id'.
		var players         = _.flatten(_.pluck(props.matches, 'players'));
		var matchesByPlayer = _.groupBy(players, function(p) {
			return p.account.id;
		});

		var stats = [ ];

		for(var accountID in matchesByPlayer) {
			var matches = matchesByPlayer[accountID];
			var account = matchesByPlayer[accountID][0].account;

			// Pluck the tracked property from 'match.stats' to form an array.
			var results = matches.map(function(match) {
				return match.stats[props.track];
			});

			// Sum up the results array.
			var result = _.reduce(results, function(s, n) {
				return s + n;
			});

			// Average out the results if needed.
			if(props.average) result = (result / matches.length).toFixed(2);

			stats.push({
				'value':   result,
				'sample':  matches.length,
				'account': account,
			});
		}

		this.setState({
			'stats': stats.sort(function(a, b) {
				return b.value - a.value;
			})
		});
	},
});
