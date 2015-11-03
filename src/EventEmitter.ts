/// <reference path="../typings/tsd.d.ts" />

import events = require("events")
import util = require("util")
import async = require("async")
import ChannelManager = require('./ChannelManager')
import Promise = require('bluebird')

const EXCHANGE_PREFIX = "_event:";
const QUEUE_PREFIX = "_queue:";

var EventEmitter = events.EventEmitter,
  addListenerMethods = ["addListener", "on", "once"],
  copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];

function parseEvent(event) {
  var tmp = event.split(":");
  return {
    exchange: EXCHANGE_PREFIX + ":" + tmp[0],
    topic: tmp[1]
  };
}

interface EventsQueues {

}

class AMQPEventEmitter {
  runtime:string;
  ee:events.EventEmitter;
  eventsQueues:EventsQueues;
  static channelManager: ChannelManager;

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

  static getChannel () {
    return AMQPEventEmitter.channelManager.getChannel();
  }

  private preListen(event, cb) {
    AMQPEventEmitter.channelManager.connect(() => {
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

  private createQueue(event, cb?) {
    var eParsed = parseEvent(event);
    return AMQPEventEmitter.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        var queueName = QUEUE_PREFIX + this.runtime + ":" + eParsed.exchange;
        if (eParsed.topic) {
          queueName += ":" + eParsed.topic;
        }
        channel.assertQueue(queueName, {
          durable: false,
          autoDelete: true
        }, (err) => {
          if (err) return reject(err);

          channel.bindQueue(queueName, eParsed.exchange, eParsed.topic, {}, (err) => {
            if (err) return reject(err);

            this.eventsQueues[event] = queueName;
            channel.consume(queueName, (msg) => {
              var content = JSON.parse(msg.content.toString()),
                args = util.isArray(content) ? [event].concat(content) : [event, content];

              channel.ack(msg);
              this.ee.emit.apply(this.ee, args);
            });
            resolve(null);
          });
        });
      })
    }).nodeify(cb);
  };

  private assertExchange(name, cb?) {
    return AMQPEventEmitter.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(name, "direct", {
          durable: false,
          autoDelete: true
        }, (err) => err ? reject(err) : resolve(null));
      });
    }).nodeify(cb);
  };

  emit(event, ...args:any[]) {
    var eParsed = parseEvent(event);
    this.preListen(event, (err) => {
      if (!err) {
        return AMQPEventEmitter.getChannel().then((channel) => {
          var buffer = new Buffer(JSON.stringify(args));

          channel.publish(eParsed.exchange, eParsed.topic, buffer, {
            contentType: "text/json"
          });
        });
      }
    });
  };
}

export = AMQPEventEmitter;