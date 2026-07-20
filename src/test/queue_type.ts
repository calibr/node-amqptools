import { amqpManager as amqpTools } from "../index"
import { EventListener } from "../EventListener"
import { channelManager } from "../ChannelManager"
import * as http from "http"

require("should");

amqpTools.setConnectionURI("amqp://localhost");

// RabbitMQ management API used to inspect the created queue.
// Override for non-default setups, e.g. RABBITMQ_MGMT_URL=http://guest:guest@localhost:15673
const MGMT_URL = process.env.RABBITMQ_MGMT_URL || "http://guest:guest@localhost:15673";

function getQueueInfo(queueName: string): Promise<any> {
  const url = `${MGMT_URL}/api/queues/%2F/${encodeURIComponent(queueName)}`;
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`management API responded ${res.statusCode}: ${body}`));
        }
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    }).on("error", reject);
  });
}

function deleteQueue(queueName: string): Promise<void> {
  return channelManager.getChannel().then((channel) => new Promise<void>((resolve, reject) => {
    channel.deleteQueue(queueName, {}, (err) => err ? reject(err) : resolve());
  }));
}

describe('queue type for event listeners/tasks', () => {
  beforeEach(function (done) {
    amqpTools.reconnect(() => done());
  });

  // quorum queues must be named, durable and non-exclusive, which only the persistent
  // listener queues are — the default/runtime ephemeral queues stay classic
  it('creates a quorum queue on rabbitmq for persistent event listeners', function (done) {
    this.timeout(10000);
    const emitter = new amqpTools.events('test-quorum');
    const listener: any = new EventListener(
      { runtime: 'test-quorum', exchange: 'test', topic: 'quorum', persistent: true },
      emitter
    );
    listener.listen(() => { }).then(async () => {
      const info = await getQueueInfo(listener.queueName);
      // the requested queue type is echoed back in the queue arguments
      info.arguments['x-queue-type'].should.equal('quorum');
      // and rabbitmq resolves the queue to an actual quorum queue
      info.type.should.equal('quorum');
      listener.cancel();
      await deleteQueue(listener.queueName);
      done();
    }).catch(done);
  });

  // task queues are always named, durable and non-exclusive, so they default to quorum
  it('creates a quorum queue on rabbitmq for tasks', function (done) {
    this.timeout(10000);
    // accessing amqpTools.tasks wires up Task.taskManager so task.queueName resolves
    const task = amqpTools.tasks.createTask('test-quorum-task-2', { title: 'noop', data: {} });
    task.processTask(() => { }).then(async () => {
      const info = await getQueueInfo(task.queueName);
      // the requested queue type is echoed back in the queue arguments
      info.arguments['x-queue-type'].should.equal('quorum');
      // and rabbitmq resolves the queue to an actual quorum queue
      info.type.should.equal('quorum');
      task.cancel();
      await deleteQueue(task.queueName);
      done();
    }).catch(done);
  })
});
