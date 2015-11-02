/// <reference path="../typings/tsd.d.ts" />

import events = require("events")
import util = require("util")
import async = require("async")

const EXCHANGE_PREFIX = "_event:";
const QUEUE_PREFIX = "_queue:";

var EventEmitter = events.EventEmitter,
  addListenerMethods = ["addListener", "on", "once"],
  copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];

var channel = null;

function parseEvent(event) {
  var tmp = event.split(":");
  return {
    exchange: EXCHANGE_PREFIX + ":" + tmp[0],
    topic: tmp[1]
  };
}

function _getChannel(cb) {
  cb(null, channel);
}

interface EventsQueues {

}

class AMQPEventEmitter {
  runtime:string;
  ee:events.EventEmitter;
  eventsQueues:EventsQueues;

  constructor(runtime) {
    this.runtime = runtime || "";
    this.ee = new EventEmitter();
    this.eventsQueues = {};

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

    copyMethods.forEach((method) =>{
      this[method] = (...args:any[]) => {
        this.ee[method].apply(this.ee, args);
      };
    });
  }

  static _connect(cb?:(channel) => void) {
    throw new Error('Need to set tasks connect function');
  }

  private preListen(event, cb) {
    AMQPEventEmitter._connect(() => {
      var eParsed = parseEvent(event);
      this.assertExchange(eParsed.exchange, (err) => {
        if (err) return cb(err);

        async.series([
          (next) => {
            if (this.eventsQueues[event]) {
              return next();
            }
            this.createQueue(event, (err) => {
              if (err) return cb(err);
              next();
            });
          },
          () => cb(null)
        ]);
      });
    });
  };

  private createQueue(event, cb) {
    var eParsed = parseEvent(event);
    _getChannel((err, chan) => {
      if (err) return cb(err);

      var queueName = QUEUE_PREFIX + this.runtime + ":" + eParsed.exchange;
      if (eParsed.topic) {
        queueName += ":" + eParsed.topic;
      }
      chan.assertQueue(queueName, {
        durable: false,
        autoDelete: true
      }, (err, attrs) => {
        if (err) return cb(err);

        chan.bindQueue(queueName, eParsed.exchange, eParsed.topic, {}, (err) => {
          if (err) return cb(err);

          this.eventsQueues[event] = queueName;
          chan.consume(queueName, (msg) => {
            var content = JSON.parse(msg.content.toString()),
              args = util.isArray(content) ? [event].concat(content) : [event, content];

            chan.ack(msg);
            this.ee.emit.apply(this.ee, args);
          });
          cb(null);
        });
      });
    });
  };

  private assertExchange(name, cb) {
    _getChannel((err, chan) => {
      if (err) return cb(err);

      chan.assertExchange(name, "direct", {
        durable: false,
        autoDelete: true
      }, (err) => cb(err));
    });
  };

  emit(event, ...args:any[]) {
    var eParsed = parseEvent(event);
    this.preListen(event, (err) => {
      if (!err) {
        _getChannel((err, chan) => {
          if (err) return;
          var buffer = new Buffer(JSON.stringify(args));

          chan.publish(eParsed.exchange, eParsed.topic, buffer, {
            contentType: "text/json"
          });
        });
      }
    });
  };

  static setChannel(_channel) {
    channel = _channel;
  };
}

export = AMQPEventEmitter;