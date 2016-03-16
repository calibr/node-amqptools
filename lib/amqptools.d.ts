declare module 'amqptools/ChannelManager' {
  import { Channel, Connection } from "amqplib/callback_api";
  import Promise = require('bluebird');
  export class ChannelManager {
      connectionURI: string;
      channel: Channel;
      channelPromise: Promise<Channel>;
      connection: Connection;
      private connectCallbacks;
      private connectInProgress;
      constructor();
      connect(cb: any): any;
      connectRespond(err: any, channel: any): void;
      getChannel(): Promise<Channel>;
      setConnectionURI(uri: any): void;
      disconnect(cb: any): any;
      reconnect(cb?: any): void;
  }
  export var channelManager: ChannelManager;

}
declare module 'amqptools/Event' {
  export interface EventConstructorOptions {
      exchange: string;
      topic: string;
      userId?: string;
  }
  export interface Message {
      exchange: string;
      topic: string;
      userId?: string;
      content: any;
  }
  export class Event {
      exchange: string;
      topic: string;
      userId: string;
      constructor(options: EventConstructorOptions);
      send(object: any): any;
      fullExchangeName: string;
      routeKey: string;
      private assertExchange();
      private assertExchangeForAllEvents();
      private bindToExchangeForAllEvents();
      sendBuffer(buffer: any): any;
      sendString(string: string): any;
      prepareMessage(object: any): string;
  }

}
declare module 'amqptools/EventListener' {
  export interface EventListenerConstructorOptions {
      exchange?: string;
      runtime?: string;
      topic?: string;
      userId?: string;
  }
  export class EventListener {
      exchange: string;
      topic: string;
      queue: string;
      userId: string;
      private queueOptions;
      constructor(options: EventListenerConstructorOptions);
      fullExchangeName: string;
      queueName: string;
      routeKey: string;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      listen(listener: (message) => void): any;
  }

}
declare module 'amqptools/EventEmitter' {
  import * as events from "events";
  export class AMQPEventEmitter {
      runtime: string;
      ee: events.EventEmitter;
      private eventsListeners;
      constructor(runtime: any);
      private preListen(event, cb);
      emit(event: any, ...args: any[]): void;
      addListener(event: string, listener: Function, cb?: Function): void;
      on(event: string, listener: Function, cb?: Function): void;
      once(event: string, listener: Function, cb?: Function): void;
      removeListener(event: string, listener: Function): void;
      removeAllListeners(event?: string): void;
      setMaxListeners(n: number): void;
      listeners(event: string): void;
  }

}
declare module 'amqptools/Task' {
  import { TaskManager } from 'amqptools/TaskManager';
  export interface TaskParams {
      title: string;
      data: any;
  }
  export class Task {
      uuid: string;
      type: string;
      params: TaskParams;
      static taskManager: TaskManager;
      constructor(type: string, params?: TaskParams);
      exchangeName: string;
      queueName: string;
      start(done?: any): this;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      purgeQueue(): any;
      processTask(taskCallback: any): any;
  }

}
declare module 'amqptools/TaskManager' {
  import { Task, TaskParams } from 'amqptools/Task';
  export class TaskManager {
      service: string;
      constructor();
      createTask(type: string, params: TaskParams): Task;
      purgeQueue(taskType: string, cb?: any): any;
      processTask(taskType: any, taskCallback: any, cb?: any): any;
  }

}
declare module 'amqptools/RPCManager' {
  export interface Processors {
  }
  export class RPCManager {
      processors: Processors;
      constructor();
      private createQueue(action, cb?);
      register(action: any, cb: any, registerCb: any): boolean;
      unregister(action: any, cb?: any): any;
      call(action: any, params: any, cb?: any): any;
      static purgeActionQueue(action: any, cb: any): any;
  }

}
declare module 'amqptools/AMQPManager' {
  import { AMQPEventEmitter as eventManager } from 'amqptools/EventEmitter';
  import { TaskManager } from 'amqptools/TaskManager';
  import { Event } from 'amqptools/Event';
  import { EventListener } from 'amqptools/EventListener';
  import { EventListenerConstructorOptions } from 'amqptools/EventListener';
  import { EventConstructorOptions } from 'amqptools/Event';
  import { RPCManager } from 'amqptools/RPCManager';
  export class AMQPManager {
      private taskManager;
      events: typeof eventManager;
      rpc: typeof RPCManager;
      tasks: TaskManager;
      createEvent(options: EventConstructorOptions): Event;
      createEventListener(options: EventListenerConstructorOptions): EventListener;
      setConnectionURI(uri: any): void;
      disconnect(cb: any): void;
      reconnect(cb?: any): void;
  }

}
declare module 'amqptools/index' {
  import { AMQPManager } from 'amqptools/AMQPManager';
  export { AMQPManager } from 'amqptools/AMQPManager';
  export var amqpManager: AMQPManager;

}
declare module 'amqptools' {
  export * from 'amqptools/index';
}
