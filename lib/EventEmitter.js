"use strict";
var events = require("events");
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
        return eventListener.listen(function (message, extra) {
            var content = message.content;
            _this.ee.emit.call(_this.ee, event, content, extra);
        }).nodeify(cb);
    };
    AMQPEventEmitter.prototype.emit = function (event, data) {
        var eParsed = parseEvent(event);
        var amqpEvent = new Event_1.Event({
            exchange: eParsed.exchange,
            topic: eParsed.topic
        });
        amqpEvent.send(data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRFbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0V2ZW50RW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsSUFBWSxNQUFNLFdBQU0sUUFDeEIsQ0FBQyxDQUQrQjtBQUtoQyxzQkFBc0IsU0FDdEIsQ0FBQyxDQUQ4QjtBQUMvQiw4QkFBOEIsaUJBQzlCLENBQUMsQ0FEOEM7QUFDL0MsSUFBWSxDQUFDLFdBQU0sUUFFbkIsQ0FBQyxDQUYwQjtBQUUzQixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxFQUNwQyxrQkFBa0IsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQ2xELFdBQVcsR0FBRyxDQUFDLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBRXpGLG9CQUFvQixLQUFLO0lBQ3ZCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsTUFBTSxDQUFDO1FBQ0wsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDZCxDQUFDO0FBQ0osQ0FBQztBQVlEO0lBS0UsMEJBQVksT0FBTztRQUxyQixpQkE4RUM7UUF4RUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUUxQixrQkFBa0IsQ0FBQyxPQUFPLENBQUMsVUFBQyxNQUFNO1lBQ2hDLEtBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVTtnQkFDckMsRUFBRSxDQUFBLENBQUMsT0FBTyxPQUFPLEtBQUssUUFBUSxDQUFD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