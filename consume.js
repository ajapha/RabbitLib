Channel = require('./channel');


module.exports = {
    
    consumeWorker: function(microservice, callback, isApi, jobType) {
        console.log('setting up worker consumer for', microservice);
        var type = jobType || '*';
        var queueConfig = {
            autoDelete: isApi,
            durable: !isApi
        };
        createConsumer(microservice, microservice, queueConfig, '#.job.' + type + '.#', callback);
    },
    
    consumeReply: function(microservice, callback) {
        var queueName = microservice + '-reply',
            exchangeName = microservice,    
            queueConfig = {
            autoDelete: false,
            durable: true
        };
        createConsumer(queueName, exchangeName, queueConfig, '#.reply.#', callback);
    },
    
    consumeObserver: function(microservice, listenTo, callback, eventType) {
        var bindingKey = eventType ? '#event.' + eventType + '#' : '#'
        var queueName = microservice,
            exchangeName = listenTo,    
            queueConfig = {
            autoDelete: true,
            durable: false
        };
        createConsumer(queueName, exchangeName, queueConfig, bindingKey, callback);
    },
    
    consumeEventListener: function(microservice, listenTo, callback, eventType) {
        var queueName = microservice,
            exchangeName = listenTo,    
            queueConfig = {
            autoDelete: false,
            durable: true
        };
        createConsumer(queueName, exchangeName, queueConfig, '#.event.' + eventType + '.#', callback);
    }
    
}

function createChannel() {
    var channel = new Channel();
    return channel.getChannel();
}


function createConsumer(queueName, exchangeName, queueConfig, bindingKey, consumeCallback) {
    createChannel().then(function(ch) {
        assertExchange(ch, exchangeName).then(function(ex) {
            var exchange = ex.exchange;console.log('exchange asserted ' + exchange);
            assertQueue(ch, queueName, queueConfig).then(function(q) {
                var queue = q.queue;console.log('queue asserted ' + queue);
                ch.bindQueue(queue, exchange, bindingKey, {}, function(err, ok) {
                    if (err) {
                        console.log('Error binding queue', queue, 'to exchange', exchange, 'with binding key', bindingKey, err);
                    } else {
                        console.log('Bound queue', queue, 'to exchange', exchange, 'with binding key', bindingKey);
                        ch.consume(queue, function(msg) {
                            console.log('message received!');
                            var done = function() {
                                ch.ack(msg);
                            };
                            consumeCallback(msg, done);
                        });
                    }
                });
            }); 
        });
    });
}

function assertExchange(channel, microservice) {
    return channel.assertExchange(microservice, 'topic');
}

function assertQueue(channel, microservice, config) {
    return channel.assertQueue(microservice, config);
}
