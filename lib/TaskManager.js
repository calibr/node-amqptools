"use strict";
const Task_1 = require("./Task");
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
        return abstractTask.purgeQueue().nodeify(cb);
    }
    processTask(taskType, taskCallback, opts, cb) {
        if (typeof opts === "function") {
            cb = opts;
            opts = {};
        }
        var abstractTask = new Task_1.Task(taskType);
        return abstractTask.processTask(opts, taskCallback).nodeify(cb);
    }
}
exports.TaskManager = TaskManager;
//# sourceMappingURL=TaskManager.js.map