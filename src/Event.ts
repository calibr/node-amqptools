/// <reference path="../typings/tsd.d.ts" />

import ChannelManager = require("./ChannelManager");
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_OPTIONS = {durable: false, autoDelete: true};

export interface EventConstructorOptions {
  channelManager: ChannelManager
  exchange: string;
  topic: string;
}

export class Event {
  exchange: string;
  topic: string;
  static channelManager;

  constructor(options: EventConstructorOptions) {
    Event.channelManager = options.channelManager;
    this.exchange = options.exchange;
    this.topic = options. topic;
  }

  send(object: any) {
    return this.sendString(this.prepareMessage(object));
  }

  static getChannel() {
    return Event.channelManager.getChannel();
  }

  get fullExchangeName(): string {
    return EXCHANGE_PREFIX + this.exchange;
  }

  private assertExchange() {
    return Event.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.fullExchangeName, "direct", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  sendBuffer(buffer: Buffer) {
    return this.assertExchange().then((channel) => {
      channel.publish(this.fullExchangeName, this.topic, buffer, {
        contentType: "text/json"
      });
    });
  }

  sendString(string: String) {
    return this.sendBuffer(new Buffer(string));
  }

  prepareMessage(object: any) {
    var message = {
      exchange: this.exchange,
      topic: this.topic,
      content: object
    };

    return JSON.stringify(message);
  }
}