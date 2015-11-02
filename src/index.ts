/// <reference path="../typings/tsd.d.ts" />

import amqpLib = require("amqplib/callback_api")
import eventManager = require("./eventEmitter")
import rpcManager = require("./rpc")
import taskManager = require("./task")
import async = require("async")

require('source-map-support').install();

class ChannelManager {
  connectionURI: string;
  channel:amqpLib.Channel;
  connection: amqpLib.Connection;

  private connectCallbacks:((err:Error, channel:amqpLib.Channel) => void)[];
  private connectInProgress:boolean;

  constructor() {
    this.connectCallbacks = [];
  }

  get events() {
    eventManager.channelManager = this;
    return eventManager;
  }

  get rpc() {
    rpcManager.channelManager = this;
    return rpcManager;
  }

  get tasks() {
    taskManager.channelManager = this;
    return taskManager;
  }


  connect(cb) {
    if (this.channel) {
      return cb(null, this.channel);
    }

    this.connectCallbacks.push(cb);
    if (this.connectInProgress) return;
    this.connectInProgress = true;

    amqpLib.connect(this.connectionURI, (err, connection) => {
      if (err) return this.connectRespond(err, null);
      this.connection = connection;
      this.connection.createChannel((err, channel) => {
        if (err) return this.connectRespond(err, null);

        eventManager.setChannel(channel);
        rpcManager.setChannel(channel);
        this.channel = channel;

        this.connectRespond(null, this.channel)
      });
    });
  }

  connectRespond(err, channel) {
    this.connectInProgress = false;

    this.connectCallbacks.forEach((extraCb) => {
      extraCb(err, channel);
    });
    this.connectCallbacks = [];
  }

  setConnectionURI(uri) {
    this.connectionURI = uri;
  }

  disconnect(cb) {
    if (!this.connection) {
      return cb();
    }
    this.connection.close(() => {
      this.connection = null;
      this.channel = null;
      cb();
    });
  }

  reconnect(cb?) {
    if (!this.connection) {
      return this.connect(cb);
    }

    this.connection.close(() => {
      this.connection = null;
      this.channel = null;
      this.connect(cb);
    });
  }
}

var channelManager = new ChannelManager();

export = channelManager;