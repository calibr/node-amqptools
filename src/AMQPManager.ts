import amqpLib = require("amqplib/callback_api")
import { AMQPEventEmitter as eventManager } from "./EventEmitter"

import taskManager = require("./TaskManager")
import async = require("async")
import Promise = require("bluebird")
import { channelManager } from './ChannelManager'
import { TaskManager } from "./TaskManager";
import { Event } from "./Event";
import { EventListener } from "./EventListener";
import { EventListenerConstructorOptions } from "./EventListener";
import { EventConstructorOptions } from "./Event";
import { RPCManager } from "./RPCManager"

export class AMQPManager {
  private taskManager: TaskManager;

  get events() {
    return eventManager;
  }

  get rpc() {
    return RPCManager;
  }

  get tasks():TaskManager {
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