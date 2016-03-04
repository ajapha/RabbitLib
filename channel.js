var amqp = require('amqplib');
var connection = require('./connection');

function Channel() {
    var channel;
    function openChannel() {
        var channelPromise = new Promise(function(resolve, reject) {
            connection().then(function(conn) {
                channel = conn.createChannel().then(function(ch) {
                    resolve(ch);
                    console.log('channel created!');
                }, function(err){console.log(err);reject(err);});
            });
        });
        return channelPromise;
    }
    this.getChannel = function() {
        if (!channel) {
            return openChannel();
        } else {
            return channel;
        }
    };
}

module.exports = Channel;