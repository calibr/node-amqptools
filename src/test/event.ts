import { amqpManager as amqpTools } from "../index"

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
  })
});