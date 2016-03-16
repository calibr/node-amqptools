"use strict";
var EventEmitter_1 = require("./EventEmitter");
var ChannelManager_1 = require('./ChannelManager');
var TaskManager_1 = require("./TaskManager");
var Event_1 = require("./Event");
var EventListener_1 = require("./EventListener");
var RPCManager_1 = require("./RPCManager");
var AMQPManager = (function () {
    function AMQPManager() {
    }
    Object.defineProperty(AMQPManager.prototype, "events", {
        get: function () {
            return EventEmitter_1.AMQPEventEmitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AMQPManager.prototype, "rpc", {
        get: function () {
            return RPCManager_1.RPCManager;
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
}());
exports.AMQPManager = AMQPManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQU1RUE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvQU1RUE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBLDZCQUFpRCxnQkFFakQsQ0FBQyxDQUZnRTtBQUtqRSwrQkFBK0Isa0JBQy9CLENBQUMsQ0FEZ0Q7QUFDakQsNEJBQTRCLGVBQWUsQ0FBQyxDQUFBO0FBQzVDLHNCQUFzQixTQUFTLENBQUMsQ0FBQTtBQUNoQyw4QkFBOEIsaUJBQWlCLENBQUMsQ0FBQTtBQUdoRCwyQkFBMkIsY0FFM0IsQ0FBQyxDQUZ3QztBQUV6QztJQUFBO0lBcUNBLENBQUM7SUFsQ0Msc0JBQUksK0JBQU07YUFBVjtZQUNFLE1BQU0sQ0FBQywrQkFBWSxDQUFDO1FBQ3RCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksNEJBQUc7YUFBUDtZQUNFLE1BQU0sQ0FBQyx1QkFBVSxDQUFDO1FBQ3BCLENBQUM7OztPQUFBO0lBRUQsc0JBQUksOEJBQUs7YUFBVDtZQUNFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSx5QkFBVyxFQUFFLENBQUM7WUFDdkMsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzFCLENBQUM7OztPQUFBO0lBRUQsaUNBQVcsR0FBWCxVQUFZLE9BQWdDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLGFBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQseUNBQW1CLEdBQW5CLFVBQW9CLE9BQXdDO1FBQzFELE1BQU0sQ0FBQyxJQUFJLDZCQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELHNDQUFnQixHQUFoQixVQUFpQixHQUFHO1FBQ2xCLCtCQUFjLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELGdDQUFVLEdBQVYsVUFBVyxFQUFFO1FBQ1gsK0JBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELCtCQUFTLEdBQVQsVUFBVSxFQUFHO1FBQ1gsK0JBQWMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQXJDRCxJQXFDQztBQXJDWSxtQkFBVyxjQXFDdkIsQ0FBQSJ9