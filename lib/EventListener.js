"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ChannelManager_1 = require("./ChannelManager");
const EXCHANGE_PREFIX = "nimbus:event:";
const EXCHANGE_ALL_EVENTS = "nimbus:events";
const EXCHANGE_EVENTS_BY_USER = "nimbus:eventsByUser";
const QUEUE_PREFIX = "nimbus:listener:";
const QUEUE_OPTIONS = { durable: false, autoDelete: true, exclusive: true };
const PERSISTENT_QUEUE_OPTIONS = { durable: true, autoDelete: false, exclusive: false };
const QUEUE_RUNTIME_OPTIONS = { durable: false, autoDelete: true };
const EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
const util = require("util");
var debug = util.debuglog("amqptools");
class EventListener {
    constructor(options) {
        this.persistent = false;
        this.autoAck = true;
        this.onReconnect = () => {
            debug("Trying to re establish consuming on event queue %s", this.queueName);
            this.consume();
        };
        this.onMessageReceived = (msg) => {
            var message = JSON.parse(msg.content.toString());
            var extra = {};
            if (this.autoAck) {
                this.ack(msg);
            }
            else {
                extra.ack = () => {
                    this.ack(msg);
                };
            }
            this.listener(message, extra);
        };
        this.exchange = options.exchange;
        this.topic = options.topic;
        this.userId = options.userId;
        this.queueOptions = QUEUE_OPTIONS;
        this.prefetchCount = options.prefetchCount || 1;
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
        ChannelManager_1.channelManager.on("reconnect", this.onReconnect);
    }
    get fullExchangeName() {
        if (this.userId) {
            return EXCHANGE_EVENTS_BY_USER;
        }
        return this.exchange ? EXCHANGE_PREFIX + this.exchange : EXCHANGE_ALL_EVENTS;
    }
    get queueName() {
        return this.queue;
    }
    get routeKey() {
        if (!this.topic && !this.exchange && !this.userId)
            return '#';
        return [this.exchange, this.topic]
            .map(str => (str ? str : '*'))
            .join('.')
            .concat(this.userId ? '.' + this.userId : '');
    }
    set queueName(val) {
        this.queue = val;
    }
    assertExchange() {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                channel.assertExchange(this.fullExchangeName, "topic", EXCHANGE_OPTIONS, (err) => err ? reject(err) : resolve(channel));
            });
        });
    }
    assertQueue() {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                channel.assertQueue(this.queueName, this.queueOptions, (err, ok) => {
                    if (err)
                        return reject(err);
                    this.queueName = ok.queue;
                    resolve(channel);
                });
            });
        });
    }
    bindQueue() {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                channel.bindQueue(this.queueName, this.fullExchangeName, this.routeKey, {}, (err) => err ? reject(err) : resolve(channel));
            });
        });
    }
    ack(msg) {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            channel.ack(msg);
        });
    }
    consume() {
        let _this = this;
        return this.assertExchange()
            .then(() => this.assertQueue())
            .then(() => this.bindQueue())
            .then((channel) => {
            channel.prefetch(this.prefetchCount);
            channel.consume(this.queueName, this.onMessageReceived, undefined, function (err, ok) {
                if (err) {
                    console.error("Fail to consume on queue " + this.queueName, err);
                    throw err;
                }
                _this.consumerTag = ok.consumerTag;
            });
        });
    }
    listen(listener) {
        if (this.listener) {
            throw new Error("Listener is already set");
        }
        this.listener = listener;
        return this.consume();
    }
    cancel() {
        ChannelManager_1.channelManager.getChannel().then((channel) => {
            channel.cancel(this.consumerTag);
            ChannelManager_1.channelManager.removeListener("reconnect", this.onReconnect);
        });
    }
}
exports.EventListener = EventListener;
//# sourceMappingURL=EventListener.js.map