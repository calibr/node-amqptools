/// <reference path="../../typings/tsd.d.ts" />

import tools = require("../index")
import should = require("should")
import bluebird = require("bluebird")
var taskManager = tools.tasks;

tools.setConnectionURI("amqp://localhost");

describe("Tasks", () => {
  before((done) => {
    taskManager.service = "amqpTest";
    taskManager.purgeQueue('testTask', done);
  });

  it("should produce task and consume it", (done) => {
    var newTask = taskManager.createTask('testTask', {title: "test", data: {value: 1}});
    newTask.start(() => {
      should.exists(newTask.uuid);
      taskManager.processTask('testTask', (task, doneTask) => {
        doneTask();
        should.equal(task.uuid, newTask.uuid);
        should.equal(task.title, "test");
        should.equal(task.data.value, 1);
        done();
      });
    })
  })
});