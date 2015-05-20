/*
 * high level event emitter over amqp
 *
 * each event should has format:
 * <exchange>:<topic>
 */

var
  EventEmitter = require("events").EventEmitter,
  util = require("util"),
  async = require("async"),
  // associations between events and AMQP queues
  EXCHANGE_PREFIX = "_event:",
  QUEUE_PREFIX = "_queue:",
  addListenerMethods = ["addListener", "on", "once"],
  copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];

var channel = null;

function _parseEvent(event) {
  var tmp = event.split(":");
  return {
    exchange: EXCHANGE_PREFIX + ":" + tmp[0],
    topic: tmp[1]
  };
}

function _getChannel(cb) {
  cb(null, channel);
}



var AMQPEventEmitter = function(runtime) {
  this.runtime = runtime || "";
  this.ee = new EventEmitter();
  this.eventsQueues = {};

  var self = this;
  addListenerMethods.forEach(function(method) {
    self[method] = function(event, cb) {
      if(["newListener", "removeListener"].indexOf(event) !== -1) {
        // special events
        return self.ee[method].call(self.ee, event, cb);
      }
      self._preListen(event, function(err) {
        if(!err) {
          self.ee[method].call(self.ee, event, cb);
        }
      });
    };
  });

  copyMethods.forEach(function(method){
    self[method] = function() {
      var args = [].slice.call(arguments);
      self.ee[method].apply(self.ee, args);
    };
  });
};
exports = module.exports = AMQPEventEmitter;

AMQPEventEmitter.prototype.emit = function() {
  var args = [].slice.call(arguments),
      event = args.shift(),
      eParsed = _parseEvent(event),
      self = this;
  self._preListen(event, function(err) {
    if(!err) {
      _getChannel(function(err, chan) {
        if(err) {
          return;
        }
        var buffer = new Buffer(JSON.stringify(args));
        //console.log("Publish message to exchange ", eParsed.exchange, "(", eParsed.topic,")");
        chan.publish(eParsed.exchange, eParsed.topic, buffer, {
          contentType: "text/json"
        });
      });
    }
  });
};

AMQPEventEmitter.prototype._assertExchange = function(name, cb) {
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
};

AMQPEventEmitter.prototype._createQueue = function(event, cb) {
  var eParsed = _parseEvent(event);
  var self = this;
  _getChannel(function(err, chan) {
    if(err) {
      return cb(err);
    }
    var queueName = QUEUE_PREFIX + self.runtime +  ":" + eParsed.exchange;
    if(eParsed.topic) {
      queueName += ":" + eParsed.topic;
    }
    chan.assertQueue(queueName, {
      durable: false,
      autoDelete: true
    }, function(err, attrs) {
      if(err) {
        return cb(err);
      }
      //console.log("Consume from", eParsed.exchange, "->", queueName);
      chan.bindQueue(queueName, eParsed.exchange, eParsed.topic, {}, function(err) {
        if(err) {
          return cb(err);
        }
        self.eventsQueues[event] = queueName;
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
          self.ee.emit.apply(self.ee, args);
        });
        cb(null);
      });
    });
  });
};

AMQPEventEmitter.prototype._preListen = function(event, cb) {
  var self = this;
  exports._connect(function() {
    var eParsed = _parseEvent(event);
    self._assertExchange(eParsed.exchange, function(err) {
      if(err) {
        return cb(err);
      }
      async.series([
        function(next) {
          if(self.eventsQueues[event]) {
            return next();
          }
          self._createQueue(event, function(err) {
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
  });
};


exports.setChannel = function(_channel) {
  channel = _channel;
};