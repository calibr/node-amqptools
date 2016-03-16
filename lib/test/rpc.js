var
  tools = require("../index").amqpManager,
  should = require("should"),
  async = require("async");

tools.setConnectionURI("amqp://192.168.99.100");

var RPC = tools.rpc;

describe("RPC", function() {
  describe("simple rpc", function() {
    var rpc = new RPC();
    var processorCalledTimes = 0;
    after(function(done) {
      RPC.purgeActionQueue("action", done);
    });
    it("should register processor", function(done) {
      rpc.register("action", function(result, cb) {
        processorCalledTimes++;
        cb(null, "nice");
      }, done);
    });

    it("should call processor", function(done) {
      rpc.call("action", function(err, res) {
        should.not.exists(err);
        res.should.equal("nice");
        processorCalledTimes.should.equal(1);
        done();
      });
    });

    it("should un register processor", function(done) {
      rpc.unregister("action", function(err) {
        should.not.exists(err);
        processorCalledTimes.should.equal(1);
        done();
      });
    });

    it("should not call processor", function(done) {
      setTimeout(function() {
        done();
      }, 1000);
      rpc.call("action", function(err, res) {
        throw new Error("should not called");
      });
    });
  });

  describe("Multiple RPC processors", function() {
    var rpc1 = new RPC();
    var rpc2 = new RPC();
    var processor1CalledTimes = 0;
    var processor2CalledTimes = 0;
    after(function(done) {
      async.series([
        function(next) {
          rpc1.unregister("action", next);
        },
        function(next) {
          rpc2.unregister("action", next);
        },
        function(next) {
          RPC.purgeActionQueue("action", next);
        }
      ], done);
    });
    before(function(done) {
      async.series([
        function(next) {
          rpc1.register("action", function(params, cb) {
            processor1CalledTimes++;
            cb(null, "nice");
          }, next);
        },
        function(next) {
          rpc2.register("action", function(params, cb) {
            processor2CalledTimes++;
            cb(null, "nice");
          }, next);
        }
      ], done);
    });

    it("call action 10 times", function(done) {
      async.times(10, function(n, next) {
        rpc1.call("action", function(err, res) {
          should.not.exists(err);
          res.should.equal("nice");
          next();
        });
      }, done);
    });

    it("should be called 10 times", function() {
      (processor1CalledTimes + processor2CalledTimes).should.equal(10);
      processor1CalledTimes.should.be.greaterThan(0);
      processor2CalledTimes.should.be.greaterThan(0);
    });
  });

  describe("request with params", function() {
    var rpc = new RPC();
    var receivedData = [];
    var sendData = [
      "string",
      123,
      {key1: 1, nestedKey: {key: "value"}},
      [1,2,3,"4",{a: "b", nestedKey: {key: "value"}}]
    ];
    after(function(done) {
      async.series([
        function(next) {
          rpc.unregister("action", next);
        },
        function(next) {
          RPC.purgeActionQueue("action", next);
        }
      ], done);
    });
    before(function(done) {
      rpc.register("action", function(params, cb) {
        receivedData.push(params);
        cb(null);
      }, done);
    });
    it("send all data", function(done) {
      async.eachSeries(sendData, function(data, next) {
        rpc.call("action", data, next);
      }, done);
    });
    it("check data", function() {
      for(var i = 0; i != sendData.length; i++) {
        var sent = sendData[i];
        var received = receivedData[i];
        sent.should.eql(received);
      }
    });
  });

  describe("response data", function() {
    var rpc = new RPC();
    var receivedData = [];
    var sendData = [
      "string",
      123,
      {key1: 1, nestedKey: {key: "value"}},
      [1,2,3,"4",{a: "b", nestedKey: {key: "value"}}]
    ];
    var indexToSend = -1;
    after(function(done) {
      async.series([
        function(next) {
          rpc.unregister("action", next);
        },
        function(next) {
          RPC.purgeActionQueue("action", next);
        }
      ], done);
    });
    before(function(done) {
      rpc.register("action", function(params, cb) {
        cb(null, sendData[++indexToSend]);
      }, done);
    });
    it("receive all data", function(done) {
      async.eachSeries(sendData, function(data, next) {
        rpc.call("action", function(err, res) {
          receivedData.push(res);
          next(err);
        });
      }, done);
    });
    it("check data", function() {
      for(var i = 0; i != sendData.length; i++) {
        var sent = sendData[i];
        var received = receivedData[i];
        sent.should.eql(received);
      }
    });
  });
});