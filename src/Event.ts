import { channelManager } from './ChannelManager'
import { Channel } from "amqplib/callback_api"
import util = require("util");

const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

const debug = util.debuglog("amqptools");

export interface EventConstructorOptions {
  exchange: string
  topic: string
  userId?: string
}

export interface Message {
  exchange: string
  topic: string
  userId?: string
  content: any
}

export class Event {
  exchange:string;
  topic:string;
  userId:string;

  constructor(options:EventConstructorOptions) {
    this.exchange = options.exchange;
    this.userId = options.userId;
    this.topic = options.topic ? options.topic : 'nimbusEvent';
  }

  send(object:any) {
    return this.sendString(this.prepareMessage(object));
  }

  get fullExchangeName():string {
    if (this.userId) return EXCHANGE_EVENTS_BY_USER;
    return EXCHANGE_PREFIX + this.exchange;
  }

  get routeKey(): string {
    return this.exchange + '.' + this.topic + (this.userId ? '.' + this.userId : '');
  }

  private assertExchange() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        debug("Event, Asserting topic exchange %s with options %j", this.fullExchangeName, EXCHANGE_OPTIONS);
        channel.assertExchange(this.fullExchangeName, "topic", EXCHANGE_OPTIONS,
          (err) => {
            if (err) {
              debug("Event, Exchange %s assertion failed: %s", this.fullExchangeName, err.message);
            } else {
              debug("Event, Exchange %s asserted", this.fullExchangeName);
            }
            err ? reject(err) : resolve(channel)
          });
      })
    })
  }

  private assertExchangeForAllEvents() {
    return channelManager.getChannel().then((channel) => {
      if (this.userId) return channel;
      return new Promise((resolve, reject) => {
        channel.assertExchange(EXCHANGE_ALL_EVENTS, "topic", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private bindToExchangeForAllEvents() {
    return channelManager.getChannel().then((channel) => {
      if (this.userId) return channel;
      return new Promise<Channel>((resolve, reject) => {
        channel.bindExchange(EXCHANGE_ALL_EVENTS, this.fullExchangeName, "#", {},
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  sendBuffer(buffer) {
    return channelManager.getChannel()
      .then(() => this.assertExchange())
      .then(() => this.assertExchangeForAllEvents())
      .then(() => this.bindToExchangeForAllEvents())
      .then((channel) => {
        debug("Event, Publishing to exchange %s with route key %s", this.fullExchangeName, this.routeKey);
        const result = channel.publish(this.fullExchangeName, this.routeKey, buffer, {
          contentType: "text/json",
          persistent: true
        });
        debug("Event, Published to exchange %s with route key %s: %s", this.fullExchangeName, this.routeKey, result);
      });
  }

  sendString(string:string) {
    return this.sendBuffer(new Buffer(string));
  }

  prepareMessage(object:any) {
    var message:Message = {
      exchange: this.exchange,
      topic: this.topic,
      content: object
    };

    if (this.userId) message.userId = this.userId;

    return JSON.stringify(message);
  }
}