"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const childProcess = require("child_process");
const fs = require("fs");
var spawn = childProcess.spawn;
require("should");
var restartRabbitPath = __dirname + "/../../restart_rabbit.sh";
function restartRabbit(done) {
    var restarter = spawn(restartRabbitPath);
    restarter.stdout.pipe(process.stdout);
    restarter.stderr.pipe(process.stdout);
    restarter.on("close", function () {
        done();
    });
}
index_1.amqpManager.setConnectionURI("amqp://localhost");
if (fs.existsSync(restartRabbitPath)) {
    describe("Connection recovery", function () {
        describe("recover events", () => {
            var events;
            var messages = [];
            function listener(message) {
                messages.push(message);
            }
            before(function (done) {
                this.timeout(20e3);
                index_1.amqpManager.channelManager.randomReconnectionInterval = false;
                index_1.amqpManager.reconnect(function () {
                    events = new index_1.amqpManager.events("some-app");
                    events.on("event:recover", listener);
                    events.emit("event:recover", "test-event");
                    setTimeout(() => {
                        messages.length.should.equal(1);
                        messages[0].should.equal("test-event");
                        messages = [];
                        restartRabbit(() => {
                            setTimeout(done, 1000);
                        });
                    }, 500);
                });
            });
            it("events should go after rebbit restart", (done) => {
                events.emit("event:recover", "after-restart");
                setTimeout(() => {
                    messages.length.should.equal(1);
                    messages[0].should.equal("after-restart");
                    done();
                }, 500);
            });
        });
        describe("recover tasks", () => {
            var tasks;
            var messages = [];
            function processor(message, done) {
                messages.push(message);
                done();
            }
            before(function (done) {
                this.timeout(20e3);
                index_1.amqpManager.reconnect(function () {
                    tasks = index_1.amqpManager.tasks;
                    tasks.processTask("task:recovered_task", processor);
                    var task = tasks.createTask("task:recovered_task", {
                        title: "test-task"
                    });
                    task.start();
                    setTimeout(() => {
                        messages.length.should.equal(1);
                        messages[0].title.should.equal("test-task");
                        messages = [];
                        restartRabbit(() => {
                            setTimeout(done, 1000);
                        });
                    }, 500);
                });
            });
            it("tasks should go after rebbit restart", (done) => {
                var task = tasks.createTask("task:recovered_task", {
                    title: "after-restart"
                });
                task.start();
                setTimeout(() => {
                    messages.length.should.equal(1);
                    messages[0].title.should.equal("after-restart");
                    done();
                }, 500);
            });
        });
    });
}
//# sourceMappingURL=connection_recovery.js.map