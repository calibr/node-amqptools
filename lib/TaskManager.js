"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("./Task");
const promise_nodeify_1 = require("./promise-nodeify");
class TaskManager {
    constructor() {
        this.service = "unknown";
        Task_1.Task.taskManager = this;
    }
    createTask(type, params) {
        return new Task_1.Task(type, params);
    }
    purgeQueue(taskType, cb) {
        var abstractTask = new Task_1.Task(taskType);
        let promise = abstractTask.purgeQueue();
        return promise_nodeify_1.promiseNodeify(promise, cb);
    }
    processTask(taskType, taskCallback, opts, cb) {
        if (typeof opts === "function") {
            cb = opts;
            opts = {};
        }
        var abstractTask = new Task_1.Task(taskType);
        let promise = abstractTask.processTask(opts, taskCallback);
        return promise_nodeify_1.promiseNodeify(promise, cb);
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=TaskManager.js.map