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
  copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];

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

interface EventOptions {
  event: string
  persistent?: boolean
  autoAck?: boolean
}

export class AMQPEventEmitter{
  runtime:string;
  ee:events.EventEmitter;
  private eventsListeners:EventsListeners;

  constructor(runtime) {
    this.runtime = runtime || "";
    this.ee = new EventEmitter();
    this.eventsListeners = {};

    addListenerMethods.forEach((method) => {
      this[method] = (options, cb, eventSetCb) => {
        if(typeof options === "string") {
          options = {
            event: options
          };
        }
        let event = options.event;
        if (["newListener", "removeListener"].indexOf(event) !== -1) {
          return this.ee[method].call(this.ee, event, cb);
        }
        return this.preListen(options, (err) => {
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

  private preListen(options, cb) {
    var event = options.event;
    var eParsed = parseEvent(event);

    if (this.eventsListeners[event]) {
      return cb(null);
    }
    _.extend(options, {
      exchange: eParsed.exchange,
      topic: eParsed.topic,
      runtime: this.runtime
    });
    var eventListener = new EventListener(options);

    this.eventsListeners[event] = eventListener;
    return eventListener.listen((message, extra) => {
      var content = message.content;
      this.ee.emit.call(this.ee, event, content, extra);
    }).nodeify(cb);
  }

  emit(event, data) {
    var eParsed = parseEvent(event);

    var amqpEvent = new Event({
      exchange: eParsed.exchange,
      topic: eParsed.topic
    });

    amqpEvent.send(data);
  };

  addListener(event: string|EventOptions, listener: Function, cb?: Function) {};
  on(event: string|EventOptions, listener: Function, cb?: Function) {};
  once(event: string|EventOptions, listener: Function, cb?: Function) {};
  removeListener(event: string, listener: Function) {};
  removeAllListeners(event?: string) {};
  setMaxListeners(n: number) {};
  listeners(event: string) {};
}