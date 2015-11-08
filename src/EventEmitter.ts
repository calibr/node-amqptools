/// <reference path="../typings/tsd.d.ts" />

import events = require("events")
import util = require("util")
import async = require("async")
import ChannelManager = require('./ChannelManager')
import Promise = require('bluebird')
import { Event } from "./Event";
import { EventListener } from "./EventListener";
import {Event} from "./Event";

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

class AMQPEventEmitter {
  runtime:string;
  ee:events.EventEmitter;
  eventsListeners:EventsListeners;
  static channelManager:ChannelManager;

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

  static getChannel() {
    return AMQPEventEmitter.channelManager.getChannel();
  }

  private preListen(event, cb) {
    var eParsed = parseEvent(event);

    if (this.eventsListeners[event]) {
      return cb(null);
    }

    var eventListener = new EventListener({
      exchange: eParsed.exchange,
      topic: eParsed.topic,
      channelManager: AMQPEventEmitter.channelManager,
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

    var event = new Event({
      channelManager: AMQPEventEmitter.channelManager,
      exchange: eParsed.exchange,
      topic: eParsed.topic
    });

    event.send(args);
  };
}

export = AMQPEventEmitter;