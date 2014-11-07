'use strict'

var _       = require('lodash');
var React   = require('react');
var moment  = require('moment');
var request = require('superagent');

var MatchList  = require('../components/match-list.jsx');
var StatsList  = require('../components/stats-list.jsx');
var WeekPicker = require('../components/week-picker.jsx');

/**
 *
 */
function getMatches(at, callback) {
	var url = '/matches/' + at.year + '/' + at.week + '';

	return request.get(url, function(res) {
		var matches = res.body;
		    matches = _.sortBy(matches, 'startedAt').reverse();

		return callback(matches);
	});
}

module.exports = React.createClass({

	getInitialState: function() {
		return {
			'matches': [ ]
		}
	},

	getDefaultProps: function() {
		return {
			'year': moment().year(),
			'week': moment().week(),
		}
	},

	componentDidMount: function() {
		return getMatches(this.props, function(matches) {
			this.setState({ 'matches': matches });
		}.bind(this));
	},

	componentWillReceiveProps: function(nextProps) {
		return getMatches(nextProps, function(matches) {
			this.setState({ 'matches': matches });
		}.bind(this));
	},

	render: function() {
		var year = this.props.year;
		var week = this.props.week;

		return (
			<div>
				<div className="row">
					<div className="col-xs-12 week-picker">
						<WeekPicker year={year} week={week} />
					</div>
				</div>

				<div className="row">
					<div className="col-xs-12 col-sm-6">
						<StatsList track="kills" title="Total Kills"
						           matches={this.state.matches} />
					</div>

					<div className="col-xs-12 col-sm-6">
						<StatsList track="deaths" title="Total Deaths"
						           matches={this.state.matches} />
					</div>

					<div className="col-xs-12 col-sm-6">
						<StatsList track="kills" average={true}
						           title="Average Kills"
						           matches={this.state.matches} />
					</div>

					<div className="col-xs-12 col-sm-6">
						<StatsList track="deaths" average={true}
						           title="Average Deaths"
						           matches={this.state.matches} />
					</div>
				</div>

				<div className="row">
					<div className="col-xs-12 match-list">
						<h2 className="title">Match History</h2>
						<MatchList matches={this.state.matches} />
					</div>
				</div>
			</div>
		);
	}
});