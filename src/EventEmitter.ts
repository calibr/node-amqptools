import * as events from "events"
import * as util from "util"
import * as async from "async"
import { channelManager } from './ChannelManager'
import * as Promise from 'bluebird'
import { Event } from "./Event"
import { EventListener } from "./EventListener"
import * as _ from "lodash"

var EventEmitter = events.EventEmitter,
  addListenerMethods = ["addListener", "on", "once"],
  copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"],
  defaultOptions = {
    exchange: 'nimbus:events',
    queuePrefix: 'nimbus:listener:'
  },
  defaultQueueOptions = {
    durable: false, autoDelete: true, exclusive: true
  },
  defaultExchangeOptions = {
    durable: true, autoDelete: false
  };

function parseEvent(event) {
  var tmp = event.split(":");
  return {
    exchange: tmp[0],
    topic: tmp[1]
  };
}

interface EventsListeners {
  [index: string]: EventListener
}

export interface ExchangeOptions {
  durable?: boolean;
  autoDelete?: boolean;
}

export interface QueueOptions {
  durable?: boolean;
  autoDelete?: boolean;
  exclusive?: boolean;
}

export interface EventEmitterOptions {
  exchange?: string;
  queuePrefix?: string;
  queueOptions?: QueueOptions;
  exchangeOptions?: ExchangeOptions;
}

class AMQPEventEmitter{
  runtime:string;
  options:EventEmitterOptions;
  ee:events.EventEmitter;
  private eventsListeners:EventsListeners;

  constructor(runtime, options?: EventEmitterOptions) {
    this.runtime = runtime || "";
    this.ee = new EventEmitter();
    this.eventsListeners = {};
    this.options = options || {};
    if(!this.options.queueOptions) {
      this.options.queueOptions = {};
    }
    if(!this.options.exchangeOptions) {
      this.options.exchangeOptions = {};
    }
    _.defaults(this.options, defaultOptions);
    _.defaults(this.options.queueOptions, defaultQueueOptions);
    _.defaults(this.options.exchangeOptions, defaultExchangeOptions);

    addListenerMethods.forEach((method) => {
      this[method] = (event, cb, eventSetCb) => {
        if (["newListener", "removeListener"].indexOf(event) !== -1) {
          return this.ee[method].call(this.ee, event, cb);
        }
        this.preListen(event, (err) => {
          if (!err) {
            this.ee[method].call(this.ee, event, cb);
          }
          if (eventSetCb) {
            eventSetCb(err);
          }
        });
      };
    });

    copyMethods.forEach((method) => {
      this[method] = (...args:any[]) => {
        this.ee[method].apply(this.ee, args);
      };
    });
  }

  private preListen(event, cb) {
    var eParsed = parseEvent(event);

    if (this.eventsListeners[event]) {
      return cb(null);
    }

    var eventListener = new EventListener({
      exchange: this.options.exchange,
      topic: event,
      runtime: this.runtime,
      queuePrefix: this.options.queuePrefix,
      queueOptions: this.options.queueOptions,
      exchangeOptions: this.options.exchangeOptions,
    });

    this.eventsListeners[event] = eventListener;
    return eventListener.listen((message) => {
      var content = message.content,
        args = util.isArray(content) ? [event].concat(content) : [event, content];
      this.ee.emit.apply(this.ee, args);
    }).nodeify(cb);
  }

  emit(event, ...args:any[]) {
    var eParsed = parseEvent(event);

    var amqpEvent = new Event({
      exchange: this.options.exchange,
      topic: event,
      exchangeOptions: this.options.exchangeOptions
    });

    amqpEvent.send(args);
  };

  addListener(event: string, listener: Function) {};
  on(event: string, listener: Function) {};
  once(event: string, listener: Function) {};
  removeListener(event: string, listener: Function) {};
  removeAllListeners(event?: string) {};
  setMaxListeners(n: number) {};
  listeners(event: string) {};
}

export = AMQPEventEmitter;