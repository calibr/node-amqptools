"use strict";
var callback_api_1 = require("amqplib/callback_api");
var Promise = require('bluebird');
var ChannelManager = (function () {
    function ChannelManager() {
        this.connectCallbacks = [];
    }
    ChannelManager.prototype.connect = function (cb) {
        var _this = this;
        if (this.channel) {
            return cb(null, this.channel);
        }
        this.connectCallbacks.push(cb);
        if (this.connectInProgress)
            return;
        this.connectInProgress = true;
        callback_api_1.connect(this.connectionURI, function (err, connection) {
            if (err)
                return _this.connectRespond(err, null);
            _this.connection = connection;
            _this.connection.createChannel(function (err, channel) {
                if (err)
                    return _this.connectRespond(err, null);
                _this.channel = channel;
                _this.channel.on('error', function () { _this.reconnect(); });
                _this.connectRespond(null, _this.channel);
            });
        });
    };
    ChannelManager.prototype.connectRespond = function (err, channel) {
        this.connectInProgress = false;
        this.connectCallbacks.forEach(function (extraCb) {
            if (!extraCb)
                return;
            extraCb(err, channel);
        });
        this.connectCallbacks = [];
    };
    ChannelManager.prototype.getChannel = function () {
        var _this = this;
        if (!this.channelPromise) {
            this.channelPromise = new Promise(function (resolve, reject) {
                _this.connect(function (err, channel) {
                    if (err)
                        return reject(err);
                    resolve(channel);
                });
            });
        }
        return this.channelPromise;
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
            _this.channelPromise = null;
            cb();
        });
    };
    ChannelManager.prototype.reconnect = function (cb) {
        var _this = this;
        this.disconnect(function () {
            _this.connect(cb);
        });
    };
    return ChannelManager;
}());
exports.ChannelManager = ChannelManager;
exports.channelManager = new ChannelManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbm5lbE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQ2hhbm5lbE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDZCQUE0RCxzQkFDNUQsQ0FBQyxDQURpRjtBQUNsRixJQUFPLE9BQU8sV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUVwQztJQVNFO1FBQ0UsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQsZ0NBQU8sR0FBUCxVQUFRLEVBQUU7UUFBVixpQkFzQkM7UUFyQkMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNuQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO1FBRTlCLHNCQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFDLEdBQUcsRUFBRSxVQUFVO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFBQyxNQUFNLENBQUMsS0FBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0MsS0FBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFFN0IsS0FBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBQyxHQUFHLEVBQUUsT0FBTztnQkFDekMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDL0MsS0FBSSxD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