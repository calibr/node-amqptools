import { channelManager } from './ChannelManager'
import { TaskManager } from "./TaskManager"
import { Channel } from "amqplib/callback_api"

import uuid = require("node-uuid")
import _ = require("lodash")
import util = require("util")

const EXCHANGE_PREFIX = "nimbus:jobs:";
const EXCHANGE_OPTIONS = {durable: true, autoDelete: false};

const JOB_QUEUE_PREFIX = "nimbus:jobs:queue:";
const JOB_QUEUE_OPTIONS = {durable: true, autoDelete: false};

const debug = util.debuglog("amqptools");

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

  start(done?) {
    if (!this.params) return;

    channelManager.getChannel()
      .then(() => this.assertExchange())
      .then(() => this.assertQueue())
      .then(() => this.bindQueue())
      .then((channel) => {
        var params = _.clone(this.params);
        params['uuid'] = this.uuid;
        var eventData = new Buffer(JSON.stringify(params));

        channel.publish(this.exchangeName, this.type, eventData);
        if (done) done();
      });

    return this;
  }

  private assertExchange() {
    return channelManager.getChannel().then((channel) => {
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.exchangeName, 'direct', EXCHANGE_OPTIONS, (err) => {
          if (err) return reject(err);
          resolve(channel);
        })
      });
    })
  }

  private assertQueue() {
    return channelManager.getChannel().then((channel) => {
      return new Promise<Channel>((resolve, reject) => {
        channel.assertQueue(this.queueName, JOB_QUEUE_OPTIONS, (err) => {
          if (err) return reject(err);
          resolve(channel);
        })
      })
    })
  }

  private bindQueue() {
    return channelManager.getChannel().then((channel) => {
      channel.bindQueue(this.queueName, this.exchangeName, this.type);
      return channel;
    });
  }

  purgeQueue() {
    return channelManager.getChannel().then((channel) => {
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

  processTask(opts, taskCallback) {
    if(typeof opts === "function") {
      taskCallback = opts;
      opts = {};
    }
    opts = opts || {};
    opts.prefetchCount = opts.prefetchCount || 1;
    var channelPromise = channelManager.getChannel();
    return channelPromise
      .then(() => this.assertQueue())
      .then((channel) => {
        channel.prefetch(opts.prefetchCount);
        debug("Attaching task listener for %s, prefetch=%d", this.type, opts.prefetchCount);
        channel.consume(this.queueName, (msg) => {
          var taskData = JSON.parse(msg.content.toString());
          taskCallback(taskData, () => {
            channel.ack(msg);
          })
        }, {noAck: false});
      });
  }
}
