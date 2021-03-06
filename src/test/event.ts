import { amqpManager as amqpTools } from "../index"
import {EventListener} from "../EventListener"
import * as sinon from "sinon"

require("should");

amqpTools.setConnectionURI("amqp://localhost");

describe("Events", function() {
  beforeEach(function(done) {
    amqpTools.reconnect(function() {
      done();
    });
  });

  it("listener to all events should catch event", function(done) {
    var listener = amqpTools.createEventListener({});
    listener.listen((message) => {
      done();
    }).then(() => {
      var event = amqpTools.createEvent({exchange: 'note', topic: 'update'});
      event.send({test: 'test'});
    })
  });

  it("listener to userId event should catch event with userId", function (done) {
    var listener = amqpTools.createEventListener({userId: 'testUser'});
    listener.listen((message) => {
      done();
    }).then(() => {
      var event = amqpTools.createEvent({exchange: 'note', topic: 'update', userId: 'testUser'});
      event.send({test: 'test'});
    })
  });

  it("listener to userId event shouldn't catch event without userId", function (done) {
    var listener = amqpTools.createEventListener({userId: 'testUser'});
    listener.listen((message) => {
      done('Error wrong listener');
    }).then(() => {
      var event = amqpTools.createEvent({exchange: 'note', topic: 'update'});
      event.send({test: 'test'});
    });

    setTimeout(done, 500);
  });

  it("listener to userId event shouldn't catch event with other userId", function (done) {
    var listener = amqpTools.createEventListener({userId: 'testUser'});
    listener.listen((message) => {
      done('Error wrong listener');
    }).then(() => {
      var event = amqpTools.createEvent({exchange: 'note', topic: 'update', userId: 'anotherUser'});
      event.send({test: 'test'});
    });

    setTimeout(done, 500);
  });

  describe("Listen persistently", () => {
    var eventListenerListenStub;
    var eventListener;
    before(() => {
      eventListenerListenStub = sinon.stub(EventListener.prototype, "listen", function() {
        eventListener = this;
        return Promise.resolve();
      });
    });
    after(() => {
      eventListenerListenStub.restore();
    });

    it("should set a persistent listener", (done) => {
      var events = new amqpTools.events("app-client");
      return events.on({
        event: "event-name",
        persistent: true
      }, () => {
      }, () => {
        eventListenerListenStub.calledOnce.should.equal(true);
        eventListener.persistent.should.equal(true);
        eventListener.queueOptions.durable.should.equal(true);
        eventListener.queueOptions.autoDelete.should.equal(false);
        done();
      });
    });

    it("by default listener should be not persistent", (done) => {
      eventListenerListenStub.reset();
      eventListener = null;
      var events = new amqpTools.events("app-client");
      return events.on("event-name", () => {
      }, () => {
        eventListenerListenStub.calledOnce.should.equal(true);
        eventListener.persistent.should.equal(false);
        done();
      });
    });
  });

  describe("Manually acked events", () => {
    var eventListenerListenStub;
    var eventListenerAckStub;
    var eventListener;
    var events;
    var listenerFunc = sinon.spy(() => {});
    var amqpMessage = {
      content: JSON.stringify("hello world")
    };
    before(() => {
      events = new amqpTools.events("app-client");
      eventListenerListenStub = sinon.stub(EventListener.prototype, "listen", function() {
        eventListener = this;
        eventListener.listener = listenerFunc;
        return Promise.resolve();
      });
      eventListenerAckStub = sinon.stub(EventListener.prototype, "ack", function() {
      });
    });
    after(() => {
      eventListenerListenStub.restore();
      eventListenerAckStub.restore();
    });

    it("should set a manually-acked listener", (done) => {
      return events.on({
        event: "event-name",
        autoAck: false
      }, listenerFunc, () => {
        eventListenerListenStub.calledOnce.should.equal(true);
        eventListener.autoAck.should.equal(false);
        done();
      });
    });

    it("should trigger listener with an ack function", () => {
      eventListener.onMessageReceived(amqpMessage);
      listenerFunc.calledOnce.should.equal(true);
      eventListenerAckStub.called.should.equal(false);
      listenerFunc.args[0][0].should.equal("hello world");
      var extra = listenerFunc.args[0][1];
      extra.ack();
      eventListenerAckStub.calledOnce.should.equal(true);
    });
  });
});