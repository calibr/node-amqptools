import { channelManager } from './ChannelManager'
import { Event } from "./Event";

export interface EventListenerConstructorOptions {
  exchange?: string;
  runtime?: string;
  topic?: string;
  queuePrefix?: string;
  queueOptions?: any;
  exchangeOptions?: any;
}

export class EventListener {
  exchange: string;
  topic: string;
  queue: string;
  queuePrefix: string;
  queueOptions: any;
  exchangeOptions: any;

  constructor(options: EventListenerConstructorOptions) {
    this.exchange = options.exchange;
    this.queuePrefix = options.queuePrefix;
    this.topic = options.topic;
    this.queueOptions = options.queueOptions;
    this.exchangeOptions = options.exchangeOptions;
    if (options.runtime) this.queue = this.queuePrefix + options.runtime + "_" + this.topic;
  }

  get queueName(): string {
    return this.queue;
  }

  get routeKey(): string {
    return this.topic;
  }

  set queueName(val: string) {
    this.queue = val;
  }

  private assertExchange() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.exchange, "topic", this.exchangeOptions,
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
        channel.bindQueue(this.queueName, this.exchange, this.routeKey, {},
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