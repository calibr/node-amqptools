import { channelManager } from './ChannelManager'
import { Channel } from "amqplib/callback_api"
import {Options} from "amqplib/properties";
import { AMQPEventEmitter } from './EventEmitter'
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
const QUEUE_PREFIX = "nimbus:listener:";
const QUEUE_OPTIONS =  { durable: false, autoDelete: true, exclusive: true};
const PERSISTENT_QUEUE_OPTIONS = { durable: true, autoDelete: false, exclusive: false};
const QUEUE_RUNTIME_OPTIONS =  { durable: false, autoDelete: true};
const EXCHANGE_OPTIONS = { durable: true, autoDelete: false };

import util = require("util");

var debug = util.debuglog("amqptools");

export interface EventListenerConstructorOptions {
  exchange?: string;
  runtime?: string;
  topic?: string;
  userId?: string;
  persistent?: boolean;
  autoAck?: boolean;
  prefetchCount?: number;
}

export interface MessageExtra {
  ack?: () => void
}

export interface ListenerFunc {
  (message: any, extra: MessageExtra): void | Promise
}

export class EventListener {
  exchange: string;
  topic: string;
  queue: string;
  userId: string;
  // listener queue wont be removed after client disconnects(durable + no auto-delete)
  persistent: boolean = false;
  // auto-ack event message
  autoAck: boolean = true;
  prefetchCount: number;
  private listener: ListenerFunc;
  private queueOptions: Options.AssertQueue;
  private consumerTag: string;
  private eventEmitter: AMQPEventEmitter;

  constructor(options: EventListenerConstructorOptions, eventEmitter: AMQPEventEmitter) {
    this.exchange = options.exchange;
    this.topic = options.topic;
    this.userId = options.userId;
    this.queueOptions = QUEUE_OPTIONS;
    this.prefetchCount = options.prefetchCount || 1
    if (!eventEmitter) {
      throw new Error('eventEmitter is required for EventListener')
    }
    this.eventEmitter = eventEmitter
    if(options.hasOwnProperty("persistent")) {
      this.persistent = options.persistent;
    }
    if(options.hasOwnProperty("autoAck")) {
      this.autoAck = options.autoAck;
    }
    if (options.runtime) {
      this.queue = QUEUE_PREFIX + options.runtime +
        (this.exchange ? ':' + this.exchange : '') +
        (this.topic ? ':' + this.topic : '');
      this.queueOptions = QUEUE_RUNTIME_OPTIONS;
      if(this.persistent) {
        this.queueOptions = PERSISTENT_QUEUE_OPTIONS;
      }
    }

    channelManager.on("reconnect", this.onReconnect);
  }

  onReconnect = () => {
    debug("Trying to re establish consuming on event queue %s", this.queueName);
    this.consume();
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
      return new Promise<Channel>((resolve, reject) => {
        channel.bindQueue(this.queueName, this.fullExchangeName, this.routeKey, {},
          (err) => err ? reject(err) : resolve(channel));
      })
    })
  }

  private ack(msg) {
    return channelManager.getChannel().then((channel) => {
      channel.ack(msg);
    });
  }

  private onMessageReceived = (msg) => {
    var message = JSON.parse(msg.content.toString());
    var extra: MessageExtra = {};
    if(this.autoAck) {
      this.ack(msg);
    }
    else {
      extra.ack = () => {
        this.ack(msg);
      };
    }
    this.listener(message, extra);
  }

  private consume() {
    let _this = this;
    return this.assertExchange()
      .then(() => this.assertQueue())
      .then(() => this.bindQueue())
      .then((channel) => {
        channel.prefetch(this.prefetchCount)
        channel.consume(this.queueName, this.onMessageReceived, undefined, function (err, ok) {
          if(err) {
            console.error("Fail to consume on queue " + _this.queueName, err)
            throw err
          }
          _this.consumerTag = ok.consumerTag;
        });
      });
  }

  listen(listener: (message, extra?) => void) {
    if(this.listener) {
      throw new Error("Listener is already set");
    }
    this.listener = listener;
    return this.consume();
  }

  cancel() {
    channelManager.getChannel().then((channel) => {
      channel.cancel(this.consumerTag);
      channelManager.removeListener("reconnect", this.onReconnect);
    }) 
  }
}