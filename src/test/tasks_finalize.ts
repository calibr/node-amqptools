import { amqpManager as amqpTools } from "../index";
import should = require("should");
var taskManager = amqpTools.tasks;
import { wait } from './util'

amqpTools.setConnectionURI("amqp://localhost");

describe("Finalize tasks", () => {
  before((done) => {
    taskManager.service = "amqpTest";
    taskManager.purgeQueue('finalize-tasks', done);
  });

  it("should not receive task after finalization", async function (done) {
    this.timeout(15e3)

    let receivedTasks = 0

    taskManager.processTask('finalize-tasks', (task, doneTask) => {
      receivedTasks++
      doneTask()
    })

    const newTask = taskManager.createTask('finalize-tasks', {title: "test", data: {value: 1}});
    newTask.start()
    await wait(500)

    receivedTasks.should.equal(1)

    amqpTools.finalize()

    taskManager.createTask('finalize-tasks', {title: "test", data: {value: 1}}).start()
    await wait(500)

    receivedTasks.should.equal(1)

    done()
  })
})