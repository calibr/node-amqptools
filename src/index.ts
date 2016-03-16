import { AMQPManager } from "./AMQPManager";

require('source-map-support').install();

export { AMQPManager } from "./AMQPManager";
export var amqpManager = new AMQPManager();