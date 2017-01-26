"use strict";
var index_1 = require("../index");
var EventListener_1 = require("../EventListener");
var sinon = require("sinon");
var Promise = require("Bluebird");
require("should");
index_1.amqpManager.setConnectionURI("amqp://localhost");
describe("Events", function () {
    beforeEach(function (done) {
        index_1.amqpManager.reconnect(function () {
            done();
        });
    });
    it("listener to all events should catch event", function (done) {
        var listener = index_1.amqpManager.createEventListener({});
        listener.listen(function (message) {
            done();
        }).then(function () {
            var event = index_1.amqpManager.createEvent({ exchange: 'note', topic: 'update' });
            event.send({ test: 'test' });
        });
    });
    it("listener to userId event should catch event with userId", function (done) {
        var listener = index_1.amqpManager.createEventListener({ userId: 'testUser' });
        listener.listen(function (message) {
            done();
        }).then(function () {
            var event = index_1.amqpManager.createEvent({ exchange: 'note', topic: 'update', userId: 'testUser' });
            event.send({ test: 'test' });
        });
    });
    it("listener to userId event shouldn't catch event without userId", function (done) {
        var listener = index_1.amqpManager.createEventListener({ userId: 'testUser' });
        listener.listen(function (message) {
            done('Error wrong listener');
        }).then(function () {
            var event = index_1.amqpManager.createEvent({ exchange: 'note', topic: 'update' });
            event.send({ test: 'test' });
        });
        setTimeout(done, 500);
    });
    it("listener to userId event shouldn't catch event with other userId", function (done) {
        var listener = index_1.amqpManager.createEventListener({ userId: 'testUser' });
        listener.listen(function (message) {
            done('Error wrong listener');
        }).then(function () {
            var event = index_1.amqpManager.createEvent({ exchange: 'note', topic: 'update', userId: 'anotherUser' });
            event.send({ test: 'test' });
        });
        setTimeout(done, 500);
    });
    describe("Listen persistently", function () {
        var eventListenerListenStub;
        var eventListener;
        before(function () {
            eventListenerListenStub = sinon.stub(EventListener_1.EventListener.prototype, "listen", function () {
                eventListener = this;
                return Promise.resolve();
            });
        });
        after(function () {
            eventListenerListenStub.restore();
        });
        it("should set a persistent listener", function (done) {
            var events = new index_1.amqpManager.events("app-client");
            return events.on({
                event: "event-name",
                persistent: true
            }, function () {
            }, function () {
                eventListenerListenStub.calledOnce.should.equal(true);
                eventListener.persistent.should.equal(true);
                eventListener.queueOptions.durable.should.equal(true);
                eventListener.queueOptions.autoDelete.should.equal(false);
                done();
            });
        });
        it("by default listener should be not persistent", function (done) {
            eventListenerListenStub.reset();
            eventListener = null;
            var events = new index_1.amqpManager.events("app-client");
            return events.on("event-name", function () {
            }, function () {
                eventListenerListenStub.calledOnce.should.equal(true);
                eventListener.persistent.should.equal(false);
                done();
            });
        });
    });
    describe("Manually acked events", function () {
        var eventListenerListenStub;
        var eventListener;
        var events;
        var listenerFunc = sinon.spy(function () { });
        var channel = {
            ack: sinon.spy(function () { })
        };
        var amqpMessage = {
            content: JSON.stringify("hello world")
        };
        before(function () {
            events = new index_1.amqpManager.events("app-client");
            eventListenerListenStub = sinon.stub(EventListener_1.EventListener.prototype, "listen", function () {
                eventListener = this;
                eventListener.listener = listenerFunc;
                eventListener.channel = channel;
                return Promise.resolve();
            });
        });
        after(function () {
            eventListenerListenStub.restore();
        });
        it("should set a manually-acked listener", function (done) {
            return events.on({
                event: "event-name",
                autoAck: false
            }, listenerFunc, function () {
                eventListenerListenStub.calledOnce.should.equal(true);
                eventListener.autoAck.should.equal(false);
                done();
            });
        });
        it("should trigger listener with an ack function", function () {
            eventListener.onMessageReceived(amqpMessage);
            listenerFunc.calledOnce.should.equal(true);
            channel.ack.called.should.equal(false);
            listenerFunc.args[0][0].should.equal("hello world");
            var extra = listenerFunc.args[0][1];
            extra.ack();
            channel.ack.calledOnce.should.equal(true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsc0JBQXlDLFVBQ3pDLENBQUMsQ0FEa0Q7QUFDbkQsOEJBQTRCLGtCQUM1QixDQUFDLENBRDZDO0FBQzlDLElBQVksS0FBSyxXQUFNLE9BQ3ZCLENBQUMsQ0FENkI7QUFDOUIsSUFBWSxPQUFPLFdBQU0sVUFBVSxDQUFDLENBQUE7QUFFcEMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWxCLG1CQUFTLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUUvQyxRQUFRLENBQUMsUUFBUSxFQUFFO0lBQ2pCLFVBQVUsQ0FBQyxVQUFTLElBQUk7UUFDdEIsbUJBQVMsQ0FBQyxTQUFTLENBQUM7WUFDbEIsSUFBSSxFQUFFLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLFVBQVMsSUFBSTtRQUMzRCxJQUFJLFFBQVEsR0FBRyxtQkFBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxPQUFPO1lBQ3RCLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ04sSUFBSSxLQUFLLEdBQUcsbUJBQVMsQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3ZFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHlEQUF5RCxFQUFFLFVBQVUsSUFBSTtRQUMxRSxJQUFJLFFBQVEsR0FBRyxt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