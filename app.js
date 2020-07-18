const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var open = require('amqplib').connect(url);

app.get('/consume', function (req, res) {
	open
		.then(function (conn) {
			var ok = conn.createChannel();
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
				ch.consume(q, function (msg) {
					if (msg !== null) {
						console.log(msg.content.toString());
						ch.ack(msg);
						res.send(msg.content.toString());
					}
				});
			});
			return ok;
		})
		.then(null, console.warn);
});

app.get('/publish', function (req, res) {
	open
		.then(function (conn) {
			var ok = conn.createChannel();
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
				ch.sendToQueue(q, new Buffer('Request 1 by Leela Mohan'));
			});
			return ok;
		})
		.then(null, console.warn);
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`listening on port ${port}!`));
