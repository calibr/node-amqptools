import { amqpManager as amqpTools } from "../index";
import should = require("should");
var taskManager = amqpTools.tasks;
import { wait } from './util'

amqpTools.setConnectionURI("amqp://localhost");

describe("Tasks events", () => {
  before((done) => {
    taskManager.service = "amqpTest";
    taskManager.purgeQueue('events-for-tasks', done);
  });

  it("should produce task and consume it", function (done) {
    this.timeout(15e3)

    const newTask = taskManager.createTask('events-for-tasks', {title: "test", data: {value: 1}});
    newTask.start(async () => {
      should.exists(newTask.uuid);
      taskManager.processTask('events-for-tasks', (task, doneTask) => {
        setTimeout(() => {
          doneTask()
        }, 3000)
      });

      await wait(1e3)
      taskManager.nowProcessingTask.size.should.equal(1)
      await wait(3e3)
      taskManager.nowProcessingTask.size.should.equal(0)
      done()
    })
  })
});