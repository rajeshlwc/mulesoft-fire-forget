const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || "amqp://localhost";
var open = require('amqplib').connect(url);

// Consumer
open.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(q);
    ch.consume(q, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  });
  return ok;
}).then(null, console.warn);

// Publisher
open.then(function(conn) {
  var ok = conn.createChannel();
  ok = ok.then(function(ch) {
    ch.assertQueue(q);
    ch.sendToQueue(q, new Buffer('something to do'));
  });
  return ok;
}).then(null, console.warn);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`listening on port ${port}!`));