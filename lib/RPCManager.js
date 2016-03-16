"use strict";
var async = require("async");
var randomString = require("just.randomstring");
var ChannelManager_1 = require('./ChannelManager');
var QUEUE_PREFIX = "_queue_rpc:";
var CALL_TIMEOUT = 3600 * 1000;
var returnCbs = {}, replyQueue = "", DEBUG = false;
function dbg() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    if (DEBUG) {
        console.log.apply(console, args);
    }
}
setInterval(function () {
    var removeKeys = [], now = new Date().getTime(), k, timeCreated, data;
    for (k in returnCbs) {
        timeCreated = returnCbs[k].date.getTime();
        if (now - timeCreated >= CALL_TIMEOUT) {
            removeKeys.push(k);
        }
    }
    removeKeys.forEach(function (k) {
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
var RPCManager = (function () {
    function RPCManager() {
        this.processors = {};
    }
    RPCManager.prototype.createQueue = function (action, cb) {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                var actionParsed = _parseAction(action);
                channel.assertQueue(actionParsed.queue, {}, function (err, attrs) {
                    if (err)
                        return reject(err);
                    channel.consume(actionParsed.queue, function (msg) {
                        var content = JSON.parse(msg.content.toString());
                        try {
                            dbg("Incoming RPC request", action);
                            _this.processors[action].listener(content, function (err, body) {
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
                    }, {}, function (err, res) {
                        if (err)
                            return reject(err);
                        resolve(res.consumerTag);
                    });
                });
            });
        }).nodeify(cb);
    };
    ;
    RPCManager.prototype.register = function (action, cb, registerCb) {
        var _this = this;
        registerCb = registerCb || (function () { return null; });
        if (this.processors[action]) {
            throw new Error("Can't register same action processor twice");
        }
        var consumerTag;
        async.series([
            function (next) {
                ChannelManager_1.channelManager.connect(function () {
                    next();
                });
            },
            function (next) {
                _this.createQueue(action, function (err, tag) {
                    if (!err) {
                        consumerTag = tag;
                    }
                    next(err);
                });
            }
        ], function (err) {
            if (!err) {
                _this.processors[action] = {
                    listener: cb,
                    consumerTag: consumerTag
                };
            }
            registerCb(err);
        });
        return true;
    };
    ;
    RPCManager.prototype.unregister = function (action, cb) {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                if (!_this.processors[action]) {
                    process.nextTick(function () { return resolve(null); });
                    return;
                }
                channel.cancel(_this.processors[action].consumerTag, function (err) {
                    if (err)
                        return reject(err);
                    delete _this.processors[action];
                    resolve(null);
                });
            });
        }).nodeify(cb);
    };
    ;
    RPCManager.prototype.call = function (action, params, cb) {
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                if (typeof params === "function") {
                    cb = params;
                    params = {};
                }
                var actionParsed = _parseAction(action);
                async.series([
                    function (next) {
                        ChannelManager_1.channelManager.connect(function () {
                            next();
                        });
                    },
                    function (next) {
                        if (replyQueue) {
                            return next();
                        }
                        channel.assertQueue("", {
                            durable: false,
                            autoDelete: true
                        }, function (err, attrs) {
                            if (err)
                                return reject(err);
                            replyQueue = attrs.queue;
                            channel.consume(replyQueue, function (_msg) {
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
                    function () {
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
    };
    RPCManager.purgeActionQueue = function (action, cb) {
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            var actionParsed = _parseAction(action);
            channel.purgeQueue(actionParsed.queue, cb);
        });
    };
    ;
    return RPCManager;
}());
exports.RPCManager = RPCManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUlBDTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9SUENNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQTtBQUUvQixJQUFPLFlBQVksV0FBVyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ2xELCtCQUErQixrQkFFL0IsQ0FBQyxDQUZnRDtBQUVqRCxJQUFNLFlBQVksR0FBRyxhQUFhLENBQUM7QUFDbkMsSUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztBQUVqQyxJQUFJLFNBQVMsR0FBRyxFQUFFLEVBQ2hCLFVBQVUsR0FBRyxFQUFFLEVBQ2YsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUVoQjtJQUFhLGNBQWE7U0FBYixXQUFhLENBQWIsc0JBQWEsQ0FBYixJQUFhO1FBQWIsNkJBQWE7O0lBQ3hCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztBQUNILENBQUM7QUFFRCxXQUFXLENBQUM7SUFFVixJQUFJLFVBQVUsR0FBRyxFQUFFLEVBQ2pCLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUMxQixDQUFDLEVBQ0QsV0FBVyxFQUNYLElBQUksQ0FBQztJQUNQLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxXQUFXLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQztZQUN0QyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLENBQUM7SUFDSCxDQUFD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