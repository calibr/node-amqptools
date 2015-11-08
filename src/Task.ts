import { TaskManager } from "./TaskManager";

import uuid = require("node-uuid")
import _ = require("lodash")

const EXCHANGE_PREFIX = "nimbus:jobs:";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

const JOB_QUEUE_PREFIX = "nimbus:jobs:queue:";
const JOB_QUEUE_OPTIONS = {durable: true, autoDelete: false};

export interface TaskParams {
  title: string,
  data: any
}

export class Task {
  uuid:string;
  type:string;
  params:TaskParams;
  static taskManager:TaskManager;

  constructor(type:string, params?:TaskParams) {
    this.uuid = uuid.v4();
    this.type = type;
    this.params = params;
  }

  get exchangeName() {
    return EXCHANGE_PREFIX + Task.taskManager.service;
  }

  get queueName() {
    return JOB_QUEUE_PREFIX + this.type;
  }

  getChannel() {
    return Task.taskManager.getChannel();
  }

  start(done?) {
    if (!this.params) return;

    var channelPromise = this.getChannel();

    channelPromise
      .then(() => this.assertExchange(channelPromise))
      .then(() => this.assertQueue(channelPromise))
      .then(() => this.bindQueue(channelPromise))
      .then((channel) => {
        var params = _.clone(this.params);
        params['uuid'] = this.uuid;
        var eventData = new Buffer(JSON.stringify(params));

        channel.publish(this.exchangeName, this.type, eventData);
        if (done) done();
      });

    return this;
  }

  private assertExchange(channelPromise) {
    return channelPromise.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.exchangeName, 'direct', EXCHANGE_OPTIONS, (err) => {
          if (err) return reject(err);
          resolve(channel);
        })
      });
    })
  }

  private assertQueue(channelPromise) {
    return channelPromise.then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertQueue(this.queueName, JOB_QUEUE_OPTIONS, (err) => {
          if (err) return reject(err);
          resolve(channel);
        })
      })
    })
  }

  private bindQueue(channelPromise) {
    return channelPromise.then((channel) => {
      channel.bindQueue(this.queueName, this.exchangeName, this.type);
      return channel;
    });
  }

  purgeQueue() {
    return this.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.checkQueue(this.queueName, (err, ok) => {
          if (err) return resolve(null);

          if (ok) {
            return channel.purgeQueue(this.queueName, (err, reply) => {
              if (err) return reject(err);
              resolve(reply)
            })
          }
          resolve(null);
        })
      });
    });
  }

  processTask(taskCallback) {
    var channelPromise = this.getChannel();
    return channelPromise
      .then(() => this.assertQueue(channelPromise))
      .then((channel) => {
        channel.prefetch(1);
        channel.consume(this.queueName, (msg) => {
          var taskData = JSON.parse(msg.content.toString());
          taskCallback(taskData, () => {
            channel.ack(msg);
          })
        }, {noAck: false});
      });
  }
}
