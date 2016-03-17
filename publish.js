Channel = require('./channel');

var channel = new Channel();

function assertExchange(channel, microservice) {
    return channel.assertExchange(microservice, 'topic');
}

module.exports = function(exchangeName, job, event, msgContent, onConfirm) {
    console.log('publish called ' + exchangeName);
    channel.getChannel().then(function(ch) {
        assertExchange(ch, exchangeName).then(function(ex) {
            var exchange = ex.exchange;
            console.log('exchange asserted ' + exchange);
            var routingKey = buildRoutingKey(job, event);
            var content = new Buffer(JSON.stringify(msgContent));
            ch.publish(exchange, routingKey, content, onConfirm);
        });
    }, function(err) {console.log(err);});
}

function buildRoutingKey(job, event) {
    if (!job && !event) throw new Error('Empty Routing Key');
    var routingKey = '';
    if (job) {
        routingKey += 'job.';
        routingKey += (typeof job === "string" ? job : '') + '.';
    }
    if (event) {
        routingKey += 'event.';
        routingKey += (typeof job === "string" ? job : '');
    }
    return routingKey;
}