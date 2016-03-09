channel = require('./channel');


module.exports = {
    
    consumeWorker: function(microservice, callback, isApi, jobType) {
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
        assertExchange(exchangeName).then(function(ex) {
            var exchange = ex.exchange;
            assertQueue(queueName, queueConfig).then(function(q) {
                var queue = q.queue;
                ch.bindQueue(queue, exchange, bindingKey, function(err, ok) {
                    queue.consume(queue, function(msg) {
                        var done = function() {
                            ch.ack(msg);
                        };
                        consumeCallback(msg, done);
                    });
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
