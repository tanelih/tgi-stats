'use strict'

var React  = require('react');
var moment = require('moment');

/**
 * Simple 'week-picker' control, with 'prev-week' and 'next-week' controls and
 * the currently selected week displayed.
 *
 * TODO Can we remove the link-part from this component, and just emit some sort
 *      of an event to parent components.
 */
module.exports = React.createClass({

	render: function() {
		var curr = moment().year(this.props.year).week(this.props.week);

		var prev        = curr.clone().subtract(1, 'weeks');
		var prevWeekURL = '/matches/' + prev.year() + '/' + prev.week();

		var next        = curr.clone().add(1, 'weeks');
		var nextWeekURL = '/matches/' + next.year() + '/' + next.week();

		var prevWeek = (
			<a href={prevWeekURL}>&lt;</a>
		);

		// Don't show the 'next-week' control if we have selected the current
		// week. This is achieved by leaving the 'next-week' control undefined.
		if(moment().year() >= curr.year() && moment().week() > curr.week()) {
			var nextWeek = (
				<a href={nextWeekURL}>&gt;</a>
			);
		}

		return (
			<div className="row text-center week-picker">
				<div className="col-xs-2 col-xs-offset-2 text-right">
					{prevWeek}
				</div>

				<div className="col-xs-4 text-center">
					{this.props.week} / {this.props.year}
				</div>

				<div className="col-xs-2 text-left">
					{nextWeek}
				</div>
			</div>
		);
	},

});
