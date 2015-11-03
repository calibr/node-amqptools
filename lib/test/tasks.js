/// <reference path="../../typings/tsd.d.ts" />
var tools = require("../index");
var should = require("should");
var taskManager = tools.tasks;
tools.setConnectionURI("amqp://localhost");
describe("Tasks", function () {
    before(function (done) {
        taskManager.service = "amqpTest";
        taskManager.purgeQueue('testTask', done);
    });
    it("should produce task and consume it", function (done) {
        var newTask = taskManager.createTask('testTask', { title: "test", data: { value: 1 } });
        newTask.start(function () {
            should.exists(newTask.uuid);
            taskManager.processTask('testTask', function (task, doneTask) {
                doneTask();
                should.equal(task.uuid, newTask.uuid);
                should.equal(task.title, "test");
                should.equal(task.data.value, 1);
                done();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC90YXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQ0FBK0M7QUFFL0MsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUE7QUFDbEMsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFFakMsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUU5QixLQUFLLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUUzQyxRQUFRLENBQUMsT0FBTyxFQUFFO0lBQ2hCLE1BQU0sQ0FBQyxVQUFDLElBQUk7UUFDVixXQUFXLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQztRQUNqQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLElBQUk7UUFDNUMsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUM7UUFDcEYsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNaLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQUMsSUFBSSxFQUFFLFFBQVE7Z0JBQ2pELFFBQVEsRUFBRSxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQyJ9