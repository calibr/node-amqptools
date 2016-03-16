"use strict";
var index_1 = require("../index");
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsc0JBQXlDLFVBRXpDLENBQUMsQ0FGa0Q7QUFFbkQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWxCLG1CQUFTLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUUvQyxRQUFRLENBQUMsUUFBUSxFQUFFO0lBQ2pCLFVBQVUsQ0FBQyxVQUFTLElBQUk7UUFDdEIsbUJBQVMsQ0FBQyxTQUFTLENBQUM7WUFDbEIsSUFBSSxFQUFFLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLFVBQVMsSUFBSTtRQUMzRCxJQUFJLFFBQVEsR0FBRyxtQkFBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxPQUFPO1lBQ3RCLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ04sSUFBSSxLQUFLLEdBQUcsbUJBQVMsQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ3ZFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHlEQUF5RCxFQUFFLFVBQVUsSUFBSTtRQUMxRSxJQUFJLFFBQVEsR0FBRyxtQkFBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7UUFDbkUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQU87WUFDdEIsSUFBSSxFQUFFLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDTixJQUFJLEtBQUssR0FBRyxtQkFBUyxDQUFDLFdBQVcsQ0FBQyxFQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztZQUMzRixLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywrREFBK0QsRUFBRSxVQUFVLElBQUk7UUFDaEYsSUFBSSxRQUFRLEdBQUcsbUJBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQ25FLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxPQUFPO1lBQ3RCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLElBQUksS0FBSyxHQUFHLG1CQUFTLENBQUMsV0FBVyxDQUFDLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztZQUN2RSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7UUFFSCxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLFVBQVUsSUFBSTtRQUNuRixJQUFJLFFBQVEsR0FBRyxtQkFBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7UUFDbkUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE9BQU87WUFDdEIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ04sSUFBSSxLQUFLLEdBQUcsbUJBQVMsQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7WUFDOUYsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFDIn0=