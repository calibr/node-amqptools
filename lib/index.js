/// <reference path="../typings/tsd.d.ts" />
var amqpLib = require("amqplib/callback_api");
var eventManager = require("./eventEmitter");
var rpcManager = require("./rpc");
var taskManager = require("./task");
require('source-map-support').install();
var ChannelManager = (function () {
    function ChannelManager() {
        this.connectCallbacks = [];
    }
    Object.defineProperty(ChannelManager.prototype, "events", {
        get: function () {
            eventManager.channelManager = this;
            return eventManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChannelManager.prototype, "rpc", {
        get: function () {
            rpcManager.channelManager = this;
            return rpcManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChannelManager.prototype, "tasks", {
        get: function () {
            taskManager.channelManager = this;
            return taskManager;
        },
        enumerable: true,
        configurable: true
    });
    ChannelManager.prototype.connect = function (cb) {
        var _this = this;
        if (this.channel) {
            return cb(null, this.channel);
        }
        this.connectCallbacks.push(cb);
        if (this.connectInProgress)
            return;
        this.connectInProgress = true;
        amqpLib.connect(this.connectionURI, function (err, connection) {
            if (err)
                return _this.connectRespond(err, null);
            _this.connection = connection;
            _this.connection.createChannel(function (err, channel) {
                if (err)
                    return _this.connectRespond(err, null);
                eventManager.setChannel(channel);
                rpcManager.setChannel(channel);
                _this.channel = channel;
                _this.connectRespond(null, _this.channel);
            });
        });
    };
    ChannelManager.prototype.connectRespond = function (err, channel) {
        this.connectInProgress = false;
        this.connectCallbacks.forEach(function (extraCb) {
            extraCb(err, channel);
        });
        this.connectCallbacks = [];
    };
    ChannelManager.prototype.setConnectionURI = function (uri) {
        this.connectionURI = uri;
    };
    ChannelManager.prototype.disconnect = function (cb) {
        var _this = this;
        if (!this.connection) {
            return cb();
        }
        this.connection.close(function () {
            _this.connection = null;
            _this.channel = null;
            cb();
        });
    };
    ChannelManager.prototype.reconnect = function (cb) {
        var _this = this;
        if (!this.connection) {
            return this.connect(cb);
        }
        this.connection.close(function () {
            _this.connection = null;
            _this.channel = null;
            _this.connect(cb);
        });
    };
    return ChannelManager;
})();
var channelManager = new ChannelManager();
module.exports = channelManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiQ2hhbm5lbE1hbmFnZXIiLCJDaGFubmVsTWFuYWdlci5jb25zdHJ1Y3RvciIsIkNoYW5uZWxNYW5hZ2VyLmV2ZW50cyIsIkNoYW5uZWxNYW5hZ2VyLnJwYyIsIkNoYW5uZWxNYW5hZ2VyLnRhc2tzIiwiQ2hhbm5lbE1hbmFnZXIuY29ubmVjdCIsIkNoYW5uZWxNYW5hZ2VyLmNvbm5lY3RSZXNwb25kIiwiQ2hhbm5lbE1hbmFnZXIuc2V0Q29ubmVjdGlvblVSSSIsIkNoYW5uZWxNYW5hZ2VyLmRpc2Nvbm5lY3QiLCJDaGFubmVsTWFuYWdlci5yZWNvbm5lY3QiXSwibWFwcGluZ3MiOiJBQUFBLDRDQUE0QztBQUU1QyxJQUFPLE9BQU8sV0FBVyxzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELElBQU8sWUFBWSxXQUFXLGdCQUFnQixDQUFDLENBQUE7QUFDL0MsSUFBTyxVQUFVLFdBQVcsT0FBTyxDQUFDLENBQUE7QUFDcEMsSUFBTyxXQUFXLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFHdEMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFFeEM7SUFRRUE7UUFDRUMsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7SUFFREQsc0JBQUlBLGtDQUFNQTthQUFWQTtZQUNFRSxZQUFZQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNuQ0EsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7UUFDdEJBLENBQUNBOzs7T0FBQUY7SUFFREEsc0JBQUlBLCtCQUFHQTthQUFQQTtZQUNFRyxVQUFVQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUNqQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDcEJBLENBQUNBOzs7T0FBQUg7SUFFREEsc0JBQUlBLGlDQUFLQTthQUFU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