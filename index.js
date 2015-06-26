var amqp = require("amqplib/callback_api");
var events = require("./events");
var rpc = require("./rpc");
var  async = require("async");

var connectionURI;
var channel;
var connection;

function _connect(cb) {
  if(channel) {
    return cb(channel);
  }
  amqp.connect(connectionURI, function(err, conn) {
    if(err) {
      throw err;
    }
    connection = conn;
    conn.createChannel(function(err, amqpChannel) {
      if(err) {
        throw err;
      }
      events.setChannel(amqpChannel);
      rpc.setChannel(amqpChannel);
      channel = amqpChannel;
      cb();
    });
  });
}

events._connect = _connect;
rpc._connect = _connect;

exports.setConnectionURI = function(uri) {
  connectionURI = uri;
};

exports.reconnect = function(cb) {
  cb = cb || function() {};
  async.series([
    function(next) {
      if(!connection) {
        return next();
      }
      connection.close(function() {
        connection = null;
        channel = null;
        next();
      });
    },
    function() {
      _connect(cb);
    }
  ]);

};

exports.events = events;
exports.rpc = rpc;