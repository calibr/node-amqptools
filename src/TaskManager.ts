import { channelManager } from './ChannelManager'
import { Task, TaskParams } from "./Task";

import Promise = require("bluebird")

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
    return abstractTask.purgeQueue().nodeify(cb);
  }

  processTask(taskType, taskCallback, cb?) {
    var abstractTask = new Task(taskType);
    return abstractTask.processTask(taskCallback).nodeify(cb);
  }
}