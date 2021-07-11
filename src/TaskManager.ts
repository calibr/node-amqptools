import { channelManager } from './ChannelManager';
import { Task, TaskParams } from "./Task";
import { promiseNodeify } from './promise-nodeify';
import EventEmitter = require('events')

export class TaskManager extends EventEmitter {
  public service: string

  public nowProcessingTasks: Map<any, boolean>

  constructor() {
    super()
    this.service = "unknown";
    Task.taskManager = this;
    this.nowProcessingTasks = new Map()
  }

  onStartProcesTask(data) {
    this.nowProcessingTasks.set(data, true)

    this.emit('task-start', data)
  }

  onEndProcessTask(data, err) {
    this.nowProcessingTasks.delete(data)

    this.emit('task-end', data)
  }

  createTask(type:string, params:TaskParams): Task {
    return new Task(type, params);
  }

  purgeQueue(taskType:string, cb?) {
    var abstractTask = new Task(taskType);
    let promise = abstractTask.purgeQueue();
    return promiseNodeify(promise, cb);
  }

  processTask(taskType, taskCallback, opts?, cb?) {
    if(typeof opts === "function") {
      cb = opts;
      opts = {};
    }
    var abstractTask = new Task(taskType);
    let promise = abstractTask.processTask(opts, taskCallback);
    return promiseNodeify(promise, cb);
  }
}