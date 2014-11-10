'use strict'

var _       = require('lodash');
var React   = require('react');
var moment  = require('moment');
var request = require('superagent');


var KDAList    = require('../components/kda-list.jsx');
var MatchList  = require('../components/match-list.jsx');
var StatsList  = require('../components/stats-list.jsx');
var WeekPicker = require('../components/week-picker.jsx');

/**
 *
 */
function getMatches(at, callback) {
	var url = '/api/matches/' + at.year + '/' + at.week + '';

	return request.get(url, function(res) {
		// TODO Handle errors!
		var matches = res.body;
		    matches = matches.sort(function(a, b) {
		    	return moment(b.startedAt) - moment(a.startedAt);
		    });

		// First pluck the 'players' attr from matches and flatten the array.
		// Then group the results by the players 'account.id'.
		var players  = _.flatten(_.pluck(matches, 'players'));
		var byPlayer = _.groupBy(players, function(p) { return p.account.id });

		return callback(matches, byPlayer);
	});
}

module.exports = React.createClass({

	getInitialState: function() {
		return {
			'matches':  [ ],
			'byPlayer': { },
		}
	},

	getDefaultProps: function() {
		return {
			'year': moment().year(),
			'week': moment().week(),
		}
	},

	componentDidMount: function() {
		return getMatches(this.props, function(matches, byPlayer) {
			this.setState({ 'matches': matches, 'byPlayer': byPlayer });
		}.bind(this));
	},

	componentWillReceiveProps: function(nextProps) {
		return getMatches(nextProps, function(matches, byPlayer) {
			this.setState({ 'matches': matches, 'byPlayer': byPlayer });
		}.bind(this));
	},

	render: function() {
		var year = this.props.year;
		var week = this.props.week;

		return (
			<div className="week-view">

				{/* Week Picker */}
				<div className="row">
					<div className="col-xs-12 week-picker">
						<WeekPicker year={year} week={week} />
					</div>
				</div>

				{/* Rankings by category */}
				<div className="row">

					{/* KDA CHART HERE */}
					<div className="col-xs-12">
						<KDAList matches={this.state.byPlayer} />
					</div>

					{/* Kills */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="kills" title="Total Kills"
						           matches={this.state.matches} />
					</div>

					<div className="col-xs-12 col-sm-6">
						<StatsList track="kills" average={true}
						           title="Average Kills"
						           matches={this.state.matches} />
					</div>

					{/* Deaths */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="deaths" title="Total Deaths"
						           matches={this.state.matches} />
					</div>

					<div className="col-xs-12 col-sm-6">
						<StatsList track="deaths" average={true}
						           title="Average Deaths"
						           matches={this.state.matches} />
					</div>

					{/* Assists */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="assists" title="Total Assists"
						           matches={this.state.matches} />
					</div>

					<div className="col-xs-12 col-sm-6">
						<StatsList track="assists" average={true}
						           title="Average Assists"
						           matches={this.state.matches} />
					</div>

					{/* XPM, GPM, Last hits, Denies go here... */}
					<div className="col-xs-12">
						<div className="panel panel-default">
							<div className="panel-heading">Economy</div>
						</div>
					</div>

					{/* XPM */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="xpm" average={true}
						           title="Average XP Per Minute"
						           matches={this.state.matches} />
					</div>

					{/* GPM */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="gpm" average={true}
						           title="Average Gold Per Minute"
						           matches={this.state.matches} />
					</div>

					{/* Last Hits */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="lastHits" average={true}
						           title="Average Last Hits"
						           matches={this.state.matches} />
					</div>

					{/* Denies */}
					<div className="col-xs-12 col-sm-6">
						<StatsList track="denies" average={true}
						           title="Average Denies"
						           matches={this.state.matches} />
					</div>

				</div>

				{/* Match History */}
				<div className="row">
					<div className="col-xs-12 match-list">
						<MatchList matches={this.state.matches} />
					</div>
				</div>
			</div>
		);
	}
});
