import { amqpManager as amqpTools } from "../index";
import { channelManager } from "../ChannelManager";
import should = require("should");
var taskManager = amqpTools.tasks;

amqpTools.setConnectionURI("amqp://localhost");

describe("Task listeners", () => {
  before(() => {
    taskManager.service = "amqpTest";
  });

  it("should not keep listeners for created tasks", () => {
    const reconnect = channelManager.listenerCount("reconnect");
    const finalize = channelManager.listenerCount("finalize");
    for (let i = 0; i < 20000; i++) {
      taskManager.createTask('listeners-task', {title: "test", data: {value: i}});
    }
    should.equal(channelManager.listenerCount("reconnect"), reconnect);
    should.equal(channelManager.listenerCount("finalize"), finalize);
  });

  it("should keep listeners for a consuming task", async () => {
    const reconnect = channelManager.listenerCount("reconnect");
    const finalize = channelManager.listenerCount("finalize");
    await taskManager.processTask('listeners-task', (task, doneTask) => doneTask());
    should.equal(channelManager.listenerCount("reconnect"), reconnect + 1);
    should.equal(channelManager.listenerCount("finalize"), finalize + 1);
  });
});
