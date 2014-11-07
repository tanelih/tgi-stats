'use strict'

var _     = require('lodash');
var React = require('react');

var PlayerPortrait = require('./player-portrait.jsx');

module.exports = React.createClass({

	propTypes: {
	    'track':   React.PropTypes.string.isRequired,
	    'matches': React.PropTypes.array.isRequired,
	    'average': React.PropTypes.bool,
	},

	getInitialState: function() {
		return {
			'rankings': [ ],
		}
	},

	getDefaultProps: function() {
		return {
			'average': false,
		}
	},

	componentDidMount: function() {
		return this.setRankings(this.props);
	},

	componentWillReceiveProps: function(nextProps) {
		return this.setRankings(nextProps);
	},

	setRankings: function(props) {
		// First pluck the 'players' attr from matches and flatten the array.
		// Then group the results by the players 'account.id'.
		var players         = _.flatten(_.pluck(props.matches, 'players'));
		var matchesByPlayer = _.groupBy(players, function(p) {
			return p.account.id;
		});

		var rankings = [ ];

		for(var accountID in matchesByPlayer) {
			var matches = matchesByPlayer[accountID];

			// Pluck the tracked property from 'match.stats' to form an array.
			var results = matches.map(function(match) {
				return match.stats[this.props.track];
			}.bind(this));

			// Sum up the results array.
			var sumResults = _.reduce(results, function(s, n) {
				return s + n;
			});

			// Average out the results if needed
			if(this.props.average) {
				sumResults /= matches.length;
				sumResults = sumResults.toFixed(2)
			}

			rankings.push({
				'value':   sumResults,
				'sample':  matches.length,
				'account': matches[0].account,
			});
		}

		this.setState({
			'rankings': rankings.sort(function(a, b) {
				return b.value - a.value;
			})
		});
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
        		{this.state.rankings.map(function(r) {
        			return (
        				<li key={r.account.id} className="list-group-item">
							<div className="row">
								<div className="col-xs-2">
									<PlayerPortrait key={r.account.id}
										            account={r.account} />
								</div>
								<div className="col-xs-2">
									<span className="sample-size">
										{r.sample}
									</span>
								</div>
								<div className="col-xs-8 text-right">
									<span className="sample-value">
										{r.value}
									</span>
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
