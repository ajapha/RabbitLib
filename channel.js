var amqp = require('amqplib');
var connection = require('./connection');

function Channel() {
    var channel;
    function openChannel() {
        var channelPromise = new Promise(function(resolve, reject) {
            connection().then(function(conn) {
                channel = conn.createChannel();
                channel.then(function(ch) {
                    setChannelEventListeners(ch);
                    resolve(ch);
                    console.log('channel created!');
                }, function(err){console.log(err);reject(err);});
            });
        });
        return channelPromise;
    }
    function setChannelEventListeners(ch) {
        ch.on('close', function() {
            console.log('Channel closed!!!');
        });
        ch.on('error', function(err) {
            console.log('Error on Channel!!!', err, 'restarting...')
            openChannel();
        });
        ch.on('return', function(msg) {
            console.log('Channel returned!!!');
        });
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