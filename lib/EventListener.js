"use strict";
var ChannelManager_1 = require('./ChannelManager');
var EXCHANGE_PREFIX = "nimbus:event:";
var EXCHANGE_ALL_EVENTS = "nimbus:events";
var EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
var QUEUE_PREFIX = "nimbus:listener:";
var QUEUE_OPTIONS = { durable: false, autoDelete: true, exclusive: true };
var QUEUE_RUNTIME_OPTIONS = { durable: false, autoDelete: true };
var EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
var EventListener = (function () {
    function EventListener(options) {
        this.exchange = options.exchange;
        this.topic = options.topic;
        this.userId = options.userId;
        this.queueOptions = QUEUE_OPTIONS;
        if (options.runtime) {
            this.queue = QUEUE_PREFIX + options.runtime +
                (this.exchange ? ':' + this.exchange : '') +
                (this.topic ? ':' + this.topic : '');
            this.queueOptions = QUEUE_RUNTIME_OPTIONS;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9FdmVudExpc3RlbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0Isa0JBQy9CLENBQUMsQ0FEZ0Q7QUFHakQsSUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3hDLElBQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0FBQzVDLElBQU0sdUJBQXVCLEdBQUcscUJBQXFCLENBQUM7QUFDdEQsSUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUM7QUFDeEMsSUFBTSxhQUFhLEdBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDO0FBQzVFLElBQU0scUJBQXFCLEdBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUMsQ0FBQztBQUNuRSxJQUFNLGdCQUFnQixHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFTOUQ7SUFPRSx1QkFBWSxPQUF3QztRQUNsRCxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDakMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLGFBQWEsQ0FBQztRQUNsQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksR0FBRyxPQUFPLENBQUMsT0FBTztnQkFDekMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDMUMsQ0FBQyxJ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