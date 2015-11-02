/// <reference path="../typings/tsd.d.ts" />
var async = require("async");
var randomString = require("just.randomstring");
var QUEUE_PREFIX = "_queue_rpc:";
var CALL_TIMEOUT = 3600 * 1000;
var returnCbs = {}, replyQueue = "", channel = null, DEBUG = false;
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
var RPC = (function () {
    function RPC() {
        this.processors = {};
    }
    RPC._connect = function (cb) {
        throw new Error('Need to set tasks connect function');
    };
    RPC.prototype.createQueue = function (action, cb) {
        var actionParsed = _parseAction(action);
        var self = this;
        channel.assertQueue(actionParsed.queue, {}, function (err, attrs) {
            if (err) {
                return cb(err);
            }
            channel.consume(actionParsed.queue, function (msg) {
                var content = JSON.parse(msg.content);
                try {
                    dbg("Incoming RPC request", action);
                    self.processors[action].listener(content, function (err, body) {
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
                cb(err, res.consumerTag);
            });
        });
    };
    ;
    RPC.prototype.register = function (action, cb, registerCb) {
        var self = this;
        registerCb = registerCb || function () { };
        if (self.processors[action]) {
            throw new Error("Can't register same action processor twice");
        }
        var consumerTag;
        async.series([
            function (next) {
                module.exports._connect(function () {
                    next();
                });
            },
            function (next) {
                self.createQueue(action, function (err, tag) {
                    if (!err) {
                        consumerTag = tag;
                    }
                    next(err);
                });
            }
        ], function (err) {
            if (!err) {
                self.processors[action] = {
                    listener: cb,
                    consumerTag: consumerTag
                };
            }
            registerCb(err);
        });
        return true;
    };
    ;
    RPC.prototype.unregister = function (action, unregisterCb) {
        unregisterCb = unregisterCb || function () { };
        var self = this;
        if (!self.processors[action]) {
            process.nextTick(function () {
                unregisterCb(null);
            });
            return false;
        }
        channel.cancel(self.processors[action].consumerTag, function (err) {
            if (!err) {
                delete self.processors[action];
            }
            unregisterCb(err);
        });
    };
    ;
    RPC.prototype.call = function (action, params, cb) {
        if (typeof params === "function") {
            cb = params;
            params = {};
        }
        var actionParsed = _parseAction(action);
        async.series([
            function (next) {
                module.exports._connect(function () {
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
                    if (err) {
                        return cb(err);
                    }
                    replyQueue = attrs.queue;
                    channel.consume(replyQueue, function (_msg) {
                        var msg = JSON.parse(_msg.content), correlationId = _msg.properties.correlationId;
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
    };
    RPC.purgeActionQueue = function (action, cb) {
        var actionParsed = _parseAction(action);
        channel.purgeQueue(actionParsed.queue, cb);
    };
    ;
    RPC.setChannel = function (_channel) {
        channel = _channel;
    };
    ;
    return RPC;
})();
module.exports = RPC;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnBjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JwYy50cyJdLCJuYW1lcyI6WyJkYmciLCJfcGFyc2VBY3Rpb24iLCJfZXJyb3JQcmVwYXJlIiwiUlBDIiwiUlBDLmNvbnN0cnVjdG9yIiwiUlBDLl9jb25uZWN0IiwiUlBDLmNyZWF0ZVF1ZXVlIiwiUlBDLnJlZ2lzdGVyIiwiUlBDLnVucmVnaXN0ZXIiLCJSUEMuY2FsbCIsIlJQQy5wdXJnZUFjdGlvblF1ZXVlIiwiUlBDLnNldENoYW5uZWwiXSwibWFwcGluZ3MiOiJBQUFBLDRDQUE0QztBQUc1QyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQTtBQUUvQixJQUFPLFlBQVksV0FBVyxtQkFBbUIsQ0FBQyxDQUFBO0FBRWxELElBQU0sWUFBWSxHQUFHLGFBQWEsQ0FBQztBQUNuQyxJQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBRWpDLElBQUksU0FBUyxHQUFHLEVBQUUsRUFDaEIsVUFBVSxHQUFHLEVBQUUsRUFDZixPQUFPLEdBQUcsSUFBSSxFQUNkLEtBQUssR0FBRyxLQUFLLENBQUM7QUFFaEI7SUFBYUEsY0FBY0E7U0FBZEEsV0FBY0EsQ0FBZEEsc0JBQWNBLENBQWRBLElBQWNBO1FBQWRBLDZCQUFjQTs7SUFDekJBLEVBQUVBLENBQUFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1FBQ1RBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQ25DQSxDQUFDQTtBQUNIQSxDQUFDQTtBQUVELFdBQVcsQ0FBQztJQUVWLElBQUksVUFBVSxHQUFHLEVBQUUsRUFDZixHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFDMUIsQ0FBQyxFQUNELFdBQVcsRUFDWCxJQUFJLENBQUM7SUFDVCxHQUFHLENBQUEsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENB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