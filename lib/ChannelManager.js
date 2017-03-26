"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const callback_api_1 = require("amqplib/callback_api");
const Promise = require("bluebird");
const events_1 = require("events");
const util = require("util");
const _ = require("lodash");
const MAX_LISTENERS = 10000;
var debug = util.debuglog("amqptools");
class ChannelManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.maxReconnectionAttempts = 100;
        this.randomReconnectionInterval = true;
        this.connectCallbacks = [];
        this.onConnectionClose = (error) => {
            debug("amqp connection has been closed");
            this.channel = null;
            this.connection = null;
            this.channelPromise = null;
            var reconnections = 0;
            var tryReconnect = () => {
                debug("Reconnection attempt...");
                this.connect((err) => {
                    reconnections++;
                    if (!err) {
                        this.emit("reconnect");
                        return debug("Connection has been restored");
                    }
                    if (reconnections >= this.maxReconnectionAttempts) {
                        throw new Error("Fail to establish a connection with rabbitmq");
                    }
                    var timeout = this.randomReconnectionInterval ? _.random(1, 10) : 1;
                    debug("Next reconnect in %d seconds", timeout);
                    setTimeout(tryReconnect, timeout * 1000);
                });
            };
            tryReconnect();
        };
        this.setMaxListeners(MAX_LISTENERS);
    }
    connect(cb) {
        if (this.channel) {
            return cb(null, this.channel);
        }
        this.connectCallbacks.push(cb);
        if (this.connectInProgress)
            return;
        this.connectInProgress = true;
        callback_api_1.connect(this.connectionURI, (err, connection) => {
            if (err) {
                return this.connectRespond(err, null);
            }
            this.connection = connection;
            this.connection.on("close", this.onConnectionClose);
            this.connection.createChannel((err, channel) => {
                if (err) {
                    return this.connectRespond(err, null);
                }
                this.channel = channel;
                this.channel.on('error', () => { this.reconnect(); });
                this.connectRespond(null, this.channel);
            });
        });
    }
    connectRespond(err, channel) {
        this.connectInProgress = false;
        if (err) {
            debug("Fail to connect...", err);
        }
        else {
            debug("Connected");
        }
        this.connectCallbacks.forEach((extraCb) => {
            if (!extraCb)
                return;
            extraCb(err, channel);
        });
        this.connectCallbacks = [];
    }
    getChannel() {
        return new Promise((resolve, reject) => {
            if (this.channel) {
                return resolve(this.channel);
            }
            this.connect((err, channel) => {
                if (err)
                    return reject(err);
                resolve(channel);
            });
        });
    }
    setConnectionURI(uri) {
        this.connectionURI = uri;
    }
    disconnect(cb) {
        if (!this.connection) {
            return cb();
        }
        this.connection.removeListener("close", this.onConnectionClose);
        this.connection.close(() => {
            this.connection = null;
            this.channel = null;
            this.channelPromise = null;
            cb();
        });
    }
    reconnect(cb) {
        this.disconnect(() => {
            this.connect(cb);
        });
    }
}
exports.ChannelManager = ChannelManager;
exports.channelManager = new ChannelManager();
//# sourceMappingURL=ChannelManager.js.map