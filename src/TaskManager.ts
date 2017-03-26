import { channelManager } from './ChannelManager';
import { Task, TaskParams } from "./Task";
import { promiseNodeify } from './promise-nodeify';

export class TaskManager {
  service:string;

  constructor() {
    this.service = "unknown";
    Task.taskManager = this;
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