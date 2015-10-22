/// <reference path="../typings/tsd.d.ts" />

import tools = require("../index")
import should = require("should")
import bluebird = require("bluebird")
var tasks = tools.tasks;
var Task = tasks.Task;

tools.setConnectionURI("amqp://localhost");

describe("Tasks", () => {
  it("should produce task and consume it", (done) => {

    tasks.service = "amqpTest";
    var newTask = new Task('testTask', {title: "test", data: {value: 1}});
    newTask.start(() => {
      should.exists(newTask.uuid);
      tasks.processTask('testTask', (task, doneTask) => {
        doneTask();
        should.equal(task.uuid, newTask.uuid);
        should.equal(task.title, "test");
        should.equal(task.data.value, 1);
        done();
      });
    })
  })
});