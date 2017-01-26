"use strict";
var ChannelManager_1 = require('./ChannelManager');
var EXCHANGE_PREFIX = "nimbus:event:";
var EXCHANGE_ALL_EVENTS = "nimbus:events";
var EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
var QUEUE_PREFIX = "nimbus:listener:";
var QUEUE_OPTIONS = { durable: false, autoDelete: true, exclusive: true };
var PERSISTENT_QUEUE_OPTIONS = { durable: true, autoDelete: false, exclusive: false };
var QUEUE_RUNTIME_OPTIONS = { durable: false, autoDelete: true };
var EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
var EventListener = (function () {
    function EventListener(options) {
        var _this = this;
        this.persistent = false;
        this.autoAck = true;
        this.onMessageReceived = function (msg) {
            var message = JSON.parse(msg.content.toString());
            var extra = {};
            if (_this.autoAck) {
                _this.channel.ack(msg);
            }
            else {
                extra.ack = function () {
                    _this.channel.ack(msg);
                };
            }
            _this.listener(message, extra);
        };
        this.exchange = options.exchange;
        this.topic = options.topic;
        this.userId = options.userId;
        this.queueOptions = QUEUE_OPTIONS;
        if (options.hasOwnProperty("persistent")) {
            this.persistent = options.persistent;
        }
        if (options.hasOwnProperty("autoAck")) {
            this.autoAck = options.autoAck;
        }
        if (options.runtime) {
            this.queue = QUEUE_PREFIX + options.runtime +
                (this.exchange ? ':' + this.exchange : '') +
                (this.topic ? ':' + this.topic : '');
            this.queueOptions = QUEUE_RUNTIME_OPTIONS;
            if (this.persistent) {
                this.queueOptions = PERSISTENT_QUEUE_OPTIONS;
            }
        }
    }
    Object.defineProperty(EventListener.prototype, "fullExchangeName", {
        get: function () {
            if (this.userId) {
                return EXCHANGE_EVENTS_BY_USER;
            }
            return this.exchange ? EXCHANGE_PREFIX + this.exchange : EXCHANGE_ALL_EVENTS;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventListener.prototype, "queueName", {
        get: function () {
            return this.queue;
        },
        set: function (val) {
            this.queue = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventListener.prototype, "routeKey", {
        get: function () {
            if (!this.topic && !this.exchange && !this.userId)
                return '#';
            return [this.exchange, this.topic]
                .map(function (str) { return (str ? str : '*'); })
                .join('.')
                .concat(this.userId ? '.' + this.userId : '');
        },
        enumerable: true,
        configurable: true
    });
    EventListener.prototype.assertExchange = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.assertExchange(_this.fullExchangeName, "topic", EXCHANGE_OPTIONS, function (err) { return err ? reject(err) : resolve(channel); });
            });
        });
    };
    EventListener.prototype.assertQueue = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.assertQueue(_this.queueName, _this.queueOptions, function (err, ok) {
                    if (err)
                        return reject(err);
                    _this.queueName = ok.queue;
                    resolve(channel);
                });
            });
        });
    };
    EventListener.prototype.bindQueue = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.bindQueue(_this.queueName, _this.fullExchangeName, _this.routeKey, {}, function (err) { return err ? reject(err) : resolve(channel); });
            });
        });
    };
    EventListener.prototype.listen = function (listener) {
        var _this = this;
        if (this.listener) {
            throw new Error("Listener is already set");
        }
        this.listener = listener;
        return this.assertExchange()
            .then(function () { return _this.assertQueue(); })
            .then(function () { return _this.bindQueue(); })
            .then(function (channel) {
            _this.channel = channel;
            channel.consume(_this.queueName, _this.onMessageReceived, undefined);
        });
    };
    return EventListener;
}());
exports.EventListener = EventListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9FdmVudExpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0Isa0JBQy9CLENBQUMsQ0FEZ0Q7QUFHakQsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLElBQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0FBQzVDLElBQU0sdUJBQXVCLEdBQUcscUJBQXFCLENBQUM7QUFDdEQsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUM7QUFDeEMsSUFBTSxhQUFhLEdBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO0FBQzVFLElBQU0sd0JBQXdCLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDO0FBQ3ZGLElBQU0scUJBQXFCLEdBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUNuRSxJQUFNLGdCQUFnQixHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFtQjlEO0lBYUUsdUJBQVksT0FBd0M7UUFidEQsaUJBbUhDO1FBN0dDLGVBQVUsR0FBWSxLQUFLLENBQUM7UUFFNUIsWUFBTyxHQUFZLElBQUksQ0FBQztRQWdGaEIsc0JBQWlCLEdBQUcsVUFBQyxHQUFHO1lBQzlCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pELElBQUksS0FBSyxHQUFpQixFQUFFLENBQUM7WUFDN0IsRUFBRSxDQUFBLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2hCLEtB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