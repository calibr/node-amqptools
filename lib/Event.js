"use strict";
var ChannelManager_1 = require('./ChannelManager');
var EXCHANGE_PREFIX = "nimbus:event:";
var EXCHANGE_ALL_EVENTS = "nimbus:events";
var EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
var EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
var Event = (function () {
    function Event(options) {
        this.exchange = options.exchange;
        this.userId = options.userId;
        this.topic = options.topic ? options.topic : 'nimbusEvent';
    }
    Event.prototype.send = function (object) {
        return this.sendString(this.prepareMessage(object));
    };
    Object.defineProperty(Event.prototype, "fullExchangeName", {
        get: function () {
            if (this.userId)
                return EXCHANGE_EVENTS_BY_USER;
            return EXCHANGE_PREFIX + this.exchange;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "routeKey", {
        get: function () {
            return this.exchange + '.' + this.topic + (this.userId ? '.' + this.userId : '');
        },
        enumerable: true,
        configurable: true
    });
    Event.prototype.assertExchange = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.assertExchange(_this.fullExchangeName, "topic", EXCHANGE_OPTIONS, function (err) { return err ? reject(err) : resolve(channel); });
            });
        });
    };
    Event.prototype.assertExchangeForAllEvents = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            if (_this.userId)
                return channel;
            return new Promise(function (resolve, reject) {
                channel.assertExchange(EXCHANGE_ALL_EVENTS, "topic", EXCHANGE_OPTIONS, function (err) { return err ? reject(err) : resolve(channel); });
            });
        });
    };
    Event.prototype.bindToExchangeForAllEvents = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            if (_this.userId)
                return channel;
            return new Promise(function (resolve, reject) {
                channel.bindExchange(EXCHANGE_ALL_EVENTS, _this.fullExchangeName, "#", {}, function (err) { return err ? reject(err) : resolve(channel); });
            });
        });
    };
    Event.prototype.sendBuffer = function (buffer) {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel()
            .then(function () { return _this.assertExchange(); })
            .then(function () { return _this.assertExchangeForAllEvents(); })
            .then(function () { return _this.bindToExchangeForAllEvents(); })
            .then(function (channel) {
            channel.publish(_this.fullExchangeName, _this.routeKey, buffer, {
                contentType: "text/json",
                persistent: true
            });
        });
    };
    Event.prototype.sendString = function (string) {
        return this.sendBuffer(new Buffer(string));
    };
    Event.prototype.prepareMessage = function (object) {
        var message = {
            exchange: this.exchange,
            topic: this.topic,
            content: object
        };
        if (this.userId)
            message.userId = this.userId;
        return JSON.stringify(message);
    };
    return Event;
}());
exports.Event = Event;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLCtCQUErQixrQkFDL0IsQ0FBQyxDQURnRDtBQUdqRCxJQUFNLGVBQWUsR0FBRyxlQUFlLENBQUM7QUFDeEMsSUFBTSxtQkFBbUIsR0FBRyxlQUFlLENBQUM7QUFDNUMsSUFBTSx1QkFBdUIsR0FBRyxxQkFBcUIsQ0FBQztBQUN0RCxJQUFNLGdCQUFnQixHQUFHLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLENBQUM7QUFlNUQ7SUFLRSxlQUFZLE9BQStCO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO0lBQzdELENBQUM7SUFFRCxvQkFBSSxHQUFKLFVBQUssTUFBVTtRQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsc0JBQUksbUNBQWdCO2FBQXBCO1lBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFBQyxNQUFNLENBQUMsdUJBQXVCLENBQUM7WUFDaEQsTUFBTSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pDLENBQUM7OztPQUFBO0lBRUQsc0JBQUksMkJBQVE7YUFBWjtZQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLEdBQUcsSUFBSSxD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