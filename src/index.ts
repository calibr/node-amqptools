/// <reference path="../typings/tsd.d.ts" />

import amqpLib = require("amqplib/callback_api")
import eventManager = require("./eventEmitter")
import rpcManager = require("./rpc")
import taskManager = require("./task")
import async = require("async")

require('source-map-support').install();

var connectionURI,
  channel,
  connection,
  _connectInProgress = false,
  _connectCallbacks = [];

function _connect(cb) {
  if(channel) {
    return cb(channel);
  }

  _connectCallbacks.push(cb);
  if(_connectInProgress) return;

  _connectInProgress = true;
  amqpLib.connect(connectionURI, function(err, conn) {
    if(err) {
      throw err;
    }
    connection = conn;
    conn.createChannel(function(err, amqpChannel) {
      if(err) {
        throw err;
      }
      eventManager.setChannel(amqpChannel);
      rpcManager.setChannel(amqpChannel);
      channel = amqpChannel;
      _connectInProgress = false;
      _connectCallbacks.forEach(function(extraCb) {
        extraCb(channel);
      });
      _connectCallbacks = [];
    });
  });
}

eventManager._connect = _connect;
rpcManager._connect = _connect;
taskManager._connect = _connect;

export function setConnectionURI (uri) {
  connectionURI = uri;
}

export function disconnect (cb) {
  if(!connection) {
    return cb();
  }
  connection.close(function() {
    connection = null;
    channel = null;
    cb();
  });
}

export function reconnect(cb) {
  cb = cb || function() {};
  async.series([
    function(next) {
      if(!connection) {
        return next();
      }
      connection.close(function() {
        connection = null;
        channel = null;
        next();
      });
    },
    function() {
      _connect(function (channel) {
        cb()
      });
    }
  ]);

}

export var events = eventManager;
export var rpc = rpcManager;
export var tasks = taskManager;