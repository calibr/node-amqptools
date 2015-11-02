/// <reference path="../../typings/tsd.d.ts" />
var tools = require("../index");
var should = require("should");
var tasks = tools.tasks;
var Task = tasks.Task;
tools.setConnectionURI("amqp://localhost");
describe("Tasks", function () {
    before(function (done) {
        tasks.service = "amqpTest";
        tasks.purgeQueue('testTask', done);
    });
    it("should produce task and consume it", function (done) {
        var newTask = new Task('testTask', { title: "test", data: { value: 1 } });
        newTask.start(function () {
            should.exists(newTask.uuid);
            tasks.processTask('testTask', function (task, doneTask) {
                doneTask();
                should.equal(task.uuid, newTask.uuid);
                should.equal(task.title, "test");
                should.equal(task.data.value, 1);
                done();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC90YXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQ0FBK0M7QUFFL0MsSUFBTyxLQUFLLFdBQVcsVUFBVSxDQUFDLENBQUE7QUFDbEMsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFFakMsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUN4QixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBRXRCLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRTNDLFFBQVEsQ0FBQyxPQUFPLEVBQUU7SUFDaEIsTUFBTSxDQUFDLFVBQUMsSUFBSTtRQUNWLEtBQUssQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO1FBQzNCLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLFVBQUMsSUFBSTtRQUM1QyxJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFDLEtBQUssRUFBRSxDQUFDLEVBQUMsRUFBQyxDQUFDLENBQUM7UUFDdEUsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNaLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLEtBQUssQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQUMsSUFBSSxFQUFFLFFBQVE7Z0JBQzNDLFFBQVEsRUFBRSxDQUFDO2dCQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDakMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxFQUFFLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQyJ9