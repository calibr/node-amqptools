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
        var listener = new tools.events("someapp-that-listen-to-all-events");
        listener.on("#", function (data) {
            data.should.eql({ test: 'test' });
            done();
        }, function () {
            var anotherApp = new tools.events("another-app-that-emit-events");
            anotherApp.emit("some:event:here", { test: 'test' });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUdsQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFbEIsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFFM0MsUUFBUSxDQUFDLFFBQVEsRUFBRTtJQUNqQixVQUFVLENBQUMsVUFBUyxJQUFJO1FBQ3RCLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDZCxJQUFJLEVBQUUsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsMkNBQTJDLEVBQUUsVUFBUyxJQUFJO1FBQzNELElBQUksUUFBUSxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQ3JFLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLFVBQVMsSUFBSTtZQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQyxFQUFFO1lBQ0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFDbEUsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9