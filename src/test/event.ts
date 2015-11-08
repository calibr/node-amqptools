import tools = require("../index")
import should = require("should")
import {EventListener} from "../EventListener";

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
});