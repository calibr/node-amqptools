/// <reference path="../typings/tsd.d.ts" />

import amqpLib = require("amqplib/callback_api")
import eventManager = require("./EventEmitter")
import rpcManager = require("./RPCManager")
import taskManager = require("./taskManager")
import async = require("async")
import Promise = require("bluebird");
import ChannelManager = require("./ChannelManager");

require('source-map-support').install();

class AMQPManager {
  channelManager:ChannelManager;

  constructor() {
    this.channelManager = new ChannelManager();
  }

  get events() {
    eventManager.channelManager = this.channelManager;
    return eventManager;
  }

  get rpc() {
    rpcManager.channelManager = this.channelManager;
    return rpcManager;
  }

  get tasks() {
    taskManager.channelManager = this.channelManager;
    return taskManager;
  }

  setConnectionURI(uri) {
    this.channelManager.setConnectionURI(uri);
  }

  disconnect(cb) {
    this.channelManager.disconnect(cb);
  }

  reconnect(cb?) {
    this.channelManager.reconnect(cb);
  }
}

var amqpManager = new AMQPManager();

export = amqpManager;