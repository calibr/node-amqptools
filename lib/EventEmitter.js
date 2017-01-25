"use strict";
var events = require("events");
var util = require("util");
var Event_1 = require("./Event");
var EventListener_1 = require("./EventListener");
var _ = require("lodash");
var EventEmitter = events.EventEmitter, addListenerMethods = ["addListener", "on", "once"], copyMethods = ["removeListener", "removeAllListeners", "setMaxListeners", "listeners"];
function parseEvent(event) {
    var tmp = event.split(":");
    return {
        exchange: tmp[0],
        topic: tmp[1]
    };
}
var AMQPEventEmitter = (function () {
    function AMQPEventEmitter(runtime) {
        var _this = this;
        this.runtime = runtime || "";
        this.ee = new EventEmitter();
        this.eventsListeners = {};
        addListenerMethods.forEach(function (method) {
            _this[method] = function (options, cb, eventSetCb) {
                if (typeof options === "string") {
                    options = {
                        event: options
                    };
                }
                var event = options.event;
                if (["newListener", "removeListener"].indexOf(event) !== -1) {
                    return _this.ee[method].call(_this.ee, event, cb);
                }
                _this.preListen(options, function (err) {
                    if (!err) {
                        _this.ee[method].call(_this.ee, event, cb);
                    }
                    if (eventSetCb) {
                        eventSetCb(err);
                    }
                });
            };
        });
        copyMethods.forEach(function (method) {
            _this[method] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i - 0] = arguments[_i];
                }
                _this.ee[method].apply(_this.ee, args);
            };
        });
    }
    AMQPEventEmitter.prototype.preListen = function (options, cb) {
        var _this = this;
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
        return eventListener.listen(function (message) {
            var content = message.content, args = util.isArray(content) ? [event].concat(content) : [event, content];
            _this.ee.emit.apply(_this.ee, args);
        }).nodeify(cb);
    };
    AMQPEventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var eParsed = parseEvent(event);
        var amqpEvent = new Event_1.Event({
            exchange: eParsed.exchange,
            topic: eParsed.topic
        });
        amqpEvent.send(args);
    };
    ;
    AMQPEventEmitter.prototype.addListener = function (event, listener, cb) { };
    ;
    AMQPEventEmitter.prototype.on = function (event, listener, cb) { };
    ;
    AMQPEventEmitter.prototype.once = function (event, listener, cb) { };
    ;
    AMQPEventEmitter.prototype.removeListener = function (event, listener) { };
    ;
    AMQPEventEmitter.prototype.removeAllListeners = function (event) { };
    ;
    AMQPEventEmitter.prototype.setMaxListeners = function (n) { };
    ;
    AMQPEventEmitter.prototype.listeners = function (event) { };
    ;
    return AMQPEventEmitter;
}());
exports.AMQPEventEmitter = AMQPEventEmitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRFbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0V2ZW50RW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxNQUFNLFdBQU0sUUFDeEIsQ0FBQyxDQUQrQjtBQUNoQyxJQUFZLElBQUksV0FBTSxNQUN0QixDQUFDLENBRDJCO0FBSTVCLHNCQUFzQixTQUN0QixDQUFDLENBRDhCO0FBQy9CLDhCQUE4QixpQkFDOUIsQ0FBQyxDQUQ4QztBQUMvQyxJQUFZLENBQUMsV0FBTSxRQUVuQixDQUFDLENBRjBCO0FBRTNCLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQ3BDLGtCQUFrQixHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFDbEQsV0FBVyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFFekYsb0JBQW9CLEtBQUs7SUFDdkIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUM7UUFDTCxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNkLENBQUM7QUFDSixDQUFDO0FBV0Q7SUFLRSwwQkFBWSxPQUFPO1FBTHJCLGlCQWdGQztRQTFFRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBRTFCLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFDaEMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLFVBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVO2dCQUNyQyxF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