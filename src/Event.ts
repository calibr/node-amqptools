/// <reference path="../typings/tsd.d.ts" />

import ChannelManager = require("./ChannelManager");
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

export interface EventConstructorOptions {
  channelManager?: ChannelManager
  exchange: string;
  topic: string;
}

export class Event {
  exchange:string;
  topic:string;
  static channelManager;

  constructor(options:EventConstructorOptions) {
    if (options.channelManager) Event.channelManager = options.channelManager;
    this.exchange = options.exchange;
    this.topic = options.topic ? options.topic : 'nimbusEvent';
  }

  send(object:any) {
    return this.sendString(this.prepareMessage(object));
  }

  static getChannel() {
    return Event.channelManager.getChannel();
  }

  get fullExchangeName():string {
    return EXCHANGE_PREFIX + this.exchange;
  }

  get routeKey(): string {
    return this.exchange + '.' + this.topic
  }

  private assertExchange(channelManager) {
    return channelManager.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.fullExchangeName, "topic", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private assertExchangeForAllEvents(channelManager) {
    return channelManager.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(EXCHANGE_ALL_EVENTS, "topic", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private bindToExchangeForAllEvents(channelManager) {
    return channelManager.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.bindExchange(EXCHANGE_ALL_EVENTS, this.fullExchangeName, "#", {},
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  sendBuffer(buffer:Buffer) {
    var channelManager = Event.getChannel();
    return channelManager
      .then(() => this.assertExchange(channelManager))
      .then(() => this.assertExchangeForAllEvents(channelManager))
      .then(() => this.bindToExchangeForAllEvents(channelManager))
      .then((channel) => {
        channel.publish(this.fullExchangeName, this.routeKey, buffer, {
          contentType: "text/json"
        });
      });
  }

  sendString(string:String) {
    return this.sendBuffer(new Buffer(string));
  }

  prepareMessage(object:any) {
    var message = {
      exchange: this.exchange,
      topic: this.topic,
      content: object
    };

    return JSON.stringify(message);
  }
}