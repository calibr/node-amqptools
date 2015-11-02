/// <reference path="../typings/tsd.d.ts" />
var amqp = require("amqplib/callback_api");
var eventsLib = require("./event");
var rpcLib = require("./rpc");
var tasksLib = require("./task");
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
    amqp.connect(connectionURI, function (err, conn) {
        if (err) {
            throw err;
        }
        connection = conn;
        conn.createChannel(function (err, amqpChannel) {
            if (err) {
                throw err;
            }
            eventsLib.setChannel(amqpChannel);
            rpcLib.setChannel(amqpChannel);
            channel = amqpChannel;
            _connectInProgress = false;
            _connectCallbacks.forEach(function (extraCb) {
                extraCb(channel);
            });
            _connectCallbacks = [];
        });
    });
}
eventsLib._connect = _connect;
rpcLib._connect = _connect;
tasksLib._connect = _connect;
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
exports.events = eventsLib;
exports.rpc = rpcLib;
exports.tasks = tasksLib;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiX2Nvbm5lY3QiLCJzZXRDb25uZWN0aW9uVVJJIiwiZGlzY29ubmVjdCIsInJlY29ubmVjdCJdLCJtYXBwaW5ncyI6IkFBQUEsNENBQTRDO0FBRTVDLElBQU8sSUFBSSxXQUFXLHNCQUFzQixDQUFDLENBQUE7QUFDN0MsSUFBTyxTQUFTLFdBQVcsU0FBUyxDQUFDLENBQUE7QUFDckMsSUFBTyxNQUFNLFdBQVcsT0FBTyxDQUFDLENBQUE7QUFDaEMsSUFBTyxRQUFRLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFDbkMsSUFBTyxLQUFLLFdBQVcsT0FBTyxDQUFDLENBQUE7QUFFL0IsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFFeEMsSUFBSSxhQUFhLEVBQ2YsT0FBTyxFQUNQLFVBQVUsRUFDVixrQkFBa0IsR0FBRyxLQUFLLEVBQzFCLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUV6QixrQkFBa0IsRUFBRTtJQUNsQkEsRUFBRUEsQ0FBQUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDWEEsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRURBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDM0JBLEVBQUVBLENBQUFBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFFOUJBLGtCQUFrQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDMUJBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLEVBQUVBLFVBQVNBLEdBQUdBLEVBQUVBLElBQUlBO1FBQzVDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDUCxNQUFNLEdBQUcsQ0FBQztRQUNaLENBQUM7UUFDRCxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBUyxHQUFHLEVBQUUsV0FBVztZQUMxQyxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNQLE1BQU0sR0FBRyxDQUFDO1lBQ1osQ0FBQztZQUNELFNBQVMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUMvQixPQUFPLEdBQUcsV0FBVyxDQUFDO1lBQ3RCLGtCQUFrQixHQUFHLEtBQUssQ0FBQztZQUMzQixpQkFBaUIsQ0FBQyxPQUFPLENBQUMsVUFBUyxPQUFPO2dCQUN4QyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBO0FBRUQsU0FBUyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDOUIsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDM0IsUUFBUSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFFN0IsMEJBQWtDLEdBQUc7SUFDbkNDLGFBQWFBLEdBQUdBLEdBQUdBLENBQUNBO0FBQ3RCQSxDQUFDQTtBQUZlLHdCQUFnQixtQkFFL0IsQ0FBQTtBQUVELG9CQUE0QixFQUFFO0lBQzVCQyxFQUFFQSxDQUFBQSxDQUFDQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNmQSxNQUFNQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUNEQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQTtRQUNmLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEIsT0FBTyxHQUFHLElBQUksQ0FBQztRQUNmLEVBQUUsRUFBRSxDQUFDO0lBQ1AsQ0FBQyxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQTtBQVRlLGtCQUFVLGFBU3pCLENBQUE7QUFFRCxtQkFBMEIsRUFBRTtJQUMxQkMsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsY0FBWSxDQUFDLENBQUNBO0lBQ3pCQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNYQSxVQUFTQSxJQUFJQTtZQUNYLEVBQUUsQ0FBQSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsQ0FBQztZQUNELFVBQVUsQ0FBQyxLQUFLLENBQUM7Z0JBQ2YsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDbEIsT0FBTyxHQUFHLElBQUksQ0FBQztnQkFDZixJQUFJLEVBQUUsQ0FBQztZQUNULENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNEQTtZQUNFLFFBQVEsQ0FBQyxVQUFVLE9BQU87Z0JBQ3hCLEVBQUUsRUFBRSxDQUFBO1lBQ04sQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0ZBLENBQUNBLENBQUNBO0FBRUxBLENBQUNBO0FBcEJlLGlCQUFTLFlBb0J4QixDQUFBO0FBRVUsY0FBTSxHQUFHLFNBQVMsQ0FBQztBQUNuQixXQUFHLEdBQUcsTUFBTSxDQUFDO0FBQ2IsYUFBSyxHQUFHLFFBQVEsQ0FBQyJ9