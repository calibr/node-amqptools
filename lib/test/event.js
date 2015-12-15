var tools = require("../index");
require("should");
tools.setConnectionURI("amqp://localhost");
describe("Events", function () {
    beforeEach(function (done) {
        tools.reconnect(function () {
            done();
        });
    });
    it("listener to all events should catch event", function (done) {
        var listener = tools.createEventListener({});
        listener.listen(function (message) {
            done();
        }).then(function () {
            var event = tools.createEvent({ exchange: 'note', topic: 'update' });
            event.send({ test: 'test' });
        });
    });
    it("listener to userId event should catch event with userId", function (done) {
        var listener = tools.createEventListener({ userId: 'testUser' });
        listener.listen(function (message) {
            done();
        }).then(function () {
            var event = tools.createEvent({ exchange: 'note', topic: 'update', userId: 'testUser' });
            event.send({ test: 'test' });
        });
    });
    it("listener to userId event shouldn't catch event without userId", function (done) {
        var listener = tools.createEventListener({ userId: 'testUser' });
        listener.listen(function (message) {
            done('Error wrong listener');
        }).then(function () {
            var event = tools.createEvent({ exchange: 'note', topic: 'update' });
            event.send({ test: 'test' });
        });
        setTimeout(done, 500);
    });
    it("listener to userId event shouldn't catch event with other userId", function (done) {
        var listener = tools.createEventListener({ userId: 'testUser' });
        listener.listen(function (message) {
            done('Error wrong listener');
        }).then(function () {
            var event = tools.createEvent({ exchange: 'note', topic: 'update', userId: 'anotherUser' });
            event.send({ test: 'test' });
        });
        setTimeout(done, 500);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUdsQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFbEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFM0MsUUFBUSxDQUFDLFFBQVEsRUFBRTtJQUNqQixVQUFVLENBQUMsVUFBUyxJQUFJO1FBQ3RCLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDZCxJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsMkNBQTJDLEVBQUUsVUFBUyxJQUFJO1FBQzNELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUMsT0FBTztZQUN0QixJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ25FLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLHlEQUF5RCxFQUFFLFVBQVUsSUFBSTtRQUMxRSxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsbUJBQW1CLENBQUMsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLENBQUMsQ0FBQztRQUMvRCxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUMsT0FBTztZQUN0QixJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7WUFDdkYsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsK0RBQStELEVBQUUsVUFBVSxJQUFJO1FBQ2hGLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxPQUFPO1lBQ3RCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ25FLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsa0VBQWtFLEVBQUUsVUFBVSxJQUFJO1FBQ25GLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQy9ELFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxPQUFPO1lBQ3RCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQy9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBQyxDQUFDLENBQUM7WUFDMUYsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO1FBRUgsVUFBVSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFDIn0=