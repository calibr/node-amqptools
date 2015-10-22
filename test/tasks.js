/// <reference path="../typings/tsd.d.ts" />
var tools = require("../index");
var should = require("should");
var tasks = tools.tasks;
var Task = tasks.Task;
tools.setConnectionURI("amqp://localhost");
describe("Tasks", function () {
    it("should produce task and consume it", function (done) {
        tasks.service = "amqpTest";
        var newTask = new Task('testTask', { title: "test", data: { value: 1 } });
        newTask.start(function () {
            should.exists(newTask.uuid);
            tasks.processTask('testTask', function (task, doneTask) {
                doneTask();
                should.equal(task.uuid, newTask.uuid);
                should.equal(task.title, "test");
                should.equal(task.data.value, 1);
                done();
            });
        });
    });
});
//# sourceMappingURL=tasks.js.map