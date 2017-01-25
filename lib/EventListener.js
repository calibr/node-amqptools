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
        this.persistent = false;
        this.exchange = options.exchange;
        this.topic = options.topic;
        this.userId = options.userId;
        this.queueOptions = QUEUE_OPTIONS;
        if (options.hasOwnProperty("persistent")) {
            this.persistent = options.persistent;
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
        return this.assertExchange()
            .then(function () { return _this.assertQueue(); })
            .then(function () { return _this.bindQueue(); })
            .then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.consume(_this.queueName, function (msg) {
                    var message = JSON.parse(msg.content.toString());
                    listener(message);
                    channel.ack(msg);
                });
                resolve(null);
            });
        });
    };
    return EventListener;
}());
exports.EventListener = EventListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9FdmVudExpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0Isa0JBQy9CLENBQUMsQ0FEZ0Q7QUFHakQsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLElBQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0FBQzVDLElBQU0sdUJBQXVCLEdBQUcscUJBQXFCLENBQUM7QUFDdEQsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUM7QUFDeEMsSUFBTSxhQUFhLEdBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO0FBQzVFLElBQU0sd0JBQXdCLEdBQUcsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBQyxDQUFDO0FBQ3ZGLElBQU0scUJBQXFCLEdBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUNuRSxJQUFNLGdCQUFnQixHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFVOUQ7SUFTRSx1QkFBWSxPQUF3QztRQUhwRCxlQUFVLEdBQVksS0FBSyxDQUFDO1FBSTFCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDM0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsYUFBYSxDQUFDO1FBQ2xDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lB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