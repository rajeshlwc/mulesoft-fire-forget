const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const q = 'orders';
const url = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const open = require('amqplib').connect(url);
const bodyParser = require('body-parser');
const { schema, rootValue } = require('./server/schema');
const { insertMessage, createTable } = require('./server/db'); 


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public'));// Serve static files

app.use('/graphql', graphqlHTTP({
  schema: schema,  // Must be provided
  rootValue: rootValue,
  graphiql: true,  // Enable GraphiQL when server endpoint is accessed in browser
}));

createTable();
function listenForMessages() {
	open
		.then(function (conn) {
			var ok = conn.createChannel();
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
				ch.consume(q, function (msg) {
					if (msg !== null) {
            console.log('Received Message!!');
						console.log(msg.content.toString());
						ch.ack(msg);
						insertMessage(msg.content.toString()).then(function(){
							console.log('Insert Success');
						});
          }
				});
			});
			return ok;
		})
		.then(null, console.warn);
  }

app.post('/publish', function (req, res) {
  console.log(req.body);
	open
		.then(function (conn) {
			var ok = conn.createChannel(); 
			ok = ok.then(function (ch) {
				ch.assertQueue(q);
        ch.sendToQueue(q, new Buffer(JSON.stringify(req.body)));
        console.log('Message Sent!!');
        res.send({success: true, sent: req.body});
			});
		})
		.then(null, console.warn);
});
app.get("/dataurl", function (req, res) {
	var test = process.env.CLOUDAMQP_URL || "NO URI Found";
	res.send(test);
});


app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`listening on port ${port}!`)); 

listenForMessages();