import { channelManager } from './ChannelManager'
import { Event } from "./Event";
import {Options} from "amqplib/properties";
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
const QUEUE_PREFIX = "nimbus:listener:";
const QUEUE_OPTIONS =  { durable: false, autoDelete: true, exclusive: true};
const QUEUE_RUNTIME_OPTIONS =  { durable: false, autoDelete: true};
const EXCHANGE_OPTIONS = { durable: true, autoDelete: false };

export interface EventListenerConstructorOptions {
  exchange?: string;
  runtime?: string;
  topic?: string;
  userId?: string;
}

export class EventListener {
  exchange: string;
  topic: string;
  queue: string;
  userId: string;
  private queueOptions: Options.AssertQueue;

  constructor(options: EventListenerConstructorOptions) {
    this.exchange = options.exchange;
    this.topic = options.topic;
    this.userId = options.userId;
    this.queueOptions = QUEUE_OPTIONS;
    if (options.runtime) {
      this.queue = QUEUE_PREFIX + options.runtime +
        (this.exchange ? ':' + this.exchange : '') +
        (this.topic ? ':' + this.topic : '');
      this.queueOptions = QUEUE_RUNTIME_OPTIONS;
    }
  }

  get fullExchangeName(): string {
    if (this.userId) {
      return EXCHANGE_EVENTS_BY_USER;
    }
    return this.exchange ? EXCHANGE_PREFIX + this.exchange : EXCHANGE_ALL_EVENTS;
  }

  get queueName(): string {
    return this.queue;
  }

  get routeKey(): string {
    if (!this.topic && !this.exchange && !this.userId) return '#';
    return [this.exchange, this.topic]
      .map(str => (str  ? str : '*'))
      .join('.')
      .concat(this.userId ? '.' + this.userId : '');
  }

  set queueName(val: string) {
    this.queue = val;
  }

  private assertExchange() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.fullExchangeName, "topic", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private assertQueue() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertQueue(this.queueName, this.queueOptions, (err, ok) => {
          if (err) return reject(err);
          this.queueName = ok.queue;
          resolve(channel);
        });
      })
    })
  }

  private bindQueue() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.bindQueue(this.queueName, this.fullExchangeName, this.routeKey, {},
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  listen(listener: (message) => void) {
    return this.assertExchange()
      .then(() => this.assertQueue())
      .then(() => this.bindQueue())
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