import { channelManager } from './ChannelManager'
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

export interface EventConstructorOptions {
  exchange: string;
  topic: string;
}

export class Event {
  exchange:string;
  topic:string;

  constructor(options:EventConstructorOptions) {
    this.exchange = options.exchange;
    this.topic = options.topic ? options.topic : 'nimbusEvent';
  }

  send(object:any) {
    return this.sendString(this.prepareMessage(object));
  }

  get fullExchangeName():string {
    return EXCHANGE_PREFIX + this.exchange;
  }

  get routeKey(): string {
    return this.exchange + '.' + this.topic
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
      return new Promise((resolve, reject) => {
        channel.assertExchange(EXCHANGE_ALL_EVENTS, "topic", EXCHANGE_OPTIONS,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private bindToExchangeForAllEvents() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
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
          contentType: "text/json"
        });
      });
  }

  sendString(string:string) {
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