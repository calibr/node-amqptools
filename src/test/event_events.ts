import { amqpManager as amqpTools } from "../index"
import {EventListener} from "../EventListener"
import * as sinon from "sinon"
import { wait } from './util'

require("should");

amqpTools.setConnectionURI("amqp://localhost");

describe("Events for events", function() {
  beforeEach(function(done) {
    amqpTools.reconnect(function() {
      done();
    });
  });

  it("listener to all events should catch event", function(done) {
    this.timeout(15e3)
    const eventEmitter = new amqpTools.events('test-events')
    const dataReceived = []
    eventEmitter.on('test:event', async (data) => {
      dataReceived.push(data)
      await wait(3000)
    }, async () => {
      var event = amqpTools.createEvent({exchange: 'test', topic: 'event'})
      event.send({test: 'test'})
      await wait(1000)
      console.log(dataReceived)
      eventEmitter.nowProcessingEvents.size.should.equal(1)
      await wait(3000)
      eventEmitter.nowProcessingEvents.size.should.equal(0)
      done()
    })
  });