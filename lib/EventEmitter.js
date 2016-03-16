"use strict";
var events = require("events");
var util = require("util");
var Event_1 = require("./Event");
var EventListener_1 = require("./EventListener");
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
            _this[method] = function (event, cb, eventSetCb) {
                if (["newListener", "removeListener"].indexOf(event) !== -1) {
                    return _this.ee[method].call(_this.ee, event, cb);
                }
                _this.preListen(event, function (err) {
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
    AMQPEventEmitter.prototype.preListen = function (event, cb) {
        var _this = this;
        var eParsed = parseEvent(event);
        if (this.eventsListeners[event]) {
            return cb(null);
        }
        var eventListener = new EventListener_1.EventListener({
            exchange: eParsed.exchange,
            topic: eParsed.topic,
            runtime: this.runtime
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRFbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0V2ZW50RW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxNQUFNLFdBQU0sUUFDeEIsQ0FBQyxDQUQrQjtBQUNoQyxJQUFZLElBQUksV0FBTSxNQUN0QixDQUFDLENBRDJCO0FBSTVCLHNCQUFzQixTQUN0QixDQUFDLENBRDhCO0FBQy9CLDhCQUE4QixpQkFFOUIsQ0FBQyxDQUY4QztBQUUvQyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxFQUNwQyxrQkFBa0IsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQ2xELFdBQVcsR0FBRyxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRXpGLG9CQUFvQixLQUFLO0lBQ3ZCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDO1FBQ0wsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDZCxDQUFDO0FBQ0osQ0FBQztBQU1EO0lBS0UsMEJBQVksT0FBTztRQUxyQixpQkF5RUM7UUFuRUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUUxQixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNO1lBQ2hDLEtBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsVUFBVTtnQkFDbkMsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENB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