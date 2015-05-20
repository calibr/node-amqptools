var
  tools = require("../index"),
  should = require("should"),
  async = require("async");

tools.setConnectionURI("amqp://localhost");

describe("Events", function() {
  var eventsUsed = [];

  before(function(done) {
    done();
  });
  after(function(done) {
    done();
  });

  beforeEach(function(done) {
    tools.reconnect(function() {
      done();
    });
  });

  it("should catch event", function(done) {
    var events = new tools.events();
    function _listener() {
      events.removeListener("test", _listener);
      done();
    }
    events.on("test", _listener);
    events.emit("test");
  });

  it("should not call listener", function(done) {
    var events = new tools.events();
    function _listener() {
      events.removeListener("test", _listener);
      throw "Listener called";
    }
    events.on("test", _listener);
    events.emit("test2");
    setTimeout(function() {
      events.removeListener("test", _listener);
      done();
    }, 500);
  });

  it("should call two listeners", function(done) {
    var events1 = new tools.events("app1");
    var events2 = new tools.events("app2");
    var listener1Called = false;
    var listener2Called = false;
    function _listener1() {
      events1.removeListener("test", _listener1);
      listener1Called = true;
    }
    function _listener2() {
      events2.removeListener("test", _listener2);
      listener2Called = true;
    }
    events1.on("test", _listener1);
    events2.on("test", _listener2);
    setTimeout(function() {
      listener1Called.should.equal(true);
      listener2Called.should.equal(true);
      done();
    }, 500);
    events1.emit("test");
  });

  it("should call only one listener", function(done) {
    var events1 = new tools.events("sameapp");
    var events2 = new tools.events("sameapp");
    var listener1Called = false;
    var listener2Called = false;
    function _listener1() {
      events1.removeListener("test", _listener1);
      listener1Called = true;
    }
    function _listener2() {
      events2.removeListener("test", _listener2);
      listener2Called = true;
    }
    events1.on("test", _listener1);
    events2.on("test", _listener2);
    setTimeout(function() {
      (listener1Called || listener2Called).should.equal(true);
      if(listener1Called) {
        listener2Called.should.equal(false);  
      }
      if(listener2Called) {
        listener1Called.should.equal(false);  
      }
      done();
    }, 500);
    events1.emit("test");
  });

  it("should summary call two listeners of one process 20 times(same event)", function(done) {
    // same process have two listeners, each listener will be called when event occurent
    var events = new tools.events("app");
    var listener1Called = 0;
    var listener2Called = 0;
    function _listener1() {
      listener1Called++;
    }
    function _listener2() {
      listener2Called++;
    }
    events.on("test", _listener1);
    events.on("test", _listener2);
    setTimeout(function() {
      events.removeListener("test", _listener1);
      events.removeListener("test", _listener2);
      (listener2Called + listener1Called).should.equal(20);
      done();
    }, 1000);
    for(var i = 0; i != 10; i++) {
      events.emit("test");
    }
  });

  it("should summary call two listeners of two process with different apps 20 times(same event)", function(done) {
    var events1 = new tools.events("app");
    var events2 = new tools.events("app2");
    var listener1Called = 0;
    var listener2Called = 0;
    function _listener1() {
      listener1Called++;
    }
    function _listener2() {
      listener2Called++;
    }
    events1.on("test", _listener1);
    events2.on("test", _listener2);
    setTimeout(function() {
      events1.removeListener("test", _listener1);
      events2.removeListener("test", _listener2);
      (listener2Called + listener1Called).should.equal(20);
      done();
    }, 1000);
    for(var i = 0; i != 10; i++) {
      events1.emit("test");
    }
  });

  it("should summary call two listeners of two process with same apps 10 times(same event)", function(done) {
    var events1 = new tools.events("app");
    var events2 = new tools.events("app");
    var listener1Called = 0;
    var listener2Called = 0;
    function _listener1() {
      listener1Called++;
    }
    function _listener2() {
      listener2Called++;
    }
    events1.on("test", _listener1);
    events2.on("test", _listener2);
    setTimeout(function() {
      events1.removeListener("test", _listener1);
      events2.removeListener("test", _listener2);
      (listener2Called + listener1Called).should.equal(10);
      done();
    }, 1000);
    for(var i = 0; i != 10; i++) {
      events1.emit("test");
    }
  });

  it("should call listener with topic", function(done) {
    var events = new tools.events();
    function _listener() {
      events.removeListener("base:topic", _listener);
      done();
    }
    events.on("base:topic", _listener);
    events.emit("base:topic");
  });

  it("should summary call two listeners of two process with same apps 10 times(same event) with topic", function(done) {
    var events1 = new tools.events("app");
    var events2 = new tools.events("app");
    var listener1Called = 0;
    var listener2Called = 0;
    function _listener1() {
      listener1Called++;
    }
    function _listener2() {
      listener2Called++;
    }
    events1.on("base:topic", _listener1);
    events2.on("base:topic", _listener2);
    setTimeout(function() {
      events1.removeListener("base:topic", _listener1);
      events2.removeListener("base:topic", _listener2);
      (listener2Called + listener1Called).should.equal(10);
      done();
    }, 1000);
    for(var i = 0; i != 10; i++) {
      events1.emit("base:topic");
    }
  });

  it("should call listener with payload", function(done) {
    var events = new tools.events();
    var data = {
      field: "value"
    };
    function _listener(inData) {
      inData.should.eql(data);
      events.removeListener("base:topic", _listener);
      done();
    }
    events.on("base:topic", _listener);
    events.emit("base:topic", data);
  });
});