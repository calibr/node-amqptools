/// <reference path="../typings/tsd.d.ts" />

import ChannelManager = require("./ChannelManager");
import { Event } from "./Event";
const EXCHANGE_PREFIX = "nimbus:event:";
const QUEUE_PREFIX = "nimbus:listener:";
const QUEUE_OPTIONS =  { durable: false, autoDelete: true, exclusive: true};
const EXCHANGE_OPTIONS = { durable: false, autoDelete: true };

export interface EventListenerConstructorOptions {
  channelManager: ChannelManager
  exchange: string;
  runtime?: string;
  topic?: string;
}

export class EventListener {
  exchange: string;
  topic: string;
  queue: string;

  static channelManager;

  constructor(options: EventListenerConstructorOptions) {
    this.exchange = options.exchange;
    this.topic = options.topic;
    if (options.runtime) this.queue = QUEUE_PREFIX + options.runtime;
    EventListener.channelManager = options.channelManager;
  }

  static getChannel() {
    return EventListener.channelManager.getChannel();
  }

  get fullExchangeName(): string {
    return EXCHANGE_PREFIX + this.exchange;
  }

  get queueName(): string {
    return this.queue;
  }

  set queueName(val: string) {
    this.queue = val;
  }

  private assertExchange(channelPromise) {
    return channelPromise.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.fullExchangeName, "direct", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private assertQueue(channelPromise) {
    return channelPromise.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertQueue(this.queueName, QUEUE_OPTIONS, (err, ok) => {
          if (err) return reject(err);
          this.queueName = ok.queue;
          resolve(channel);
        });
      })
    })
  }

  private bindQueue(channelPromise) {
    return channelPromise.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.bindQueue(this.queueName, this.fullExchangeName, this.topic, {},
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  listen(listener: (message) => void) {
    var channelPromise = EventListener.getChannel();
    return this.assertExchange(channelPromise)
      .then(() => this.assertQueue(channelPromise))
      .then(() => this.bindQueue(channelPromise))
      .then((channel) => {
        return new Promise((resolve, reject) => {
          channel.consume(this.queueName, (msg) => {
            var message = JSON.parse(msg.content.toString());
            listener(message);
            channel.ack(msg);
          });
          resolve(null);
        });
      });
  }

}