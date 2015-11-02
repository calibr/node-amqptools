/// <reference path="../typings/tsd.d.ts" />

const EXCHANGE_PREFIX = "nimbus:jobs:";
const QUEUE_PREFIX = "nimbus:jobs:queue:";
const EXCHANGE_OPTIONS = { durable: true, autoDelete: false };
const JOB_QUEUE_OPTIONS = { durable: true, autoDelete: false };

import amqpLib = require("amqplib/callback_api")
import Promise = require("bluebird")
import uuid = require("node-uuid")
import _ = require("lodash")

interface TaskParams {
  title: string,
  data: any
}

var queues = {};

class Task {
  uuid: string;
  type: string;
  params: TaskParams;
  taskManager: any;

  constructor (type: string, params: TaskParams) {
    this.uuid = uuid.v4();
    this.type = type;
    this.params = params;
  }
  start(done?) {
    var currentChannel;
    var params =_.clone(this.params);
    params['uuid'] = this.uuid;
    var eventData = new Buffer(JSON.stringify(params));

    this.taskManager.getChannel().then((channel) => {
      currentChannel = channel;
      return taskManager.assertExchange();
    }).then(() => {
      return taskManager.getQueue(this.type, true);
    }).then(() => {
      currentChannel.publish(this.taskManager.exchangeName, this.type, eventData);
      if (done) done();
    });

    return this;
  }
}

var taskManager = {
  service: "unknown",
  exchangeName: "",
  channelPromise: null,
  _connect: (cb: (channel) => void) => {
    throw new Error('Need to set tasks connect function');
  },
  getChannel: () => {
    if (!taskManager.channelPromise) {
      taskManager.channelPromise = new Promise((resolve, reject) => {
        taskManager._connect((channel) => {
          resolve(channel);
        })
      });
    }
    return taskManager.channelPromise;
  },
  getQueue: (taskType, bindQueueToExchange?) => {
    if (queues[taskType]) return queues[taskType];
    return taskManager.getChannel().then(() => {
      var queueName = QUEUE_PREFIX + taskType;

      queues[taskType] = taskManager.assertQueue(queueName);
      if (bindQueueToExchange) taskManager.bindQueue(taskType);

      return queues[taskType];
    });
  },
  assertExchange: () => {
    return taskManager.getChannel().then((channel) => {
      var exchangeName = EXCHANGE_PREFIX + taskManager.service;
      if (taskManager.exchangeName == exchangeName) return Promise.resolve(channel);
      return new Promise((resolve, reject) => {
        channel.assertExchange(exchangeName, 'direct', EXCHANGE_OPTIONS, (err) => {
          taskManager.exchangeName = exchangeName;
          if (err) return reject(err);
          resolve(channel);
        })
      });
    })
  },
  assertQueue: (queueName: string) => {
    return taskManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertQueue(queueName, JOB_QUEUE_OPTIONS, (err, ok) => {
          if (err) return reject(err);
          resolve(ok);
        })
      })
    })
  },
  bindQueue: (taskType: string) => {
    return taskManager.getChannel().then((channel) => {
      var queueName = QUEUE_PREFIX + taskType;
      channel.bindQueue(queueName, taskManager.exchangeName, taskType);
    });
  },
  purgeQueue: (taskType: string, cb) => {
    return taskManager.getChannel().then((channel) => {
      var queueName = QUEUE_PREFIX + taskType;
      return channel.purgeQueue(queueName, cb);
    });
  },
  Task: Task,
  processTask: (taskType,  taskCallback) => {
    var queueName = QUEUE_PREFIX + taskType,
      currentChannel;

    return taskManager.getChannel().then((channel) => {
      currentChannel = channel;
      return taskManager.getQueue(taskType);
    }).then(() => {
      currentChannel.prefetch(1);
      currentChannel.consume(queueName, (msg) => {
        var taskData = JSON.parse(msg.content.toString());
        taskCallback(taskData, () => {
          currentChannel.ack(msg);
        })
      }, {noAck: false});
    });
  }
};

Task.prototype.taskManager = taskManager;

export = taskManager;