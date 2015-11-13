import { channelManager } from './ChannelManager'
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

export interface EventConstructorOptions {
  exchange: string;
  topic: string;
  exchangeOptions: any;
}

export class Event {
  exchange:string;
  topic:string;
  exchangeOptions:any;

  constructor(options:EventConstructorOptions) {
    this.exchange = options.exchange;
    this.topic = options.topic ? options.topic : 'nimbusEvent';
    this.exchangeOptions = options.exchangeOptions;
  }

  send(object:any) {
    return this.sendString(this.prepareMessage(object));
  }

  get routeKey(): string {
    return this.topic
  }

  private assertExchange() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.exchange, "topic", this.exchangeOptions,
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  sendBuffer(buffer) {
    return channelManager.getChannel()
      .then(() => this.assertExchange())
      .then((channel) => {
        channel.publish(this.exchange, this.routeKey, buffer, {
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