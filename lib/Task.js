"use strict";
var ChannelManager_1 = require('./ChannelManager');
var uuid = require("node-uuid");
var _ = require("lodash");
var util = require("util");
var EXCHANGE_PREFIX = "nimbus:jobs:";
var EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
var JOB_QUEUE_PREFIX = "nimbus:jobs:queue:";
var JOB_QUEUE_OPTIONS = { durable: true, autoDelete: false };
var debug = util.debuglog("amqptools");
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
    Task.prototype.processTask = function (opts, taskCallback) {
        var _this = this;
        if (typeof opts === "function") {
            taskCallback = opts;
            opts = {};
        }
        opts = opts || {};
        opts.prefetchCount = opts.prefetchCount || 1;
        var channelPromise = ChannelManager_1.channelManager.getChannel();
        return channelPromise
            .then(function () { return _this.assertQueue(); })
            .then(function (channel) {
            channel.prefetch(opts.prefetchCount);
            debug("Attaching task listener for %s, prefetch=%d", _this.type, opts.prefetchCount);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9UYXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrQkFBK0Isa0JBQy9CLENBQUMsQ0FEZ0Q7QUFJakQsSUFBTyxJQUFJLFdBQVcsV0FBVyxDQUFDLENBQUE7QUFDbEMsSUFBTyxDQUFDLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFDNUIsSUFBTyxJQUFJLFdBQVcsTUFBTSxDQUFDLENBQUE7QUFFN0IsSUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQ3ZDLElBQU0sZ0JBQWdCLEdBQUcsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUU1RCxJQUFNLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDO0FBQzlDLElBQU0saUJBQWlCLEdBQUcsRUFBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUMsQ0FBQztBQUU3RCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBT3pDO0lBTUUsY0FBWSxJQUFXLEVBQUUsTUFBa0I7UUFDekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELHNCQUFJLDhCQUFZO2FBQWhCO1lBQ0UsTUFBTSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNwRCxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLDJCQUFTO2FBQWI7WUFDRSxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QyxDQUFDOzs7T0FBQTtJQUVELG9CQUFLLEdBQUwsVUFBTSxJQUFLO1FBQVgsaUJBaUJDO1FBaEJDLEVB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