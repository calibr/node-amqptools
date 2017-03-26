"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const randomString = require("just.randomstring");
const ChannelManager_1 = require("./ChannelManager");
const QUEUE_PREFIX = "_queue_rpc:";
const CALL_TIMEOUT = 3600 * 1000;
var returnCbs = {}, replyQueue = "", DEBUG = false;
function dbg(...args) {
    if (DEBUG) {
        console.log.apply(console, args);
    }
}
setInterval(() => {
    var removeKeys = [], now = new Date().getTime(), k, timeCreated, data;
    for (k in returnCbs) {
        timeCreated = returnCbs[k].date.getTime();
        if (now - timeCreated >= CALL_TIMEOUT) {
            removeKeys.push(k);
        }
    }
    removeKeys.forEach((k) => {
        data = returnCbs[k];
        delete returnCbs[k];
    });
}, 3600 * 1000);
function _parseAction(event) {
    return {
        queue: QUEUE_PREFIX + event,
    };
}
function _errorPrepare(err) {
    if (!err) {
        return null;
    }
    return {
        code: err.code ? err.code : -1,
        msg: err.message,
        data: err.data,
        errtype: err.errtype
    };
}
class RPCManager {
    constructor() {
        this.processors = {};
    }
    createQueue(action, cb) {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                var actionParsed = _parseAction(action);
                channel.assertQueue(actionParsed.queue, {}, (err, attrs) => {
                    if (err)
                        return reject(err);
                    channel.consume(actionParsed.queue, (msg) => {
                        var content = JSON.parse(msg.content.toString());
                        try {
                            dbg("Incoming RPC request", action);
                            this.processors[action].listener(content, (err, body) => {
                                var response = {
                                    error: _errorPrepare(err),
                                    body: typeof body !== "undefined" ? body : null
                                };
                                channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(response)), {
                                    correlationId: msg.properties.correlationId
                                });
                                dbg("Incoming RPC request", action, " processed! reply to", msg.properties.replyTo);
                            });
                        }
                        catch (ex) {
                            console.error("ERROR IN rpc processor\n", ex.message, ex.stack);
                        }
                        channel.ack(msg);
                    }, {}, (err, res) => {
                        if (err)
                            return reject(err);
                        resolve(res.consumerTag);
                    });
                });
            });
        }).nodeify(cb);
    }
    ;
    register(action, cb, registerCb) {
        registerCb = registerCb || (() => null);
        if (this.processors[action]) {
            throw new Error("Can't register same action processor twice");
        }
        var consumerTag;
        async.series([
            (next) => {
                ChannelManager_1.channelManager.connect(() => {
                    next();
                });
            },
            (next) => {
                this.createQueue(action, (err, tag) => {
                    if (!err) {
                        consumerTag = tag;
                    }
                    next(err);
                });
            }
        ], (err) => {
            if (!err) {
                this.processors[action] = {
                    listener: cb,
                    consumerTag: consumerTag
                };
            }
            registerCb(err);
        });
        return true;
    }
    ;
    unregister(action, cb) {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                if (!this.processors[action]) {
                    process.nextTick(() => resolve(null));
                    return;
                }
                channel.cancel(this.processors[action].consumerTag, (err) => {
                    if (err)
                        return reject(err);
                    delete this.processors[action];
                    resolve(null);
                });
            });
        }).nodeify(cb);
    }
    ;
    call(action, params, cb) {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            return new Promise((resolve, reject) => {
                if (typeof params === "function") {
                    cb = params;
                    params = {};
                }
                var actionParsed = _parseAction(action);
                async.series([
                    (next) => {
                        ChannelManager_1.channelManager.connect(() => {
                            next();
                        });
                    },
                    (next) => {
                        if (replyQueue) {
                            return next();
                        }
                        channel.assertQueue("", {
                            durable: false,
                            autoDelete: true
                        }, (err, attrs) => {
                            if (err)
                                return reject(err);
                            replyQueue = attrs.queue;
                            channel.consume(replyQueue, (_msg) => {
                                var msg = JSON.parse(_msg.content.toString()), correlationId = _msg.properties.correlationId;
                                if (returnCbs[correlationId]) {
                                    dbg("RPC Response", returnCbs[correlationId].action);
                                    var resError = null;
                                    if (msg.error) {
                                        resError = new Error(msg.error.msg);
                                        resError.code = msg.error.code;
                                        resError.errtype = msg.error.errtype;
                                        resError.data = msg.error.data;
                                    }
                                    var returnCb = returnCbs[correlationId].cb;
                                    delete returnCbs[correlationId];
                                    returnCb(resError, msg.body);
                                }
                                else {
                                    dbg("Obtained reply but unrecognized by correlationId:", correlationId);
                                }
                                channel.ack(_msg);
                            });
                            next();
                        });
                    },
                    () => {
                        var correlationId = randomString(48);
                        dbg("RPC Call", action, "wait reply to", replyQueue);
                        returnCbs[correlationId] = {
                            date: new Date(),
                            cb: cb,
                            action: action,
                            params: params
                        };
                        channel.sendToQueue(actionParsed.queue, new Buffer(JSON.stringify(params)), {
                            correlationId: correlationId,
                            replyTo: replyQueue
                        });
                    }
                ]);
            });
        }).nodeify(cb);
    }
    static purgeActionQueue(action, cb) {
        return ChannelManager_1.channelManager.getChannel().then((channel) => {
            var actionParsed = _parseAction(action);
            channel.purgeQueue(actionParsed.queue, cb);
        });
    }
    ;
}
exports.RPCManager = RPCManager;
//# sourceMappingURL=RPCManager.js.map