import { amqpManager as amqpTools } from "../index"
import {EventListener} from "../EventListener"
import * as sinon from "sinon"
import { wait } from './util'

require("should");

amqpTools.setConnectionURI("amqp://localhost");

describe("Finalize events", function() {
  beforeEach(function(done) {
    amqpTools.reconnect(function() {
      done();
    });
  });

  it("after finalization events should not be passed to listener", function(done) {
    this.timeout(15e3)
    const eventEmitter = new amqpTools.events('test-events2')
    const dataReceived = []
    eventEmitter.on('test-finalize:event', async (data) => {
      dataReceived.push(data)
    }, async () => {
      var event = amqpTools.createEvent({exchange: 'test-finalize', topic: 'event'})
      event.send({test: 'test'})

      await wait(500)
      dataReceived.length.should.equal(1)

      amqpTools.finalize()

      var event = amqpTools.createEvent({exchange: 'test-finalize', topic: 'event'})
      event.send({test: 'test'})

      await wait(500)
      dataReceived.length.should.equal(1)

      done()
    })
  });
})