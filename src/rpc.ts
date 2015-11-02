/// <reference path="../typings/tsd.d.ts" />

import util = require("util")
import async = require("async")
import crypto = require("crypto")
import randomString = require("just.randomstring")

const QUEUE_PREFIX = "_queue_rpc:";
const CALL_TIMEOUT = 3600 * 1000;

var returnCbs = {},
  replyQueue = "",
  channel = null,
  DEBUG = false;

function dbg(...args: any[]) {
  if(DEBUG) {
    console.log.apply(console, args);
  }
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

interface Processors {

}

class RPC {
  processors: Processors;
  constructor() {
    this.processors = {};
  }

  static _connect(cb?:(channel) => void) {
    throw new Error('Need to set tasks connect function');
  }

  private createQueue(action, cb) {
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

  register(action, cb, registerCb) {
    var self = this;
    registerCb = registerCb || function() {};
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
        self.createQueue(action, function(err, tag) {
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
      registerCb(err);
    });
    return true;
  };

  unregister(action, unregisterCb) {
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

  call(action, params, cb) {
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
        var correlationId = randomString(48);
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
  }

  static purgeActionQueue(action, cb) {
    var actionParsed = _parseAction(action);
    channel.purgeQueue(actionParsed.queue, cb);
  };

  static setChannel(_channel) {
    channel = _channel;
  };
}

export = RPC;

