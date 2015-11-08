/// <reference path="../typings/tsd.d.ts" />
var eventManager = require("./EventEmitter");
var rpcManager = require("./RPCManager");
var ChannelManager = require("./ChannelManager");
var TaskManager_1 = require("./TaskManager");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOlsiQU1RUE1hbmFnZXIiLCJBTVFQTWFuYWdlci5jb25zdHJ1Y3RvciIsIkFNUVBNYW5hZ2VyLmV2ZW50cyIsIkFNUVBNYW5hZ2VyLnJwYyIsIkFNUVBNYW5hZ2VyLnRhc2tzIiwiQU1RUE1hbmFnZXIuc2V0Q29ubmVjdGlvblVSSSIsIkFNUVBNYW5hZ2VyLmRpc2Nvbm5lY3QiLCJBTVFQTWFuYWdlci5yZWNvbm5lY3QiXSwibWFwcGluZ3MiOiJBQUFBLDRDQUE0QztBQUc1QyxJQUFPLFlBQVksV0FBVyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQy9DLElBQU8sVUFBVSxXQUFXLGNBQWMsQ0FBQyxDQUFBO0FBSTNDLElBQU8sY0FBYyxXQUFXLGtCQUFrQixDQUFDLENBQUM7QUFDcEQsNEJBQTRCLGVBQWUsQ0FBQyxDQUFBO0FBRTVDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBRXhDO0lBSUVBO1FBQ0VDLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLGNBQWNBLEVBQUVBLENBQUNBO0lBQzdDQSxDQUFDQTtJQUVERCxzQkFBSUEsK0JBQU1BO2FBQVZBO1lBQ0VFLFlBQVlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1lBQ2xEQSxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7OztPQUFBRjtJQUVEQSxzQkFBSUEsNEJBQUdBO2FBQVBBO1lBQ0VHLFVBQVVBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1lBQ2hEQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7OztPQUFBSDtJQUVEQSxzQkFBSUEsOEJBQUtBO2FBQVRBO1lBQ0VJLHlCQUFXQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtZQUNqREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3RCQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSx5QkFBV0EsRUFBRUEsQ0FBQ0E7WUFDdkNBLENBQUNBO1lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBO1FBQzFCQSxDQUFDQTs7O09BQUFKO0lBRURBLHNDQUFnQkEsR0FBaEJBLFVBQWlCQSxHQUFHQTtRQUNsQkssSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM1Q0EsQ0FBQ0E7SUFFREwsZ0NBQVVBLEdBQVZBLFVBQVdBLEVBQUVBO1FBQ1hNLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFVBQVVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3JDQSxDQUFDQTtJQUVETiwrQkFBU0EsR0FBVEEsVUFBVUEsRUFBR0E7UUFDWE8sSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDcENBLENBQUNBO0lBQ0hQLGtCQUFDQTtBQUFEQSxDQUFDQSxBQXJDRCxJQXFDQztBQUVELElBQUksV0FBVyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7QUFFcEMsaUJBQVMsV0FBVyxDQUFDIn0=