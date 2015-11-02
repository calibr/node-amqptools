/// <reference path="../typings/tsd.d.ts" />
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YXNrLnRzIl0sIm5hbWVzIjpbIlRhc2siLCJUYXNrLmNvbnN0cnVjdG9yIiwiVGFzay5zdGFydCJdLCJtYXBwaW5ncyI6IkFBQUEsNENBQTRDO0FBRTVDLElBQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQztBQUN2QyxJQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQztBQUMxQyxJQUFNLGdCQUFnQixHQUFHLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDOUQsSUFBTSxpQkFBaUIsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBRS9ELElBQU8sT0FBTyxXQUFXLFVBQVUsQ0FBQyxDQUFBO0FBQ3BDLElBQU8sSUFBSSxXQUFXLFdBQVcsQ0FBQyxDQUFBO0FBQ2xDLElBQU8sQ0FBQyxXQUFXLFFBQVEsQ0FBQyxDQUFBO0FBTzVCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUVoQjtJQU1FQSxjQUFhQSxJQUFZQSxFQUFFQSxNQUFrQkE7UUFDM0NDLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsTUFBTUEsQ0FBQ0E7SUFDdkJBLENBQUNBO0lBQ0RELG9CQUFLQSxHQUFMQSxVQUFNQSxJQUFLQTtRQUFYRSxpQkFpQkNBO1FBaEJDQSxJQUFJQSxjQUFjQSxDQUFDQTtRQUNuQkEsSUFBSUEsTUFBTUEsR0FBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDakNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBO1FBQzNCQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVuREEsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsVUFBVUEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBQ0EsT0FBT0E7WUFDekNBLGNBQWNBLEdBQUdBLE9BQU9BLENBQUNBO1lBQ3pCQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxjQUFjQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUNwREEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7WUFDTkEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1lBQ05BLGNBQWNBLENBQUNBLE9BQU9BLENBQUNBLEtBQUlBLENBQUNBLFdBQVdBLENBQUNBLFlBQVlBLEVBQUVBLEtBQUlBLENBQUNBLElBQUlBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO1lBQzVFQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtnQkFBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLENBQUNBO1FBRUhBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBQ0hGLFdBQUNBO0FBQURBLENBQUNBLEFBN0JELElBNkJDO0FBRUQsSUFBSSxXQUFXLEdBQUc7SUFDaEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsWUFBWSxFQUFFLEVBQUU7SUFDaEIsY0FBYyxFQUFFLElBQUk7SUFDcEIsUUFBUSxFQUFFLFVBQUMsRUFBcUI7UUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFDRCxVQUFVLEVBQUU7UUFDVixFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLFdBQVcsQ0FBQyxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtnQkFDdkQsV0FBVyxDQUFDLFFBQVEsQ0FBQyxVQUFDLE9BQU87b0JBQzNCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQztJQUNwQyxDQUFDO0lBQ0QsUUFBUSxFQUFFLFVBQUMsUUFBUSxFQUFFLG1CQUFvQjtRQUN2QyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ25DLElBQUksU0FBUyxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUM7WUFFeEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEQsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUM7Z0JBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUV6RCxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELGNBQWMsRUFBRSxVQUFDLE9BQU87UUFDdEIsSUFBSSxZQUFZLEdBQUcsZUFBZSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDekQsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksSUFBSSxZQUFZLENBQUM7WUFBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RSxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtZQUNqQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsVUFBQyxHQUFHO2dCQUNuRSxXQUFXLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztnQkFDeEMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO29CQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzVCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELFdBQVcsRUFBRSxVQUFDLFNBQWlCO1FBQzdCLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUMsT0FBTztZQUMzQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtnQkFDakMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsVUFBQyxHQUFHLEVBQUUsRUFBRTtvQkFDeEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDO3dCQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzVCLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDZCxDQUFDLENBQUMsQ0FBQTtZQUNKLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsU0FBUyxFQUFFLFVBQUMsUUFBZ0I7UUFDMUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxPQUFPO1lBQzNDLElBQUksU0FBUyxHQUFHLFlBQVksR0FBRyxRQUFRLENBQUM7WUFDeEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFDRCxJQUFJLEVBQUUsSUFBSTtJQUNWLFdBQVcsRUFBRSxVQUFDLFFBQVEsRUFBRyxZQUFZO1FBQ25DLElBQUksU0FBUyxHQUFHLFlBQVksR0FBRyxRQUFRLEVBQ3JDLGNBQWMsQ0FBQztRQUVqQixNQUFNLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE9BQU87WUFDM0MsY0FBYyxHQUFHLE9BQU8sQ0FBQztZQUN6QixNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDTixjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLGNBQWMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQUMsR0FBRztnQkFDcEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZDLFlBQVksQ0FBQyxRQUFRLEVBQUU7b0JBQ3JCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YsQ0FBQztBQUVGLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUV6QyxpQkFBUyxXQUFXLENBQUMifQ==