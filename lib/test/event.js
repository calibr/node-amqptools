var tools = require("../index");
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
            console.log(message);
            done();
        }).then(function () {
            var event = tools.createEvent({ exchange: 'note', topic: 'update' });
            event.send({ test: 'test' });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC9ldmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEtBQUssV0FBVyxVQUFVLENBQUMsQ0FBQTtBQUlsQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUUzQyxRQUFRLENBQUMsUUFBUSxFQUFFO0lBQ2pCLFVBQVUsQ0FBQyxVQUFTLElBQUk7UUFDdEIsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNkLElBQUksRUFBRSxDQUFDO1FBQ1QsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxVQUFTLElBQUk7UUFDM0QsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBQyxPQUFPO1lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDckIsSUFBSSxFQUFFLENBQUM7UUFDVCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDTixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztZQUNuRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMsQ0FBQyxDQUFDIn0=