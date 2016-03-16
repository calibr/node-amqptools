"use strict";
var ChannelManager_1 = require('./ChannelManager');
var uuid = require("node-uuid");
var _ = require("lodash");
var EXCHANGE_PREFIX = "nimbus:jobs:";
var EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
var JOB_QUEUE_PREFIX = "nimbus:jobs:queue:";
var JOB_QUEUE_OPTIONS = { durable: true, autoDelete: false };
var Task = (function () {
    function Task(type, params) {
        this.uuid = uuid.v4();
        this.type = type;
        this.params = params;
    }
    Object.defineProperty(Task.prototype, "exchangeName", {
        get: function () {
            return EXCHANGE_PREFIX + Task.taskManager.service;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Task.prototype, "queueName", {
        get: function () {
            return JOB_QUEUE_PREFIX + this.type;
        },
        enumerable: true,
        configurable: true
    });
    Task.prototype.start = function (done) {
        var _this = this;
        if (!this.params)
            return;
        ChannelManager_1.channelManager.getChannel()
            .then(function () { return _this.assertExchange(); })
            .then(function () { return _this.assertQueue(); })
            .then(function () { return _this.bindQueue(); })
            .then(function (channel) {
            var params = _.clone(_this.params);
            params['uuid'] = _this.uuid;
            var eventData = new Buffer(JSON.stringify(params));
            channel.publish(_this.exchangeName, _this.type, eventData);
            if (done)
                done();
        });
        return this;
    };
    Task.prototype.assertExchange = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.assertExchange(_this.exchangeName, 'direct', EXCHANGE_OPTIONS, function (err) {
                    if (err)
                        return reject(err);
                    resolve(channel);
                });
            });
        });
    };
    Task.prototype.assertQueue = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.assertQueue(_this.queueName, JOB_QUEUE_OPTIONS, function (err) {
                    if (err)
                        return reject(err);
                    resolve(channel);
                });
            });
        });
    };
    Task.prototype.bindQueue = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            channel.bindQueue(_this.queueName, _this.exchangeName, _this.type);
            return channel;
        });
    };
    Task.prototype.purgeQueue = function () {
        var _this = this;
        return ChannelManager_1.channelManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.checkQueue(_this.queueName, function (err, ok) {
                    if (err)
                        return resolve(null);
                    if (ok) {
                        return channel.purgeQueue(_this.queueName, function (err, reply) {
                            if (err)
                                return reject(err);
                            resolve(reply);
                        });
                    }
                    resolve(null);
                });
            });
        });
    };
    Task.prototype.processTask = function (taskCallback) {
        var _this = this;
        var channelPromise = ChannelManager_1.channelManager.getChannel();
        return channelPromise
            .then(function () { return _this.assertQueue(); })
            .then(function (channel) {
            channel.prefetch(1);
            channel.consume(_this.queueName, function (msg) {
                var taskData = JSON.parse(msg.content.toString());
                taskCallback(taskData, function () {
                    channel.ack(msg);
                });
            }, { noAck: false });
        });
    };
    return Task;
}());
exports.Task = Task;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0Isa0JBQy9CLENBQUMsQ0FEZ0Q7QUFJakQsSUFBTyxJQUFJLFdBQVcsV0FBVyxDQUFDLENBQUE7QUFDbEMsSUFBTyxDQUFDLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFFNUIsSUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQ3ZDLElBQU0sZ0JBQWdCLEdBQUcsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUU1RCxJQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDO0FBQzlDLElBQU0saUJBQWlCLEdBQUcsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUMsQ0FBQztBQU83RDtJQU1FLGNBQVksSUFBVyxFQUFFLE1BQWtCO1FBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxzQkFBSSw4QkFBWTthQUFoQjtZQUNFLE1BQU0sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDcEQsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSwyQkFBUzthQUFiO1lBQ0UsTUFBTSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEMsQ0FBQzs7O09BQUE7SUFFRCxvQkFBSyxHQUFMLFVBQU0sSUFBSztRQUFYLGlCQWlCQztRQWhCQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFBQyxNQUFNLENBQUM7UUFFekIsK0JBQWMsQ0FBQyxVQUFVLEVBQUU7YUFDeEIsSUFBSSxD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