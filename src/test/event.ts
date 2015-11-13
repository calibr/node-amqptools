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
    var listener = new tools.events("someapp-that-listen-to-all-events");
    listener.on("#", function(data) {
      data.should.eql({test: 'test'});
      done();
    }, function() {
      var anotherApp = new tools.events("another-app-that-emit-events");
      anotherApp.emit("some:event:here", {test: 'test'});
    });
  });
});