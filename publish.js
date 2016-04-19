Channel = require('./channel');

var channel = new Channel();

function assertExchange(channel, microservice) {
    return channel.assertExchange(microservice, 'topic');
}

module.exports = function(exchangeName, job, event, msgContent, onConfirm, onReply) {
    
    console.log('publish called ' + exchangeName);
    channel.getChannel().then(function(ch) {
        var exchangeFunc = exchangeName !== '' ? 
            assertExchange : 
            _ => { 
                return Promise.resolve({exchange: ''});
            }; 
        
        exchangeFunc(ch, exchangeName).then(function(ex) {
            var exchange = ex.exchange;
            console.log('exchange asserted ' + exchange);
            var routingKey = exchange === '' ? job : buildRoutingKey(job, event);
            console.log('Routing key', routingKey);
            if (onReply) {
                ch.assertQueue('', {durable: false, exclusive: true}).then((q) => {
                    var replyQueue = q.queue;
                    console.log('Reply queue created', replyQueue);
                    ch.consume(replyQueue, onReply);
                    msgContent.replyTo = replyQueue;
                    var content = new Buffer(JSON.stringify(msgContent));
                    ch.publish(exchange, routingKey, content, {}, onConfirm);    
                });
            } else {
                var content = new Buffer(JSON.stringify(msgContent));
                ch.publish(exchange, routingKey, content, {}, onConfirm);
            }
        });
    }, function(err) {console.log(err);});
};

function buildRoutingKey(job, event) {
    if (!job && !event) throw new Error('Empty Routing Key');
    var routingKey = '';
    if (job) {
        routingKey += 'job.';
        routingKey += (typeof job === "string" ? job : '') + '.';
    }
    if (event) {
        routingKey += 'event.';
        routingKey += (typeof event === "string" ? event : '');
    }
    return routingKey;
}