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
  QUEUE_PREFIX = "_queue_rpc:",
  CALL_TIMEOUT = 3600 * 1000, // one hour
  returnCbs = {},
  replyQueue = "",
  channel = null,
  DEBUG = false;

function dbg() {
  if(DEBUG) {
    var args = [].slice.call(arguments);
    console.log.apply(console, args);
  }
}

function randomString(string_length) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  string_length = string_length || 48;
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
  return {
    queue: QUEUE_PREFIX + event,
  };
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

var RPC = function() {
  this.processors = {};
};

RPC.prototype._createQueue = function(action, cb) {
  // create action processor queue
  var actionParsed = _parseAction(action);
  var self = this;
  channel.assertQueue(actionParsed.queue, {}, function(err, attrs) {
    if(err) {
      return cb(err);
    }
    channel.consume(actionParsed.queue, function(msg) {
      var content = JSON.parse(msg.content);
      try {
        dbg("Incoming RPC request", action);
        self.processors[action].listener(content, function(err, body) {
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
    }, {}, function(err, res) {
      cb(err, res.consumerTag);
    });
  });
};

RPC.prototype.register = function(action, cb, regiterCb) {
  var self = this;
  regiterCb = regiterCb || function() {};
  if(self.processors[action]) {
    throw new Error("Can't register same action processor twice");
  }
  var consumerTag;
  async.series([
    function(next) {
      module.exports._connect(function() {
        next();
      });
    },
    function(next) {
      self._createQueue(action, function(err, tag) {
        if(!err) {
          consumerTag = tag;
        }
        next(err);
      });
    }
  ], function(err) {
    if(!err) {
      self.processors[action] = {
        listener: cb,
        consumerTag: consumerTag
      };
    }
    regiterCb(err);
  });
  return true;
};

RPC.prototype.unregister = function(action, unregisterCb) {
  unregisterCb = unregisterCb || function() {};
  var self = this;
  if(!self.processors[action]) {
    process.nextTick(function() {
      unregisterCb(null);
    });
    return false;
  }
  channel.cancel(self.processors[action].consumerTag, function(err) {
    if(!err) {
      delete self.processors[action];
    }
    unregisterCb(err);
  });
};

RPC.prototype.call = function(action, params, cb) {
  if(typeof params === "function") {
    cb = params;
    params = {};
  }
  var actionParsed = _parseAction(action);
  async.series([
    function(next) {
      module.exports._connect(function() {
        next();
      });
    },
    function(next) {
      if(replyQueue) {
        return next();
      }
      channel.assertQueue("", {
        durable: false,
        autoDelete: true
      }, function(err, attrs) {
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
      channel.sendToQueue(actionParsed.queue, new Buffer(JSON.stringify(params)), {
        correlationId: correlationId,
        replyTo: replyQueue
      });
    }
  ]);
};

RPC.purgeActionQueue = function(action, cb) {
  var actionParsed = _parseAction(action);
  channel.purgeQueue(actionParsed.queue, cb);
};

module.exports = RPC;

module.exports.setChannel = function(_channel) {
  channel = _channel;
};