"use strict";
const events = require("events");
const Event_1 = require("./Event");
const EventListener_1 = require("./EventListener");
const _ = require("lodash");
var EventEmitter = events.EventEmitter, addListenerMethods = ["addListener", "on", "once"], copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];
function parseEvent(event) {
    var tmp = event.split(":");
    return {
        exchange: tmp[0],
        topic: tmp[1]
    };
}
class AMQPEventEmitter {
    constructor(runtime) {
        this.runtime = runtime || "";
        this.ee = new EventEmitter();
        this.eventsListeners = {};
        addListenerMethods.forEach((method) => {
            this[method] = (options, cb, eventSetCb) => {
                if (typeof options === "string") {
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
            this[method] = (...args) => {
                this.ee[method].apply(this.ee, args);
            };
        });
    }
    preListen(options, cb) {
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
        var eventListener = new EventListener_1.EventListener(options);
        this.eventsListeners[event] = eventListener;
        return eventListener.listen((message, extra) => {
            var content = message.content;
            if (Array.isArray(content) && content.length === 1 && content[0].context && content[0].message) {
                content = content[0];
            }
            this.ee.emit.call(this.ee, event, content, extra);
        }).nodeify(cb);
    }
    emit(event, data) {
        var eParsed = parseEvent(event);
        var amqpEvent = new Event_1.Event({
            exchange: eParsed.exchange,
            topic: eParsed.topic
        });
        amqpEvent.send(data);
    }
    ;
    addListener(event, listener, cb) { }
    ;
    on(event, listener, cb) { }
    ;
    once(event, listener, cb) { }
    ;
    removeListener(event, listener) { }
    ;
    removeAllListeners(event) { }
    ;
    setMaxListeners(n) { }
    ;
    listeners(event) { }
    ;
}
exports.AMQPEventEmitter = AMQPEventEmitter;
//# sourceMappingURL=EventEmitter.js.map