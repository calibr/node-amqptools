var
  tools = require("../index"),
  sinon = require("sinon"),
  amqp = require("amqplib/callback_api"),
  async = require("async"),
  should = require("should");

describe("Misc", function() {
  describe("simultaneous connections", function() {
    before(function(done) {
      tools.disconnect(function() {
        sinon.spy(amqp, "connect");
        done();
      });
    });
    after(function() {
      amqp.connect.restore();
    });

    it("should process simultaneous connections requests", function(done) {
      async.times(10, function(n, next) {
        tools.reconnect(next);
      }, done);
    });

    it("connect should be called only once", function() {
      amqp.connect.callCount.should.equal(1);
    });
  });
});