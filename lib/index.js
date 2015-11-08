/// <reference path="../typings/tsd.d.ts" />
var eventManager = require("./EventEmitter");
var rpcManager = require("./RPCManager");
var ChannelManager = require("./ChannelManager");
var TaskManager_1 = require("./TaskManager");
var Event_1 = require("./Event");
var EventListener_1 = require("./EventListener");
require('source-map-support').install();
var AMQPManager = (function () {
    function AMQPManager() {
        this.channelManager = new ChannelManager();
    }
    Object.defineProperty(AMQPManager.prototype, "events", {
        get: function () {
            eventManager.channelManager = this.channelManager;
            return eventManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMQPManager.prototype, "rpc", {
        get: function () {
            rpcManager.channelManager = this.channelManager;
            return rpcManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMQPManager.prototype, "tasks", {
        get: function () {
            TaskManager_1.TaskManager.channelManager = this.channelManager;
            if (!this.taskManager) {
                this.taskManager = new TaskManager_1.TaskManager();
            }
            return this.taskManager;
        },
        enumerable: true,
        configurable: true
    });
    AMQPManager.prototype.createEvent = function (options) {
        Event_1.Event.channelManager = this.channelManager;
        return new Event_1.Event(options);
    };
    AMQPManager.prototype.createEventListener = function (options) {
        EventListener_1.EventListener.channelManager = this.channelManager;
        return new EventListener_1.EventListener(options);
    };
    AMQPManager.prototype.setConnectionURI = function (uri) {
        this.channelManager.setConnectionURI(uri);
    };
    AMQPManager.prototype.disconnect = function (cb) {
        this.channelManager.disconnect(cb);
    };
    AMQPManager.prototype.reconnect = function (cb) {
        this.channelManager.reconnect(cb);
    };
    return AMQPManager;
})();
var amqpManager = new AMQPManager();
module.exports = amqpManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiQU1RUE1hbmFnZXIiLCJBTVFQTWFuYWdlci5jb25zdHJ1Y3RvciIsIkFNUVBNYW5hZ2VyLmV2ZW50cyIsIkFNUVBNYW5hZ2VyLnJwYyIsIkFNUVBNYW5hZ2VyLnRhc2tzIiwiQU1RUE1hbmFnZXIuY3JlYXRlRXZlbnQiLCJBTVFQTWFuYWdlci5jcmVhdGVFdmVudExpc3RlbmVyIiwiQU1RUE1hbmFnZXIuc2V0Q29ubmVjdGlvblVSSSIsIkFNUVBNYW5hZ2VyLmRpc2Nvbm5lY3QiLCJBTVFQTWFuYWdlci5yZWNvbm5lY3QiXSwibWFwcGluZ3MiOiJBQUFBLDRDQUE0QztBQUc1QyxJQUFPLFlBQVksV0FBVyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQy9DLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFBO0FBSTNDLElBQU8sY0FBYyxXQUFXLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsNEJBQTRCLGVBQWUsQ0FBQyxDQUFBO0FBQzVDLHNCQUFzQixTQUFTLENBQUMsQ0FBQTtBQUNoQyw4QkFBOEIsaUJBQWlCLENBQUMsQ0FBQTtBQUloRCxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUV4QztJQUlFQTtRQUNFQyxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtJQUM3Q0EsQ0FBQ0E7SUFFREQsc0JBQUlBLCtCQUFNQTthQUFWQTtZQUNFRSxZQUFZQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtZQUNsREEsTUFBTUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7UUFDdEJBLENBQUNBOzs7T0FBQUY7SUFFREEsc0JBQUlBLDRCQUFHQTthQUFQQTtZQUNFRyxVQUFVQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtZQUNoREEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDcEJBLENBQUNBOzs7T0FBQUg7SUFFREEsc0JBQUlBLDhCQUFLQTthQUFUQTtZQUNFSSx5QkFBV0EsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDakRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUN0QkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEseUJBQVdBLEVBQUVBLENBQUNBO1lBQ3ZDQSxDQUFDQTtZQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUMxQkEsQ0FBQ0E7OztPQUFBSjtJQUVEQSxpQ0FBV0EsR0FBWEEsVUFBWUEsT0FBZ0NBO1FBQzFDSyxhQUFLQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUMzQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsYUFBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDNUJBLENBQUNBO0lBRURMLHlDQUFtQkEsR0FBbkJBLFVBQW9CQSxPQUF3Q0E7UUFDMURNLDZCQUFhQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUNuREEsTUFBTUEsQ0FBQ0EsSUFBSUEsNkJBQWFBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUVETixzQ0FBZ0JBLEdBQWhCQSxVQUFpQkEsR0FBR0E7UUFDbEJPLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRURQLGdDQUFVQSxHQUFWQSxVQUFXQSxFQUFFQTtRQUNYUSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxVQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNyQ0EsQ0FBQ0E7SUFFRFIsK0JBQVNBLEdBQVRBLFVBQVVBLEVBQUdBO1FBQ1hTLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3BDQSxDQUFDQTtJQUNIVCxrQkFBQ0E7QUFBREEsQ0FBQ0EsQUEvQ0QsSUErQ0M7QUFFRCxJQUFJLFdBQVcsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0FBRXBDLGlCQUFTLFdBQVcsQ0FBQyJ9