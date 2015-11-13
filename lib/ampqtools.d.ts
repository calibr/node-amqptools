declare module 'ampqtools/ChannelManager' {
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
      getChannel(): any;
      setConnectionURI(uri: any): void;
      disconnect(cb: any): any;
      reconnect(cb?: any): void;
  }
  export var channelManager: ChannelManager;

}
declare module 'ampqtools/Event' {
  export interface EventConstructorOptions {
      exchange: string;
      topic: string;
      exchangeOptions: any;
  }
  export class Event {
      exchange: string;
      topic: string;
      exchangeOptions: any;
      constructor(options: EventConstructorOptions);
      send(object: any): any;
      routeKey: string;
      private assertExchange();
      sendBuffer(buffer: any): any;
      sendString(string: string): any;
      prepareMessage(object: any): string;
  }

}
declare module 'ampqtools/EventListener' {
  export interface EventListenerConstructorOptions {
      exchange?: string;
      runtime?: string;
      topic?: string;
      queuePrefix?: string;
      queueOptions?: any;
      exchangeOptions?: any;
  }
  export class EventListener {
      exchange: string;
      topic: string;
      queue: string;
      queuePrefix: string;
      queueOptions: any;
      exchangeOptions: any;
      constructor(options: EventListenerConstructorOptions);
      queueName: string;
      routeKey: string;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      listen(listener: (message) => void): any;
  }

}
declare module 'ampqtools/EventEmitter' {
  import * as events from "events";
  export interface ExchangeOptions {
      durable?: boolean;
      autoDelete?: boolean;
  }
  export interface QueueOptions {
      durable?: boolean;
      autoDelete?: boolean;
      exclusive?: boolean;
  }
  export interface EventEmitterOptions {
      exchange?: string;
      queuePrefix?: string;
      queueOptions?: QueueOptions;
      exchangeOptions?: ExchangeOptions;
  } class AMQPEventEmitter {
      runtime: string;
      options: EventEmitterOptions;
      ee: events.EventEmitter;
      private eventsListeners;
      constructor(runtime: any, options?: EventEmitterOptions);
      private preListen(event, cb);
      emit(event: any, ...args: any[]): void;
      addListener(event: string, listener: Function): void;
      on(event: string, listener: Function): void;
      once(event: string, listener: Function): void;
      removeListener(event: string, listener: Function): void;
      removeAllListeners(event?: string): void;
      setMaxListeners(n: number): void;
      listeners(event: string): void;
  }
  export = AMQPEventEmitter;

}
declare module 'ampqtools/RPCManager' {
  export interface Processors {
  } class RPC {
      processors: Processors;
      constructor();
      private createQueue(action, cb?);
      register(action: any, cb: any, registerCb: any): boolean;
      unregister(action: any, cb?: any): any;
      call(action: any, params: any, cb?: any): any;
      static purgeActionQueue(action: any, cb: any): any;
  }
  export = RPC;

}
declare module 'ampqtools/Task' {
  import { TaskManager } from 'ampqtools/TaskManager';
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
      start(done?: any): Task;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      purgeQueue(): any;
      processTask(taskCallback: any): any;
  }

}
declare module 'ampqtools/TaskManager' {
  import { Task, TaskParams } from 'ampqtools/Task';
  export class TaskManager {
      service: string;
      constructor();
      createTask(type: string, params: TaskParams): Task;
      purgeQueue(taskType: string, cb?: any): any;
      processTask(taskType: any, taskCallback: any, cb?: any): any;
  }

}
declare module 'ampqtools/index' {
  import eventManager = require('ampqtools/EventEmitter');
  import rpcManager = require('ampqtools/RPCManager');
  import { Event } from 'ampqtools/Event';
  import { EventListener } from 'ampqtools/EventListener';
  import { EventListenerConstructorOptions } from 'ampqtools/EventListener';
  import { EventConstructorOptions } from 'ampqtools/Event';
  export class AMQPManager {
      private taskManager;
      events: typeof eventManager;
      rpc: typeof rpcManager;
      tasks: any;
      createEvent(options: EventConstructorOptions): Event;
      createEventListener(options: EventListenerConstructorOptions): EventListener;
      setConnectionURI(uri: any): void;
      disconnect(cb: any): void;
      reconnect(cb?: any): void;
  } var amqpManager: AMQPManager;
  export = amqpManager;

}
