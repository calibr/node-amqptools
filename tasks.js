/// <reference path="./typings/tsd.d.ts" />
var EXCHANGE_PREFIX = "nimbus:jobs:";
var QUEUE_PREFIX = "nimbus:jobs:queue:";
var EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
var JOB_QUEUE_OPTIONS = { durable: true, autoDelete: false };
var Promise = require("bluebird");
var uuid = require("node-uuid");
var _ = require("lodash");
var queues = {};
var Task = (function () {
    function Task(type, params) {
        this.uuid = uuid.v4();
        this.type = type;
        this.params = params;
    }
    Task.prototype.start = function (done) {
        var _this = this;
        var currentChannel;
        var params = _.clone(this.params);
        params['uuid'] = this.uuid;
        var eventData = new Buffer(JSON.stringify(params));
        this.taskManager.getChannel().then(function (channel) {
            currentChannel = channel;
            return taskManager.assertExchange(currentChannel);
        }).then(function () {
            return taskManager.getQueue(_this.type, true);
        }).then(function () {
            currentChannel.publish(_this.taskManager.exchangeName, _this.type, eventData);
            if (done)
                done();
        });
        return this;
    };
    return Task;
})();
var taskManager = {
    service: "unknown",
    exchangeName: "",
    channelPromise: null,
    _connect: function (cb) {
        throw new Error('Need to set tasks connect function');
    },
    getChannel: function () {
        if (!taskManager.channelPromise) {
            taskManager.channelPromise = new Promise(function (resolve, reject) {
                taskManager._connect(function (channel) {
                    resolve(channel);
                });
            });
        }
        return taskManager.channelPromise;
    },
    getQueue: function (taskType, bindQueueToExchange) {
        if (queues[taskType])
            return queues[taskType];
        return taskManager.getChannel().then(function () {
            var queueName = QUEUE_PREFIX + taskType;
            queues[taskType] = taskManager.assertQueue(queueName);
            if (bindQueueToExchange)
                taskManager.bindQueue(taskType);
            return queues[taskType];
        });
    },
    assertExchange: function (channel) {
        var exchangeName = EXCHANGE_PREFIX + taskManager.service;
        if (taskManager.exchangeName == exchangeName)
            return Promise.resolve(channel);
        return new Promise(function (resolve, reject) {
            channel.assertExchange(exchangeName, 'direct', EXCHANGE_OPTIONS, function (err) {
                taskManager.exchangeName = exchangeName;
                if (err)
                    return reject(err);
                resolve(channel);
            });
        });
    },
    assertQueue: function (queueName) {
        return taskManager.getChannel().then(function (channel) {
            return new Promise(function (resolve, reject) {
                channel.assertQueue(queueName, JOB_QUEUE_OPTIONS, function (err, ok) {
                    if (err)
                        return reject(err);
                    resolve(ok);
                });
            });
        });
    },
    bindQueue: function (taskType) {
        return taskManager.getChannel().then(function (channel) {
            var queueName = QUEUE_PREFIX + taskType;
            channel.bindQueue(queueName, taskManager.exchangeName, taskType);
        });
    },
    Task: Task,
    processTask: function (taskType, taskCallback) {
        var queueName = QUEUE_PREFIX + taskType, currentChannel;
        return taskManager.getChannel().then(function (channel) {
            currentChannel = channel;
            return taskManager.getQueue(taskType);
        }).then(function () {
            currentChannel.prefetch(1);
            currentChannel.consume(queueName, function (msg) {
                var taskData = JSON.parse(msg.content);
                taskCallback(taskData, function () {
                    currentChannel.ack(msg);
                });
            }, { noAck: false });
        });
    }
};
Task.prototype.taskManager = taskManager;
module.exports = taskManager;
//# sourceMappingURL=tasks.js.map