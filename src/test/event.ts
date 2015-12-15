import tools = require("../index")
import {EventListener} from "../EventListener";

require("should");

tools.setConnectionURI("amqp://localhost");

describe("Events", function() {
  beforeEach(function(done) {
    tools.reconnect(function() {
      done();
    });
  });

  it("listener to all events should catch event", function(done) {
    var listener = tools.createEventListener({});
    listener.listen((message) => {
      done();
    }).then(() => {
      var event = tools.createEvent({exchange: 'note', topic: 'update'});
      event.send({test: 'test'});
    })
  });

  it("listener to userId event should catch event with userId", function (done) {
    var listener = tools.createEventListener({userId: 'testUser'});
    listener.listen((message) => {
      done();
    }).then(() => {
      var event = tools.createEvent({exchange: 'note', topic: 'update', userId: 'testUser'});
      event.send({test: 'test'});
    })
  });

  it("listener to userId event shouldn't catch event without userId", function (done) {
    var listener = tools.createEventListener({userId: 'testUser'});
    listener.listen((message) => {
      done('Error wrong listener');
    }).then(() => {
      var event = tools.createEvent({exchange: 'note', topic: 'update'});
      event.send({test: 'test'});
    });

    setTimeout(done, 500);
  });

  it("listener to userId event shouldn't catch event with other userId", function (done) {
    var listener = tools.createEventListener({userId: 'testUser'});
    listener.listen((message) => {
      done('Error wrong listener');
    }).then(() => {
      var event = tools.createEvent({exchange: 'note', topic: 'update', userId: 'anotherUser'});
      event.send({test: 'test'});
    });

    setTimeout(done, 500);
  })
});