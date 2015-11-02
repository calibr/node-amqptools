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