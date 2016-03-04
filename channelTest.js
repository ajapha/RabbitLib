var Channel = require('./channel');
var getChannel = new Channel().getChannel;


getChannel().then(function(ch) {
    ch.assertQueue('Foo2').then(function(q) {
        console.log(q.queue);
    }, function(err){console.log(err);});
});

