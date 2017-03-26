"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChannelManager_1 = require("./ChannelManager");
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
const EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
class Event {
    constructor(options) {
        this.exchange = options.exchange;
        this.userId = options.userId;
        this.topic = options.topic ? options.topic : 'nimbusEvent';
    }
    send(object) {
        return this.sendString(this.prepareMessage(object));
    }
    get fullExchangeName() {
        if (this.userId)
            return EXCHANGE_EVENTS_BY_USER;
        return EXCHANGE_PREFIX + this.exchange;
    }
    get routeKey() {
        return this.exchange + '.' + this.topic + (this.userId ? '.' + this.userId : '');
    }
    assertExchange() {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                channel.assertExchange(this.fullExchangeName, "topic", EXCHANGE_OPTIONS, (err) => err ? reject(err) : resolve(channel));
            });
        });
    }
    assertExchangeForAllEvents() {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            if (this.userId)
                return channel;
            return new Promise((resolve, reject) => {
                channel.assertExchange(EXCHANGE_ALL_EVENTS, "topic", EXCHANGE_OPTIONS, (err) => err ? reject(err) : resolve(channel));
            });
        });
    }
    bindToExchangeForAllEvents() {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            if (this.userId)
                return channel;
            return new Promise((resolve, reject) => {
                channel.bindExchange(EXCHANGE_ALL_EVENTS, this.fullExchangeName, "#", {}, (err) => err ? reject(err) : resolve(channel));
            });
        });
    }
    sendBuffer(buffer) {
        return ChannelManager_1.channelManager.getChannel()
            .then(() => this.assertExchange())
            .then(() => this.assertExchangeForAllEvents())
            .then(() => this.bindToExchangeForAllEvents())
            .then((channel) => {
            channel.publish(this.fullExchangeName, this.routeKey, buffer, {
                contentType: "text/json",
                persistent: true
            });
        });
    }
    sendString(string) {
        return this.sendBuffer(new Buffer(string));
    }
    prepareMessage(object) {
        var message = {
            exchange: this.exchange,
            topic: this.topic,
            content: object
        };
        if (this.userId)
            message.userId = this.userId;
        return JSON.stringify(message);
    }
}
exports.Event = Event;
//# sourceMappingURL=Event.js.map