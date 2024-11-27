import amqpLib = require("amqplib/callback_api")
import { AMQPEventEmitter as eventManager } from "./EventEmitter"

import taskManager = require("./TaskManager")
import async = require("async")
import { channelManager, ChannelManager } from './ChannelManager'
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

  get channelManager(): ChannelManager {
    return channelManager;
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
    return new EventListener(options, new eventManager('random-event-emitter-' + Math.random()));
  }

  setConnectionURI(uri) {
    channelManager.setConnectionURI(uri);
  }

  /**
   * Set masx reconnection attempts when the connection is lost.
   * Reconnections will happen with a time interval.
   * @param maxReconnectionAttempts
   */
  setMaxReconnectionAttempts(maxReconnectionAttempts: number) {
    channelManager.setMaxReconnectionAttempts(maxReconnectionAttempts);
  }

  disconnect(cb) {
    channelManager.disconnect(cb);
  }

  reconnect(cb?) {
    channelManager.reconnect(cb);
  }

  /**
   * close all consuming on all the queues
   * AMQP connection/channel will be kept connected
   */
  finalize() {
    channelManager.finalize();
  }
}