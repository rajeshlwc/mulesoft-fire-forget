const path  = require('path');
const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const amqp = require('amqplib');

// Middleware
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

// simulate request ids
let lastRequestId = 1;

// RabbitMQ connection string
const messageQueueConnectionString = process.env.CLOUDAMQP_URL;

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});
// handle the request
app.post('/publish', async function (req, res) {
  // save request id and increment
  let requestId = lastRequestId;
  lastRequestId++;

  // connect to Rabbit MQ and create a channel
  let connection = await amqp.connect(messageQueueConnectionString);
  let channel = await connection.createConfirmChannel();

  // publish the data to Rabbit MQ
  let requestData = req.body.data;
  console.log("Published a request message, requestId:", requestId);
  await publishToChannel(channel, { routingKey: "request", exchangeName: "processing", data: { requestId, requestData } });

  // send the request id in the response
  res.send({ requestId })
});

// utility function to publish messages to a channel
function publishToChannel(channel, { routingKey, exchangeName, data }) {
  return new Promise((resolve, reject) => {
    channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(data), 'utf-8'), { persistent: true }, function (err, ok) {
      if (err) {
        return reject(err);
      }

      resolve();
    })
  });
}


async function listenForResults() {
  // connect to Rabbit MQ
  let connection = await amqp.connect(messageQueueConnectionString);

  // create a channel and prefetch 1 message at a time
  let channel = await connection.createChannel();
  await channel.prefetch(1);

  // start consuming messages
  await consume({ connection, channel });
}


// consume messages from RabbitMQ
function consume({ connection, channel, resultsChannel }) {
  return new Promise((resolve, reject) => {
    channel.consume("processing.results", async function (msg) {
      // parse message
      let msgBody = msg.content.toString();
      let data = JSON.parse(msgBody);
      let requestId = data.requestId;
      let processingResults = data.processingResults;
      console.log("Received a result message, requestId:", requestId, "processingResults:", processingResults);

      // acknowledge message as received
      await channel.ack(msg);
    });

    // handle connection closed
    connection.on("close", (err) => {
      return reject(err);
    });

    // handle errors
    connection.on("error", (err) => {
      return reject(err);
    });
  });
}

// Start the server
const PORT =  process.env.PORT || 3000;
server = http.createServer(app);
server.listen(PORT, "localhost", function (err) {
  if (err) {
    console.error(err);
  } else {
    console.info("Listening on port %s.", PORT);
  }
});

// listen for results on RabbitMQ
listenForResults();

/*const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

var q = 'tasks';
var url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
var open = require('amqplib').connect(url);
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Serve static files
app.use(express.static(__dirname + '/public'));

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

app.post('/publish', function (req, res) {
  console.log(req.body);
	open
		.then(function (conn) {
			var ok = conn.createChannel(); 
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
        ch.sendToQueue(q, new Buffer(JSON.stringify(req.body)));
        //ch.close(function() {conn.close()})
        res.send({success: true, sent: req.body});
			});
		})
		.then(null, console.warn);
});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`listening on port ${port}!`)); */

