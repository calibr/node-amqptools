/*
 * high level RPC over AMQP
 *
 * action in format:
 * <exchange>:<topic>
 *
 * request:
 * caller -> erpc:<exchange> (topic) -> processor
 * response:
 * processor -> replyTo -> caller
 *
 */

var
  util = require("util"),
  async = require("async"),
  crypto = require("crypto"),
  EXCHANGE_PREFIX = "_rpc:",
  QUEUE_PREFIX = "_queue:",
  CALL_TIMEOUT = 3600 * 1000, // one hour
  processors = {},
  returnCbs = {},
  replyQueue = "",
  channel = null,
  DEBUG = false;

function dbg() {
  if(DEBUG) {
    arguments = [].slice.call(arguments);
    console.log.apply(console, arguments);
  }
}

function randomString(string_length) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = string_length || 48;
  var randomstring = '';

  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }

  return randomstring;
}

setInterval(function() {
  // check every hour for expired callbacks
  var removeKeys = [],
      now = new Date().getTime(),
      k,
      timeCreated,
      data;
  for(k in returnCbs) {
    timeCreated = returnCbs[k].date.getTime();
    if(now - timeCreated >= CALL_TIMEOUT) {
      removeKeys.push(k);
    }
  }
  removeKeys.forEach(function(k) {
    data = returnCbs[k];
    delete returnCbs[k];
  });
}, 3600 * 1000);

function _parseAction(event) {
  var tmp = event.split(":");
  return {
    exchange: EXCHANGE_PREFIX + tmp[0],
    topic: tmp[1]
  };
}

function _assertExchange(action, cb) {
  var actionParsed = _parseAction(action);
  channel.assertExchange(actionParsed.exchange, "direct", {
    durable: false,
    autoDelete: true
  }, function(err) {
    return cb(err);
  });
}

function _errorPrepare(err) {
  if(!err) {
    return null;
  }
  return {
    code: err.code ? err.code : -1,
    msg: err.message,
    data: err.data,
    errtype: err.errtype
  };
}

function _createQueue(action, cb) {
  // create action processor queue
  var actionParsed = _parseAction(action);
  var queueName = QUEUE_PREFIX + actionParsed.exchange + ":" + actionParsed.topic;
  channel.assertQueue(queueName, {}, function(err, attrs) {
    if(err) {
      return cb(err);
    }
    channel.bindQueue(queueName, actionParsed.exchange, actionParsed.topic, {}, function(err) {
      if(err) {
        return cb(err);
      }
      channel.consume(queueName, function(msg) {
        var content = JSON.parse(msg.content);
        try {
          dbg("Incoming RPC request", action);
          processors[action](content, function(err, body) {
            var response = {
              error: _errorPrepare(err),
              body: typeof body !== "undefined" ? body : null
            };
            channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(response)), {
              correlationId: msg.properties.correlationId
            });

            dbg("Incoming RPC request", action, " processed! reply to",
              msg.properties.replyTo);
          });
        }
        catch(ex) {
          console.error("ERROR IN rpc processor\n", ex.message, ex.stack);
        }
        channel.ack(msg);
      });
      cb(null);
    });
  });
}

exports.register = function(action, cb) {
  if(processors[action]) {
    return false;
  }
  processors[action] = cb;
  async.series([
    function(next) {
      exports._connect(function() {
        next();
      });
    },
    function(next) {
      _assertExchange(action, function(err) {
        if(err) {
          return;
        }
        next();
      });
    },
    function() {
      _createQueue(action, function(err) {
        if(err) {
          return;
        }
      });
    }
  ]);
  return true;
};

exports.call = function(action, params, cb) {
  var actionParsed = _parseAction(action);
  async.series([
    function(next) {
      exports._connect(function() {
        next();
      });
    },
    function(next) {
      _assertExchange(action, function(err) {
        if(err) {
          return cb(err);
        }
        next();
      });
    },
    function(next) {
      if(replyQueue) {
        return next();
      }
      channel.assertQueue("", {}, function(err, attrs) {
        if(err) {
          return cb(err);
        }
        replyQueue = attrs.queue;
        channel.consume(replyQueue, function(_msg) {
          var msg = JSON.parse(_msg.content),
              correlationId = _msg.properties.correlationId;
          if(returnCbs[correlationId]) {
            dbg("RPC Response", returnCbs[correlationId].action);

            var resError = null;
            if(msg.error) {
              resError = new Error(msg.error.msg);
              resError.code = msg.error.code;
              resError.errtype = msg.error.errtype;
              resError.data = msg.error.data;
            }
            var returnCb = returnCbs[correlationId].cb;
            delete returnCbs[correlationId];
            returnCb(resError, msg.body);
          }
          else {
            dbg("Obtained reply but unrecognized by correlationId:", correlationId);
          }
          channel.ack(_msg);
        });
        next();
      });
    },
    function() {
      var correlationId = randomString();
      dbg("RPC Call", action, "wait reply to", replyQueue);
      returnCbs[correlationId] = {
        date: new Date(),
        cb: cb,
        action: action,
        params: params
      };
      channel.publish(actionParsed.exchange, actionParsed.topic, new Buffer(JSON.stringify(params)), {
        correlationId: correlationId,
        replyTo: replyQueue
      });
    }
  ]);
};

exports.setChannel = function(_channel) {
  channel = _channel;
};