/// <reference path="../typings/tsd.d.ts" />
var amqpLib = require("amqplib/callback_api");
var eventManager = require("./eventEmitter");
var rpcManager = require("./rpc");
var taskManager = require("./task");
var async = require("async");
require('source-map-support').install();
var connectionURI, channel, connection, _connectInProgress = false, _connectCallbacks = [];
function _connect(cb) {
    if (channel) {
        return cb(channel);
    }
    _connectCallbacks.push(cb);
    if (_connectInProgress)
        return;
    _connectInProgress = true;
    amqpLib.connect(connectionURI, function (err, conn) {
        if (err) {
            throw err;
        }
        connection = conn;
        conn.createChannel(function (err, amqpChannel) {
            if (err) {
                throw err;
            }
            eventManager.setChannel(amqpChannel);
            rpcManager.setChannel(amqpChannel);
            channel = amqpChannel;
            _connectInProgress = false;
            _connectCallbacks.forEach(function (extraCb) {
                extraCb(channel);
            });
            _connectCallbacks = [];
        });
    });
}
eventManager._connect = _connect;
rpcManager._connect = _connect;
taskManager._connect = _connect;
function setConnectionURI(uri) {
    connectionURI = uri;
}
exports.setConnectionURI = setConnectionURI;
function disconnect(cb) {
    if (!connection) {
        return cb();
    }
    connection.close(function () {
        connection = null;
        channel = null;
        cb();
    });
}
exports.disconnect = disconnect;
function reconnect(cb) {
    cb = cb || function () { };
    async.series([
        function (next) {
            if (!connection) {
                return next();
            }
            connection.close(function () {
                connection = null;
                channel = null;
                next();
            });
        },
        function () {
            _connect(function (channel) {
                cb();
            });
        }
    ]);
}
exports.reconnect = reconnect;
exports.events = eventManager;
exports.rpc = rpcManager;
exports.tasks = taskManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiX2Nvbm5lY3QiLCJzZXRDb25uZWN0aW9uVVJJIiwiZGlzY29ubmVjdCIsInJlY29ubmVjdCJdLCJtYXBwaW5ncyI6IkFBQUEsNENBQTRDO0FBRTVDLElBQU8sT0FBTyxXQUFXLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsSUFBTyxZQUFZLFdBQVcsZ0JBQWdCLENBQUMsQ0FBQTtBQUMvQyxJQUFPLFVBQVUsV0FBVyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxJQUFPLFdBQVcsV0FBVyxRQUFRLENBQUMsQ0FBQTtBQUN0QyxJQUFPLEtBQUssV0FBVyxPQUFPLENBQUMsQ0FBQTtBQUUvQixPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUV4QyxJQUFJLGFBQWEsRUFDZixPQUFPLEVBQ1AsVUFBVSxFQUNWLGtCQUFrQixHQUFHLEtBQUssRUFDMUIsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBRXpCLGtCQUFrQixFQUFFO0lBQ2xCQSxFQUFFQSxDQUFBQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNYQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7SUFFREEsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUMzQkEsRUFBRUEsQ0FBQUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUU5QkEsa0JBQWtCQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUMxQkEsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsYUFBYUEsRUFBRUEsVUFBU0EsR0FBR0EsRUFBRUEsSUFBSUE7UUFDL0MsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNQLE1BQU0sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUNELFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFTLEdBQUcsRUFBRSxXQUFXO1lBQzFDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsTUFBTSxHQUFHLENBQUM7WUFDWixDQUFDO1lBQ0QsWUFBWSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyQyxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFDdEIsa0JBQWtCLEdBQUcsS0FBSyxDQUFDO1lBQzNCLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFTLE9BQU87Z0JBQ3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUNILGlCQUFpQixHQUFHLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQ0EsQ0FBQ0E7QUFDTEEsQ0FBQ0E7QUFFRCxZQUFZLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUNqQyxVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUMvQixXQUFXLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztBQUVoQywwQkFBa0MsR0FBRztJQUNuQ0MsYUFBYUEsR0FBR0EsR0FBR0EsQ0FBQ0E7QUFDdEJBLENBQUNBO0FBRmUsd0JBQWdCLG1CQUUvQixDQUFBO0FBRUQsb0JBQTRCLEVBQUU7SUFDNUJDLEVBQUVBLENBQUFBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO1FBQ2ZBLE1BQU1BLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO0lBQ2RBLENBQUNBO0lBQ0RBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBO1FBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQztRQUNsQixPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2YsRUFBRSxFQUFFLENBQUM7SUFDUCxDQUFDLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBO0FBVGUsa0JBQVUsYUFTekIsQ0FBQTtBQUVELG1CQUEwQixFQUFFO0lBQzFCQyxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxjQUFZLENBQUMsQ0FBQ0E7SUFDekJBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBO1FBQ1hBLFVBQVNBLElBQUlBO1lBQ1gsRUFBRSxDQUFBLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQixDQUFDO1lBQ0QsVUFBVSxDQUFDLEtBQUssQ0FBQztnQkFDZixVQUFVLEdBQUcsSUFBSSxDQUFDO2dCQUNsQixPQUFPLEdBQUcsSUFBSSxDQUFDO2dCQUNmLElBQUksRUFBRSxDQUFDO1lBQ1QsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0RBO1lBQ0UsUUFBUSxDQUFDLFVBQVUsT0FBTztnQkFDeEIsRUFBRSxFQUFFLENBQUE7WUFDTixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7S0FDRkEsQ0FBQ0EsQ0FBQ0E7QUFFTEEsQ0FBQ0E7QUFwQmUsaUJBQVMsWUFvQnhCLENBQUE7QUFFVSxjQUFNLEdBQUcsWUFBWSxDQUFDO0FBQ3RCLFdBQUcsR0FBRyxVQUFVLENBQUM7QUFDakIsYUFBSyxHQUFHLFdBQVcsQ0FBQyJ9