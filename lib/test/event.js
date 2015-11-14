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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUdsQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFbEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFM0MsUUFBUSxDQUFDLFFBQVEsRUFBRTtJQUNqQixVQUFVLENBQUMsVUFBUyxJQUFJO1FBQ3RCLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDZCxJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsMkNBQTJDLEVBQUUsVUFBUyxJQUFJO1FBQzNELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQUMsT0FBTztZQUN0QixJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNOLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ25FLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==