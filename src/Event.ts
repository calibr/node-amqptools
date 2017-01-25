import { channelManager } from './ChannelManager'
import { Channel } from "amqplib/callback_api"

const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

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
        channel.assertExchange(this.fullExchangeName, "topic", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
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
        channel.publish(this.fullExchangeName, this.routeKey, buffer, {
          contentType: "text/json",
          persistent: true
        });
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