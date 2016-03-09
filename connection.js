var amqp = require('amqplib');
var amqpUrl = 'amqp://einipgml:9CzP0hvje2jqn87qPv6H74devXJBWu5y@moose.rmq.cloudamqp.com/einipgml';
    //amqpUrl = 'amqp://aaronj:3696@10.200.7.110:5672';
var connection;
var amqpConfig = require('./config').amqp;

function connect() { 
    connection = amqp.connect(amqpConfig.url);
    connection.then(function(conn) {
        conn.on("error", function(err) {
          if (err.message !== "Connection closing") {
            console.error("[AMQP] conn error", err.message);
            console.error("[AMQP] reconnecting");
            connect();
          }
          else {
              console.error("[AMQP] conn error", err.message);
          }
        });
        conn.on("close", function() {
          console.error("[AMQP] reconnecting");
          connect();
        });
        console.log("[AMQP] connected");
    }, function(err) {
          console.error("[AMQP]", err.message);
    });
}

function getConnection() {
    if (!connection) {
        connect();
    }
    return connection;
}

module.exports = getConnection;