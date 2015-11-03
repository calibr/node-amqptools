/// <reference path="../typings/tsd.d.ts" />
var eventManager = require("./EventEmitter");
var rpcManager = require("./RPCManager");
var taskManager = require("./taskManager");
var ChannelManager = require("./ChannelManager");
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
            taskManager.channelManager = this.channelManager;
            return taskManager;
        },
        enumerable: true,
        configurable: true
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiQU1RUE1hbmFnZXIiLCJBTVFQTWFuYWdlci5jb25zdHJ1Y3RvciIsIkFNUVBNYW5hZ2VyLmV2ZW50cyIsIkFNUVBNYW5hZ2VyLnJwYyIsIkFNUVBNYW5hZ2VyLnRhc2tzIiwiQU1RUE1hbmFnZXIuc2V0Q29ubmVjdGlvblVSSSIsIkFNUVBNYW5hZ2VyLmRpc2Nvbm5lY3QiLCJBTVFQTWFuYWdlci5yZWNvbm5lY3QiXSwibWFwcGluZ3MiOiJBQUFBLDRDQUE0QztBQUc1QyxJQUFPLFlBQVksV0FBVyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQy9DLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFBO0FBQzNDLElBQU8sV0FBVyxXQUFXLGVBQWUsQ0FBQyxDQUFBO0FBRzdDLElBQU8sY0FBYyxXQUFXLGtCQUFrQixDQUFDLENBQUM7QUFFcEQsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFFeEM7SUFHRUE7UUFDRUMsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsY0FBY0EsRUFBRUEsQ0FBQ0E7SUFDN0NBLENBQUNBO0lBRURELHNCQUFJQSwrQkFBTUE7YUFBVkE7WUFDRUUsWUFBWUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDbERBLE1BQU1BLENBQUNBLFlBQVlBLENBQUNBO1FBQ3RCQSxDQUFDQTs7O09BQUFGO0lBRURBLHNCQUFJQSw0QkFBR0E7YUFBUEE7WUFDRUcsVUFBVUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDaERBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3BCQSxDQUFDQTs7O09BQUFIO0lBRURBLHNCQUFJQSw4QkFBS0E7YUFBVEE7WUFDRUksV0FBV0EsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDakRBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1FBQ3JCQSxDQUFDQTs7O09BQUFKO0lBRURBLHNDQUFnQkEsR0FBaEJBLFVBQWlCQSxHQUFHQTtRQUNsQkssSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM1Q0EsQ0FBQ0E7SUFFREwsZ0NBQVVBLEdBQVZBLFVBQVdBLEVBQUVBO1FBQ1hNLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3JDQSxDQUFDQTtJQUVETiwrQkFBU0EsR0FBVEEsVUFBVUEsRUFBR0E7UUFDWE8sSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBQ0hQLGtCQUFDQTtBQUFEQSxDQUFDQSxBQWpDRCxJQWlDQztBQUVELElBQUksV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7QUFFcEMsaUJBQVMsV0FBVyxDQUFDIn0=