/// <reference path="../typings/tsd.d.ts" />

import ChannelManager = require("./ChannelManager");
import TaskManager = require("./");
import TaskManager = require("./");
const EXCHANGE_PREFIX = "nimbus:jobs:";
const QUEUE_PREFIX = "nimbus:jobs:queue:";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};
const JOB_QUEUE_OPTIONS = {durable: true, autoDelete: false};

import Promise = require("bluebird")
import uuid = require("node-uuid")
import _ = require("lodash")

interface TaskParams {
  title: string,
  data: any
}

var queues = {};

class Task {
  uuid:string;
  type:string;
  params:TaskParams;
  taskManager:TaskManager;

  constructor(type:string, params:TaskParams) {
    this.uuid = uuid.v4();
    this.type = type;
    this.params = params;
  }

  getChannel() {
    return this.taskManager.getChannel();
  }

  start(done?) {
    var currentChannel;
    var params = _.clone(this.params);
    params['uuid'] = this.uuid;
    var eventData = new Buffer(JSON.stringify(params));

    this.getChannel().then((channel) => {
      currentChannel = channel;
      return this.taskManager.assertExchange();
    }).then(() => {
      return this.taskManager.getQueue(this.type, true);
    }).then(() => {
      currentChannel.publish(this.taskManager.exchangeName, this.type, eventData);
      if (done) done();
    });

    return this;
  }
}

class TaskManager {
  service:string;
  exchangeName:string;
  static channelManager:ChannelManager;

  constructor() {
    this.service = "unknown";
    this.exchangeName = "";
  }

  createTask(type:string, params:TaskParams): Task {
    var task = new Task(type, params);
    task.taskManager = this;
    return task;
  }

  getChannel() {
    return TaskManager.channelManager.getChannel();
  }

  set channelManager(value) {
    TaskManager.channelManager = value;
  }

  getQueue(taskType, bindQueueToExchange?) {
    if (queues[taskType]) return queues[taskType];
    return this.getChannel().then(() => {
        var queueName = QUEUE_PREFIX + taskType;

        queues[taskType] = this.assertQueue(queueName);
        if (bindQueueToExchange) this.bindQueue(taskType);

        return queues[taskType];
      }
    );
  }

  assertExchange() {
    return this.getChannel().then((channel) => {
      var exchangeName = EXCHANGE_PREFIX + this.service;
      if (this.exchangeName == exchangeName) return Promise.resolve(channel);
      return new Promise((resolve, reject) => {
          channel.assertExchange(exchangeName, 'direct', EXCHANGE_OPTIONS, (err) => {
              this.exchangeName = exchangeName;
              if (err) return reject(err);
              resolve(channel);
            }
          )
        }
      );
    })
  }

  assertQueue(queueName:string) {
    return this.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
          channel.assertQueue(queueName, JOB_QUEUE_OPTIONS, (err, ok) => {
              if (err) return reject(err);
              resolve(ok);
            }
          )
        }
      )
    })
  }

  bindQueue(taskType:string) {
    return this.getChannel().then((channel) => {
        var queueName = QUEUE_PREFIX + taskType;
        channel.bindQueue(queueName, this.exchangeName, taskType);
      }
    );
  }

  purgeQueue(taskType:string, cb?) {
    return this.getChannel().then((channel) => {
      var queueName = QUEUE_PREFIX + taskType;
      return new Promise((resolve, reject) => {
        channel.checkQueue(queueName, (err, ok) => {
          if (err) return resolve(null);

          if (ok) {
            return channel.purgeQueue(queueName, (err, reply) => {
                if (err) return reject(err);
                resolve(reply)
              }
            )
          }

          resolve(null);
        })
      });
    }).nodeify(cb);
  }

  processTask(taskType, taskCallback) {
    var queueName = QUEUE_PREFIX + taskType,
      currentChannel;

    return this.getChannel().then((channel) => {
        currentChannel = channel;
        return this.getQueue(taskType);
      }
    ).then(() => {
      currentChannel.prefetch(1);
      currentChannel.consume(queueName, (msg) => {
        var taskData = JSON.parse(msg.content.toString());

        taskCallback(taskData, () => {
          currentChannel.ack(msg);
        })
      }, {noAck: false});
    });
  }
}

var taskManager = new TaskManager();

export = taskManager;