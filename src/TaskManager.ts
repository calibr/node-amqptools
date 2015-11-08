/// <reference path="../typings/tsd.d.ts" />

import ChannelManager = require("./ChannelManager");
import TaskManager = require("./");
import TaskManager = require("./");
import { Task, TaskParams } from "./Task";

import Promise = require("bluebird")

export class TaskManager {
  service:string;
  static channelManager:ChannelManager;

  constructor() {
    this.service = "unknown";
    Task.taskManager = this;
  }

  createTask(type:string, params:TaskParams): Task {
    return new Task(type, params);
  }

  getChannel() {
    return TaskManager.channelManager.getChannel();
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