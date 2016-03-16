"use strict";
var index_1 = require("../index");
var should = require("should");
var taskManager = index_1.amqpManager.tasks;
index_1.amqpManager.setConnectionURI("amqp://localhost");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGVzdC90YXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsc0JBQXlDLFVBQ3pDLENBQUMsQ0FEa0Q7QUFDbkQsSUFBTyxNQUFNLFdBQVcsUUFBUSxDQUFDLENBQUE7QUFFakMsSUFBSSxXQUFXLEdBQUcsbUJBQVMsQ0FBQyxLQUFLLENBQUM7QUFFbEMsbUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBRS9DLFFBQVEsQ0FBQyxPQUFPLEVBQUU7SUFDaEIsTUFBTSxDQUFDLFVBQUMsSUFBSTtRQUNWLFdBQVcsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO1FBQ2pDLFdBQVcsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLFVBQUMsSUFBSTtRQUM1QyxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUMsS0FBSyxFQUFFLENBQUMsRUFBQyxFQUFDLENBQUMsQ0FBQztRQUNwRixPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ1osTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsV0FBVyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsVUFBQyxJQUFJLEVBQUUsUUFBUTtnQkFDakQsUUFBUSxFQUFFLENBQUM7Z0JBQ1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNqQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLEVBQUUsQ0FBQztZQUNULENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFDIn0=