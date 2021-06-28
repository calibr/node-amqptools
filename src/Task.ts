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

// sometimes asserting exchange/queue takes a lot of time
// exchanges are durable and survive broker restart we don't have to create them every time we submit a message
const ASSERTED_EXCHANGES_CACHE = {}
const ASSERTED_QUEUES_CACHE = {}
const BOUND_QUEUE_CACHE = {}

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
  private consumerTask: string

  constructor(type:string, params?:TaskParams) {
    this.uuid = uuid.v4();
    this.type = type;
    this.params = params;

    channelManager.on("reconnect", this.onReconnect);
    channelManager.on("finalize", this.onFinalize);
  }

  onReconnect = () => {
    if(this.taskCallback) {
      debug("Trying to re establish consuming on task queue %s", this.queueName);
      this.consume();
    }
  }

  onFinalize = () => {
    if(this.taskCallback) {
      debug("Cancel consuming on task queue %s because of the finalization process", this.queueName);
      this.cancel();
    }
  }

  get exchangeName() {
    return EXCHANGE_PREFIX + Task.taskManager.service;
  }

  get queueName() {
    return JOB_QUEUE_PREFIX + this.type;
  }

  /* deprecated, use submit instead */
  start(cb?) {
    return this.submit(cb)
  }

  submit(cb?) {
    if (!this.params) return Promise.resolve();

    const promise = channelManager.getChannel()
      .then(() => {
        debug('submit', this.uuid, 'got channel')
        return this.assertExchange()
      })
      .then(() => {
        debug('submit', this.uuid, 'exchange asserted')
        return this.assertQueue()
      })
      .then(() => {
        debug('submit', this.uuid, 'queue asserted')
        return this.bindQueue()
      })
      .then((channel) => {
        debug('submit', this.uuid, 'queue bound')
        let params = JSON.parse(JSON.stringify(this.params));
        params['uuid'] = this.uuid;
        var eventData = new Buffer(JSON.stringify(params));

        channel.publish(this.exchangeName, this.type, eventData);
        if (cb) cb();
        debug('submit', this.uuid, 'published')
      });

    return promise;
  }

  private assertExchange() {
    const cacheKey = JSON.stringify({
      name: this.exchangeName,
      options: EXCHANGE_OPTIONS
    })
    return channelManager.getChannel().then((channel) => {
      if (ASSERTED_EXCHANGES_CACHE[cacheKey]) {
        return channel
      }
      return new Promise((resolve, reject) => {
        channel.assertExchange(this.exchangeName, 'direct', EXCHANGE_OPTIONS, (err) => {
          if (err) {
            return reject(err)
          }
          ASSERTED_EXCHANGES_CACHE[cacheKey] = true
          resolve(channel);
        })
      });
    })
  }

  private assertQueue() {
    const cacheKey = JSON.stringify({
      name: this.queueName,
      options: JOB_QUEUE_OPTIONS
    })
    return channelManager.getChannel().then((channel) => {
      if (ASSERTED_QUEUES_CACHE[cacheKey]) {
        return channel
      }
      return new Promise<Channel>((resolve, reject) => {
        channel.assertQueue(this.queueName, JOB_QUEUE_OPTIONS, (err) => {
          if (err) return reject(err);
          ASSERTED_QUEUES_CACHE[cacheKey] = true
          resolve(channel);
        })
      })
    })
  }

  private bindQueue() {
    const cacheKey = this.queueName + '_' + this.exchangeName + '_' + this.type

    return channelManager.getChannel().then((channel) => {
      if (BOUND_QUEUE_CACHE[cacheKey]) {
        return channel
      }
      debug('submit', this.uuid, 'binding queue')
      return new Promise((resolve, reject) => {
        channel.bindQueue(this.queueName, this.exchangeName, this.type, {}, (err) => {
          if (err) {
            return reject(err)
          }
          BOUND_QUEUE_CACHE[cacheKey] = true
          resolve(channel)
        });
      })
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
            if (msg.properties && msg.properties.headers) {
              taskData._headers = msg.properties.headers
            }
            Task.taskManager.onStartProcesTask(taskData)
            this.taskCallback(taskData, errRes => {
              Task.taskManager.onEndProcessTask(taskData, errRes)
              if (errRes) {
                debug("Task failed: " + errRes.message)
              }
              if (errRes && errRes.nack) {
                debug("NACK task for queue" + this.queueName)
                // dead letter the message
                channel.nack(msg, false, false)
              } else {
                channel.ack(msg)
              }
            })
          } catch (err) {
            Task.taskManager.onEndProcessTask(taskData, err)
            console.error('Malformed message', msg.content.toString(), err)
            channel.ack(msg)
          }
        }, {noAck: false}, (err, ok) => {
          this.consumerTag = ok.consumerTag
        });
      });
  }

  cancel() {
    channelManager.getChannel().then((channel) => {
      channel.cancel(this.consumerTag);
      channelManager.removeListener("reconnect", this.onReconnect);
      channelManager.removeListener("finalize", this.onFinalize);
    })
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
