/*
 * high level event emitter over amqp
 *
 * each event should has format:
 * <exchange>:<topic>
 */

var
  EventEmitter = require("events").EventEmitter,
  ee = new EventEmitter(),
  util = require("util"),
  async = require("async"),
  // associations between events and AMQP queues
  eventsQueues = {},
  EXCHANGE_PREFIX = "_event:",
  QUEUE_PREFIX = "_queue:",
  addListenerMethods = ["addListener", "on", "once"],
  copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];

var channel = null,
    runtime = "";

function _parseEvent(event) {
  var tmp = event.split(":");
  return {
    exchange: EXCHANGE_PREFIX + runtime + ":" + tmp[0],
    topic: tmp[1]
  };
}

function _getChannel(cb) {
  cb(null, channel);
}

function _assertExchange(name, cb) {
  _getChannel(function(err, chan) {
    if(err) {
      return cb(err);
    }
    chan.assertExchange(name, "direct", {
      durable: false,
      autoDelete: true
    }, function(err) {
      return cb(err);
    });
  });
}

function _createQueue(event, cb) {
  var eParsed = _parseEvent(event);
  _getChannel(function(err, chan) {
    if(err) {
      return cb(err);
    }
    var queueName = QUEUE_PREFIX + eParsed.exchange + ":" + eParsed.topic;
    chan.assertQueue(queueName, {}, function(err, attrs) {
      if(err) {
        return cb(err);
      }
      chan.bindQueue(queueName, eParsed.exchange, eParsed.topic, {}, function(err) {
        if(err) {
          return cb(err);
        }
        eventsQueues[event] = queueName;
        chan.consume(queueName, function(msg) {
          var content = JSON.parse(msg.content),
              args = [];
          if(util.isArray(content)) {
            args = [event].concat(content);
          }
          else {
            args = [event, content];
          }
          chan.ack(msg);
          ee.emit.apply(ee, args);
        });
        cb(null);
      });
    });
  });
}

function _preListen(event, cb) {
  var eParsed = _parseEvent(event);
  _assertExchange(eParsed.exchange, function(err) {
    if(err) {
      return cb(err);
    }
    async.series([
      function(next) {
        if(eventsQueues[event]) {
          return next();
        }
        _createQueue(event, function(err) {
          if(err) {
            return cb(err);
          }
          next();
        });
      },
      function() {
        cb(null);
      }
    ]);
  });
}

addListenerMethods.forEach(function(method) {
  exports[method] = function(event, cb) {
    if(["newListener", "removeListener"].indexOf(event) !== -1) {
      // special events
      return ee[method].call(ee, event, cb);
    }
    _preListen(event, function(err) {
      if(!err) {
        ee[method].call(ee, event, cb);
      }
    });
  };
});

copyMethods.forEach(function(method){
  exports[method] = function() {
    var args = [].slice.call(arguments);
    ee[method].apply(ee, args);
  };
});

exports.emit = function() {
  var args = [].slice.call(arguments),
      event = args.shift(),
      eParsed = _parseEvent(event);
  _preListen(event, function(err) {
    if(!err) {
      _getChannel(function(err, chan) {
        if(err) {
          return;
        }
        var buffer = new Buffer(JSON.stringify(args));
        chan.publish(eParsed.exchange, eParsed.topic, buffer, {
          contentType: "text/json"
        });
      });
    }
  });
};

exports.setChannel = function(_channel) {
  channel = _channel;
};
exports.setRuntime = function(aRuntime) {
  runtime = aRuntime;
};
