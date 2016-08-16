#Amqptools

##Install

`npm install amqptools`

##Usage
###Initialize
```
import amqpTools = require('amqptools');
amqpTools.setConnectionURI(RABBITMQ_URL);
```

###Task start
```
var taskManager = amqpTools.tasks;
var newTask = taskManager.createTask('testTask', {title: "test", data: {value: 1}});
newTask.start(() => {
  should.exists(newTask.uuid);
}
```
###Task process
```
var taskManager = amqpTools.tasks;
taskManager.service = SERVICE_NAME;
taskManager.processTask(TASK_TYPE, function (taskdata, taskDone) {
    // Your task processor
    // invoke taskDone() when task is done
})

```

##Events
```
high level event emitter over amqp

each event should has format:
<exchange>:<topic>
```

##RPC
```
high level RPC over AMQP
action in format:
<exchange>:<topic>

request:
caller -> erpc:<exchange> (topic) -> processor
response:
processor -> replyTo -> caller
```
