'use strict';

var server = require('restify').createServer();

server.get('/matches', function(req, res) {
	return res.send(200, { 'hello': 'world' });
});

module.exports = server;
