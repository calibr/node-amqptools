var eventManager = require("./EventEmitter");
var rpcManager = require("./RPCManager");
var ChannelManager_1 = require('./ChannelManager');
var TaskManager_1 = require("./TaskManager");
var Event_1 = require("./Event");
var EventListener_1 = require("./EventListener");
require('source-map-support').install();
var AMQPManager = (function () {
    function AMQPManager() {
    }
    Object.defineProperty(AMQPManager.prototype, "events", {
        get: function () {
            return eventManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMQPManager.prototype, "rpc", {
        get: function () {
            return rpcManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMQPManager.prototype, "tasks", {
        get: function () {
            if (!this.taskManager) {
                this.taskManager = new TaskManager_1.TaskManager();
            }
            return this.taskManager;
        },
        enumerable: true,
        configurable: true
    });
    AMQPManager.prototype.createEvent = function (options) {
        return new Event_1.Event(options);
    };
    AMQPManager.prototype.createEventListener = function (options) {
        return new EventListener_1.EventListener(options);
    };
    AMQPManager.prototype.setConnectionURI = function (uri) {
        ChannelManager_1.channelManager.setConnectionURI(uri);
    };
    AMQPManager.prototype.disconnect = function (cb) {
        ChannelManager_1.channelManager.disconnect(cb);
    };
    AMQPManager.prototype.reconnect = function (cb) {
        ChannelManager_1.channelManager.reconnect(cb);
    };
    return AMQPManager;
})();
exports.AMQPManager = AMQPManager;
var amqpManager = new AMQPManager();
module.exports = amqpManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiQU1RUE1hbmFnZXIiLCJBTVFQTWFuYWdlci5jb25zdHJ1Y3RvciIsIkFNUVBNYW5hZ2VyLmV2ZW50cyIsIkFNUVBNYW5hZ2VyLnJwYyIsIkFNUVBNYW5hZ2VyLnRhc2tzIiwiQU1RUE1hbmFnZXIuY3JlYXRlRXZlbnQiLCJBTVFQTWFuYWdlci5jcmVhdGVFdmVudExpc3RlbmVyIiwiQU1RUE1hbmFnZXIuc2V0Q29ubmVjdGlvblVSSSIsIkFNUVBNYW5hZ2VyLmRpc2Nvbm5lY3QiLCJBTVFQTWFuYWdlci5yZWNvbm5lY3QiXSwibWFwcGluZ3MiOiJBQUNBLElBQU8sWUFBWSxXQUFXLGdCQUFnQixDQUFDLENBQUE7QUFDL0MsSUFBTyxVQUFVLFdBQVcsY0FBYyxDQUFDLENBQUE7QUFJM0MsK0JBQStCLGtCQUMvQixDQUFDLENBRGdEO0FBQ2pELDRCQUE0QixlQUFlLENBQUMsQ0FBQTtBQUM1QyxzQkFBc0IsU0FBUyxDQUFDLENBQUE7QUFDaEMsOEJBQThCLGlCQUFpQixDQUFDLENBQUE7QUFJaEQsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFFeEM7SUFBQUE7SUFxQ0FDLENBQUNBO0lBbENDRCxzQkFBSUEsK0JBQU1BO2FBQVZBO1lBQ0VFLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO1FBQ3RCQSxDQUFDQTs7O09BQUFGO0lBRURBLHNCQUFJQSw0QkFBR0E7YUFBUEE7WUFDRUcsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDcEJBLENBQUNBOzs7T0FBQUg7SUFFREEsc0JBQUlBLDhCQUFLQTthQUFUQTtZQUNFSSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLHlCQUFXQSxFQUFFQSxDQUFDQTtZQUN2Q0EsQ0FBQ0E7WUFDREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7UUFDMUJBLENBQUNBOzs7T0FBQUo7SUFFREEsaUNBQVdBLEdBQVhBLFVBQVlBLE9BQWdDQTtRQUMxQ0ssTUFBTUEsQ0FBQ0EsSUFBSUEsYUFBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDNUJBLENBQUNBO0lBRURMLHlDQUFtQkEsR0FBbkJBLFVBQW9CQSxPQUF3Q0E7UUFDMURNLE1BQU1BLENBQUNBLElBQUlBLDZCQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNwQ0EsQ0FBQ0E7SUFFRE4sc0NBQWdCQSxHQUFoQkEsVUFBaUJBLEdBQUdBO1FBQ2xCTywrQkFBY0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN2Q0EsQ0FBQ0E7SUFFRFAsZ0NBQVVBLEdBQVZBLFVBQVdBLEVBQUVBO1FBQ1hRLCtCQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFRFIsK0JBQVNBLEdBQVRBLFVBQVVBLEVBQUdBO1FBQ1hTLCtCQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUMvQkEsQ0FBQ0E7SUFDSFQsa0JBQUNBO0FBQURBLENBQUNBLEFBckNELElBcUNDO0FBckNZLG1CQUFXLGNBcUN2QixDQUFBO0FBRUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztBQUVwQyxpQkFBUyxXQUFXLENBQUMifQ==