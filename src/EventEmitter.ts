import * as events from "events"
import * as util from "util"
import * as async from "async"
import { channelManager } from './ChannelManager'
import * as Promise from 'bluebird'
import { Event } from "./Event"
import { EventListener } from "./EventListener"

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

class AMQPEventEmitter{
  runtime:string;
  ee:events.EventEmitter;
  private eventsListeners:EventsListeners;

  constructor(runtime) {
    this.runtime = runtime || "";
    this.ee = new EventEmitter();
    this.eventsListeners = {};

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
      exchange: eParsed.exchange,
      topic: eParsed.topic,
      runtime: this.runtime
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
      exchange: eParsed.exchange,
      topic: eParsed.topic
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