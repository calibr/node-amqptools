import amqpLib = require("amqplib/callback_api")
import eventManager = require("./EventEmitter")
import rpcManager = require("./RPCManager")
import taskManager = require("./TaskManager")
import async = require("async")
import Promise = require("bluebird")
import { channelManager } from './ChannelManager'
import { TaskManager } from "./TaskManager";
import { Event } from "./Event";
import { EventListener } from "./EventListener";
import { EventListenerConstructorOptions } from "./EventListener";
import { EventConstructorOptions } from "./Event";

require('source-map-support').install();

export class AMQPManager {
  private taskManager;

  get events() {
    return eventManager;
  }

  get rpc() {
    return rpcManager;
  }

  get tasks() {
    if (!this.taskManager) {
      this.taskManager = new TaskManager();
    }
    return this.taskManager;
  }

  createEvent(options: EventConstructorOptions) {
    return new Event(options);
  }

  createEventListener(options: EventListenerConstructorOptions) {
    return new EventListener(options);
  }

  setConnectionURI(uri) {
    channelManager.setConnectionURI(uri);
  }

  disconnect(cb) {
    channelManager.disconnect(cb);
  }

  reconnect(cb?) {
    channelManager.reconnect(cb);
  }
}

var amqpManager = new AMQPManager();

export = amqpManager;