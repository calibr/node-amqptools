import amqpLib = require("amqplib/callback_api")
import Promise = require('bluebird')

class ChannelManager {
  connectionURI:string;
  channel:amqpLib.Channel;
  channelPromise: Promise<amqpLib.Channel>;
  connection:amqpLib.Connection;

  private connectCallbacks:((err:Error, channel:amqpLib.Channel) => void)[];
  private connectInProgress:boolean;

  constructor() {
    this.connectCallbacks = [];
  }

  connect(cb) {
    if (this.channel) {
      return cb(null, this.channel);
    }

    this.connectCallbacks.push(cb);
    if (this.connectInProgress) return;
    this.connectInProgress = true;

    amqpLib.connect(this.connectionURI, (err, connection) => {
      if (err) return this.connectRespond(err, null);
      this.connection = connection;

      this.connection.createChannel((err, channel) => {
        if (err) return this.connectRespond(err, null);
        this.channel = channel;

        this.connectRespond(null, this.channel)
      });
    });
  }

  connectRespond(err, channel) {
    this.connectInProgress = false;

    this.connectCallbacks.forEach((extraCb) => {
      extraCb(err, channel);
    });
    this.connectCallbacks = [];
  }

  getChannel() {
    if (!this.channelPromise) {
      this.channelPromise = new Promise((resolve, reject) => {
        this.connect((err, channel) => {
          if (err) return reject(err);
          resolve(channel);
        })
      });
    }
    return this.channelPromise;
  }

  setConnectionURI(uri) {
    this.connectionURI = uri;
  }

  disconnect(cb) {
    if (!this.connection) {
      return cb();
    }
    this.connection.close(() => {
      this.connection = null;
      this.channel = null;
      this.channelPromise = null;
      cb();
    });
  }

  reconnect(cb?) {
    this.disconnect(() => {
      this.connect(cb);
    });
  }
}

export = ChannelManager