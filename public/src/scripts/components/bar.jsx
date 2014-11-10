'use strict';

var React       = require('react');
var ProgressBar = require('progressbar.js');

module.exports = React.createClass({

	getDefaultProps: function() {
		return {
			'ratio': 0.00,
			'color': 'red',
		}
	},

	componentDidMount: function() {
		this.bar = new ProgressBar.Line(this.getDOMNode(), {
			'color':       this.props.color,
			'strokeWidth': 32,
		});
		this.bar.animate(this.props.ratio, { 'duration': 750 });
	},

	componentWillReceiveProps: function(nextProps) {
		this.bar.animate(nextProps.ratio, { 'duration': 750 });
	},

	render: function() {
		return (
			<div className="bar"></div>
		);
	}
});
