var amqp = require("amqplib/callback_api");
var events = require("./events");
var rpc = require("./rpc");
var async = require("async");

var connectionURI;
var channel;
var connection;

var _connectInProgress = false;
var _connectCallbacks = [];
function _connect(cb) {
  if(channel) {
    return cb(channel);
  }
  if(_connectInProgress) {
    _connectCallbacks.push(cb);
    return;
  }
  _connectInProgress = true;
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
      _connectInProgress = false;
      _connectCallbacks.forEach(function(extraCb) {
        extraCb();
      });
      _connectCallbacks = [];
      cb();
    });
  });
}

events._connect = _connect;
rpc._connect = _connect;

exports.setConnectionURI = function(uri) {
  connectionURI = uri;
};

exports.disconnect = function(cb) {
  if(!connection) {
    return cb();
  }
  connection.close(function() {
    connection = null;
    channel = null;
    cb();
  });
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