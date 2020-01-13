import { channelManager } from './ChannelManager'
import { TaskManager } from "./TaskManager"
import { Channel } from "amqplib/callback_api"

import uuid = require("node-uuid")
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
  taskCallback: any;
  opts: any;
  static taskManager:TaskManager;

  constructor(type:string, params?:TaskParams) {
    this.uuid = uuid.v4();
    this.type = type;
    this.params = params;

    channelManager.on("reconnect", this.onReconnect);
  }

  onReconnect = () => {
    if(this.taskCallback) {
      debug("Trying to re establish consuming on task queue %s", this.queueName);
      this.consume();
    }
  }

  get exchangeName() {
    return EXCHANGE_PREFIX + Task.taskManager.service;
  }

  get queueName() {
    return JOB_QUEUE_PREFIX + this.type;
  }

  start(cb?) {
    if (!this.params) return;

    channelManager.getChannel()
      .then(() => this.assertExchange())
      .then(() => this.assertQueue())
      .then(() => this.bindQueue())
      .then((channel) => {
        let params = JSON.parse(JSON.stringify(this.params));
        params['uuid'] = this.uuid;
        var eventData = new Buffer(JSON.stringify(params));

        channel.publish(this.exchangeName, this.type, eventData);
        if (cb) cb();
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

  consume() {
    return channelManager.getChannel()
      .then(() => this.assertQueue())
      .then((channel) => {
        channel.prefetch(this.opts.prefetchCount);
        debug("Attaching task listener for %s, prefetch=%d", this.type, this.opts.prefetchCount);
        channel.consume(this.queueName, (msg) => {
          try {
            var taskData = JSON.parse(msg.content.toString());
            this.taskCallback(taskData, errRes => {
              if (errRes && errRes.nack) {
                // dead letter the message
                channel.nack(msg, false, false)
              } else {
                channel.ack(msg)
              }
            })
          } catch (err) {
            console.error('Malformed message', msg.content.toString(), err)
            channel.ack(msg)
          }
        }, {noAck: false});
      });
  }

  processTask(opts, taskCallback) {
    if(this.taskCallback) {
      throw new Error("Task callback already set");
    }
    if(typeof opts === "function") {
      taskCallback = opts;
      opts = {};
    }
    this.taskCallback = taskCallback;
    opts = opts || {};
    opts.prefetchCount = opts.prefetchCount || 1;
    this.opts = opts;
    return this.consume();
  }
}
