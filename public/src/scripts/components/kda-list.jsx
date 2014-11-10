'use strict';

var _     = require('lodash');
var React = require('react');

var Bar            = require('./bar.jsx');
var PlayerPortrait = require('./player-portrait.jsx');

module.exports = React.createClass({

	_update: function(matchesByPlayer) {
		var rankings = [ ];

		for(var id in matchesByPlayer) {
			var matches = matchesByPlayer[id];
			var account = matchesByPlayer[id][0].account;

			var k = matches.map(function(m) { return m.stats.kills; })
				.reduce(function(s, n) { return s + n; });
			var d = matches.map(function(m) { return m.stats.deaths; })
				.reduce(function(s, n) { return s + n; });
			var a = matches.map(function(m) { return m.stats.assists; })
				.reduce(function(s, n) { return s + n; });

			var max   = _.max([k, d, a]);
			var ratio = (k + a) / (d > 0 ? d : 1);

			rankings.push({
				'k':     k / max,
				'd':     d / max,
				'a':     a / max,
				'ratio': ratio,
				'account': account,  });
		}

		this.setState({
			'rankings': rankings.sort(function(a, b) {
				return b.ratio - a.ratio;
			})
		});
	},

	getInitialState: function() {
		return { 'rankings': [ ] }
	},

	componentDidMount: function() {
		return this._update(this.props.matches);
	},

	componentWillReceiveProps: function(nextProps) {
		return this._update(nextProps.matches);
	},

	render: function() {
		return (
			<div className="panel panel-default kda-list">
            	<div className="panel-heading">KDA</div>
				<ul className="list-group">
				{this.state.rankings.map(function(r) {
					return (
	    				<li key={r.account.id} className="list-group-item">
							<div className="row">
								<div className="col-xs-2 portrait-container">
									<PlayerPortrait key={r.account.id}
										            account={r.account} />
								</div>
								<div className="col-xs-8">
									<Bar ratio={r.k} color="#ea030e" />
									<Bar ratio={r.d} color="#979797" />
									<Bar ratio={r.a} color="#a9cf54" />
								</div>
								<div className="col-xs-2 text-right">
									<span className="sample-value">
										{r.ratio.toFixed(2)}
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
