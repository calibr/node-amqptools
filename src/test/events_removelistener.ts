import { amqpManager as amqpTools } from "../index"
import {EventListener} from "../EventListener"
import * as sinon from "sinon"
import { wait } from './util'

require("should");

amqpTools.setConnectionURI("amqp://localhost");

describe("Events remove listener", function() {
  beforeEach(function(done) {
    amqpTools.reconnect(function() {
      done();
    });
  });

  it("after removing listener events should not be passed to listener", function(done) {
    this.timeout(15e3)
    const eventEmitter = new amqpTools.events('test-events3')
    const dataReceived = []
    const listener = async (data) => {
      dataReceived.push(data)
    }
    eventEmitter.on('test-remove-listener:event', listener, async () => {
      var event = amqpTools.createEvent({exchange: 'test-remove-listener', topic: 'event'})
      event.send({test: 'test'})

      await wait(500)
      dataReceived.length.should.equal(1)

      eventEmitter.removeListener('test-remove-listener:event', listener)

      var event = amqpTools.createEvent({exchange: 'test-remove-listener', topic: 'event'})
      event.send({test: 'test'})

      await wait(500)
      dataReceived.length.should.equal(1)

      done()
    })
  });
})