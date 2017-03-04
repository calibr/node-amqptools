"use strict";
const EventEmitter_1 = require("./EventEmitter");
const ChannelManager_1 = require("./ChannelManager");
const TaskManager_1 = require("./TaskManager");
const Event_1 = require("./Event");
const EventListener_1 = require("./EventListener");
const RPCManager_1 = require("./RPCManager");
class AMQPManager {
    get events() {
        return EventEmitter_1.AMQPEventEmitter;
    }
    get rpc() {
        return RPCManager_1.RPCManager;
    }
    get channelManager() {
        return ChannelManager_1.channelManager;
    }
    get tasks() {
        if (!this.taskManager) {
            this.taskManager = new TaskManager_1.TaskManager();
        }
        return this.taskManager;
    }
    createEvent(options) {
        return new Event_1.Event(options);
    }
    createEventListener(options) {
        return new EventListener_1.EventListener(options);
    }
    setConnectionURI(uri) {
        ChannelManager_1.channelManager.setConnectionURI(uri);
    }
    disconnect(cb) {
        ChannelManager_1.channelManager.disconnect(cb);
    }
    reconnect(cb) {
        ChannelManager_1.channelManager.reconnect(cb);
    }
}
exports.AMQPManager = AMQPManager;
//# sourceMappingURL=AMQPManager.js.map