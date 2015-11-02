var amqp = require("amqplib/callback_api"),
  events = require("./events"),
  rpc = require("./rpc"),
  tasks = require("./tasks"),
  async = require("async");

var connectionURI,
  channel,
  connection;

var _connectInProgress = false,
  _connectCallbacks = [];

function _connect(cb) {
  if(channel) {
    return cb(channel);
  }

  _connectCallbacks.push(cb);
  if(_connectInProgress) return;

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
        extraCb(channel);
      });
      _connectCallbacks = [];
    });
  });
}

events._connect = _connect;
rpc._connect = _connect;
tasks._connect = _connect;

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
      _connect(function (channel) {
        cb()
      });
    }
  ]);

};

exports.events = events;
exports.rpc = rpc;
exports.tasks = tasks;