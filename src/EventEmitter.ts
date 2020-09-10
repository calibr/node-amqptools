import * as events from "events";
import * as util from "util";
import * as async from "async";
import { channelManager } from './ChannelManager';
import { Event } from "./Event";
import { EventListener } from "./EventListener";
import { promiseNodeify } from './promise-nodeify';

var EventEmitter = events.EventEmitter,
  addListenerMethods = ["addListener", "on", "once"],
  copyMethods = ["removeAllListeners", "setMaxListeners", "listeners"];

function parseEvent(event) {
  var tmp = event.split(":");
  return {
    exchange: tmp[0],
    topic: tmp[1]
  };
}

export interface EventsListeners {
  [index: string]: EventListener
}

export interface EventOptions {
  event: string
  persistent?: boolean
  autoAck?: boolean
  prefetchCount?: number
}

export class AMQPEventEmitter {
  runtime: string;
  ee: events.EventEmitter;
  private eventsListeners: EventsListeners;
  public nowProcessingEvents: Map

  onStartProcesEvent(data) {
    this.nowProcessingEvents.set(data, true)

    this.emit('event-start', data)
  }

  onEndProcessEvent(data, err) {
    this.nowProcessingEvents.delete(data)

    this.emit('event-end', data)
  }

  constructor(runtime) {
    this.runtime = runtime || "";
    this.ee = new EventEmitter();
    this.eventsListeners = {};
    this.nowProcessingEvents = new Map()

    addListenerMethods.forEach((method) => {
      this[method] = (options, eventFn, eventSetCb) => {
        const cb = (...args) => {
          this.onStartProcesEvent(args)
          const listenerResult = eventFn(...args)
          if (listenerResult instanceof Promise) {
            listenerResult.then(() => {
              this.onEndProcessEvent(args)
            }).catch(() => {
              this.onEndProcessEvent(args)
            })
          } else {
            this.onEndProcessEvent(args)
          }
        }
        cb.fn = eventFn
        if (typeof options === "string") {
          options = {
            event: options
          };
        }
        let event = options.event;
        if (["newListener", "removeListener"].indexOf(event) !== -1) {
          return this.ee[method].call(this.ee, event, cb);
        }
        // add listener to the event emitter before attaching to queue in order to be ready if messages are received
        // before preListen callback is called
        this.ee[method].call(this.ee, event, cb);
        return this.preListen(options, (err) => {
          if (err) {
            this.removeListener(event, eventFn)
            if (!eventSetCb) {
              // throw error here if no callback is set, it will be right in most of the cases because apps rely heavily
              // on the rabbitmq connection, no connection means broken app
              throw err
            }
          }
          if (eventSetCb) {
            eventSetCb(err);
          }
        });
      };
    });

    copyMethods.forEach((method) => {
      this[method] = (...args: any[]) => {
        this.ee[method].apply(this.ee, args);
      };
    });
  }

  private preListen(options, cb) {
    var event = options.event;
    var eParsed = parseEvent(event);

    if (this.eventsListeners[event]) {
      return cb(null);
    }

    Object.assign(options, {
      exchange: eParsed.exchange,
      topic: eParsed.topic,
      runtime: this.runtime
    })
    var eventListener = new EventListener(options, this);

    this.eventsListeners[event] = eventListener;
    let promise = eventListener.listen((message, extra) => {
      var content = message.content;
      if (Array.isArray(content) && content.length === 1 && content[0].context && content[0].message) {
        // old formatted message
        content = content[0];
      }
      return this.ee.emit.call(this.ee, event, content, extra);
    });

    return promiseNodeify(promise, cb);
  }

  emit(event, data) {
    var eParsed = parseEvent(event);

    var amqpEvent = new Event({
      exchange: eParsed.exchange,
      topic: eParsed.topic
    });

    amqpEvent.send(data);
  };

  getListenerForFn(event: string, fn: Function) {
    for (const listener of this.ee.listeners(event)) {
      if (listener.fn === fn) {
        return listener
      }
    }
    return null
  }

  addListener(event: string | EventOptions, listener: Function, cb?: Function) { };
  on(event: string | EventOptions, listener: Function, cb?: Function) { };
  once(event: string | EventOptions, listener: Function, cb?: Function) { };
  removeListener(event: string, fn: Function) {
    const listener = this.getListenerForFn(event, fn)
    if (!listener) {
      return
    }
    this.ee.removeListener(event, listener)
  }
  removeAllListeners(event?: string) { };
  setMaxListeners(n: number) { };
  listeners(event: string) { };
}