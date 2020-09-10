// this test should be run only using sudo!

import { amqpManager as amqpTools } from "../index"
import {EventListener} from "../EventListener"
import * as sinon from "sinon"
import childProcess = require("child_process");
import fs = require("fs");

var spawn = childProcess.spawn;

require("should");

var restartRabbitPath = __dirname + "/../../restart_rabbit.sh";

function restartRabbit(done) {
  var restarter = spawn(restartRabbitPath);
  restarter.stdout.pipe(process.stdout);
  restarter.stderr.pipe(process.stdout);
  restarter.on("close", function() {
    setTimeout(() => {
      done()
    }, 2000)
  });
}

amqpTools.setConnectionURI("amqp://localhost?heartbeat=2");
amqpTools.channelManager.randomReconnectionInterval = false

if(fs.existsSync(restartRabbitPath)) {
  describe("Connection recovery", function() {
    describe("recover events", () => {
      var events;
      var messages = [];
      function listener(message) {
        messages.push(message);
      }
      before(function(done) {
        this.timeout(40e3);
        amqpTools.channelManager.randomReconnectionInterval = false;
        amqpTools.reconnect(function() {
          events = new amqpTools.events("some-app");
          events.on("event:recover", listener);
          // make sure that listener accepts messages
          events.emit("event:recover", "test-event");
          setTimeout(() => {
            messages.length.should.equal(1);
            messages[0].should.equal("test-event");
            messages = [];
            restartRabbit(done);
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
      before(function(done) {
        this.timeout(20e3);
        amqpTools.reconnect(function() {
          tasks = amqpTools.tasks;
          console.log('Attaching task listener...')
          tasks.processTask("task:recovered_task", processor, () => {
            console.log('Attached task listener!')
            // make sure that processor accepts messages
            var task = tasks.createTask("task:recovered_task", {
              title: "test-task"
            });
            task.start(() => {
              setTimeout(() => {
                messages.length.should.equal(1);
                messages[0].title.should.equal("test-task");
                messages = [];
                restartRabbit(done);
              }, 1000);
            });
          });
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