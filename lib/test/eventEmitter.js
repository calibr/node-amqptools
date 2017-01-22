var
  tools = require("../index").amqpManager,
  should = require("should"),
  async = require("async");

tools.setConnectionURI("amqp://localhost");

describe("EventEmitter", function() {
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
    events.on("test", _listener, function(err) {
      should.not.exists(err);
      events.emit("test");
    });
  });

  it("should not call listener", function(done) {
    var events = new tools.events();
    function _listener() {
      events.removeListener("test", _listener);
      throw "Listener called";
    }
    events.on("test", _listener, function(err) {
      should.not.exists(err);
      events.emit("test2");
    });
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
    events1.on("test", _listener1, function(err) {
      should.not.exists(err);
      events2.on("test", _listener2, function(err) {
        should.not.exists(err);
        events1.emit("test");
      });
    });

    setTimeout(function() {
      listener1Called.should.equal(true);
      listener2Called.should.equal(true);
      done();
    }, 500);
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
    async.parallel([
      function(next) {
        events1.on("test", _listener1, next);
      },
      function(next) {
        events2.on("test", _listener2, next);
      }
    ], function(err) {
      should.not.exists(err);
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
    async.parallel([
      function(next) {
        events.on("test", _listener1, next);
      },
      function(next) {
        events.on("test", _listener2, next);
      }
    ], function(err) {
      should.not.exists(err);
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
    async.parallel([
      function(next) {
        events1.on("test", _listener1, next);
      },
      function(next) {
        events2.on("test", _listener2, next);
      }
    ], function(err) {
      should.not.exists(err);
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
    async.parallel([
      function(next) {
        events1.on("test", _listener1, next);
      },
      function(next) {
        events2.on("test", _listener2, next);
      }
    ], function(err) {
      should.not.exists(err);
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
  });

  it("should call listener with topic", function(done) {
    var events = new tools.events();
    function _listener() {
      events.removeListener("base:topic", _listener);
      done();
    }
    events.on("base:topic", _listener, function(err) {
      should.not.exists(err);
      events.emit("base:topic");
    });
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
    async.parallel([
      function(next) {
        events1.on("base:topic", _listener1, next);
      },
      function(next) {
        events2.on("base:topic", _listener2, next);
      }
    ], function(err) {
      should.not.exists(err);
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
    events.on("base:topic", _listener, function(err) {
      should.not.exists(err);
      events.emit("base:topic", data);
    });
  });

  describe("listeners for different events should be called separately #1", function(done) {
    var events = new tools.events("appl");
    var listenerOne;
    var listenerTwo;
    after(function() {
      events.removeListener("user:event1", listenerOne);
      events.removeListener("user:event2", listenerTwo);
    });

    it("should call only listener two", function(done) {
      listenerOne = function() {
        setTimeout(function() {
          done();
        }, 1000);
      };
      listenerTwo = function() {
        throw new Error("listener two should not be called");
      };
      events.on("user:event1", listenerOne, function() {
        events.on("user:event2", listenerTwo, function() {
          events.emit("user:event1");
        });
      });
    });
  });

  describe("listeners for different events should be called separately #2", function(done) {
    var events = new tools.events("appl");
    var listenerOne;
    var listenerTwo;
    after(function() {
      events.removeListener("user:event1", listenerOne);
      events.removeListener("user:event2", listenerTwo);
    });

    it("should call only listener two", function(done) {
      listenerOne = function() {
        throw new Error("listener one should not be called");
      };
      listenerTwo = function() {
        setTimeout(function() {
          done();
        }, 1000);
      };
      events.on("user:event1", listenerOne, function() {
        events.on("user:event2", listenerTwo, function() {
          events.emit("user:event2");
        });
      });
    });
  });
});