/// <reference path="../typings/tsd.d.ts" />

import amqp = require("amqplib/callback_api")
import eventsLib = require("./event")
import rpcLib = require("./rpc")
import tasksLib = require("./task")
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
  amqp.connect(connectionURI, function(err, conn) {
    if(err) {
      throw err;
    }
    connection = conn;
    conn.createChannel(function(err, amqpChannel) {
      if(err) {
        throw err;
      }
      eventsLib.setChannel(amqpChannel);
      rpcLib.setChannel(amqpChannel);
      channel = amqpChannel;
      _connectInProgress = false;
      _connectCallbacks.forEach(function(extraCb) {
        extraCb(channel);
      });
      _connectCallbacks = [];
    });
  });
}

eventsLib._connect = _connect;
rpcLib._connect = _connect;
tasksLib._connect = _connect;

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

export var events = eventsLib;
export var rpc = rpcLib;
export var tasks = tasksLib;