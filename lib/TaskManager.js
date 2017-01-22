"use strict";
var Task_1 = require("./Task");
var TaskManager = (function () {
    function TaskManager() {
        this.service = "unknown";
        Task_1.Task.taskManager = this;
    }
    TaskManager.prototype.createTask = function (type, params) {
        return new Task_1.Task(type, params);
    };
    TaskManager.prototype.purgeQueue = function (taskType, cb) {
        var abstractTask = new Task_1.Task(taskType);
        return abstractTask.purgeQueue().nodeify(cb);
    };
    TaskManager.prototype.processTask = function (taskType, taskCallback, opts, cb) {
        if (typeof opts === "function") {
            cb = opts;
            opts = {};
        }
        var abstractTask = new Task_1.Task(taskType);
        return abstractTask.processTask(opts, taskCallback).nodeify(cb);
    };
    return TaskManager;
}());
exports.TaskManager = TaskManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFza01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvVGFza01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLHFCQUFpQyxRQUFRLENBQUMsQ0FBQTtBQUkxQztJQUdFO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7UUFDekIsV0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztJQUVELGdDQUFVLEdBQVYsVUFBVyxJQUFXLEVBQUUsTUFBaUI7UUFDdkMsTUFBTSxDQUFDLElBQUksV0FBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsZ0NBQVUsR0FBVixVQUFXLFFBQWUsRUFBRSxFQUFHO1FBQzdCLElBQUksWUFBWSxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxpQ0FBVyxHQUFYLFVBQVksUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFLLEVBQUUsRUFBRztRQUM1QyxFQUFFLENBQUEsQ0FBQyxPQUFPLElBQUksS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDVixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELElBQUksWUFBWSxHQUFHLElBQUksV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQXpCRCxJQXlCQztBQXpCWSxtQkFBVyxjQXlCdkIsQ0FBQSJ9