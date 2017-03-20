declare module 'amqptools/ChannelManager' {
  import { Channel, Connection } from "amqplib/callback_api";
  import Promise = require('bluebird');
  import { EventEmitter } from "events";
  export class ChannelManager extends EventEmitter {
      connectionURI: string;
      channel: Channel;
      channelPromise: Promise<Channel>;
      connection: Connection;
      maxReconnectionAttempts: number;
      randomReconnectionInterval: boolean;
      private connectCallbacks;
      private connectInProgress;
      constructor();
      onConnectionClose: (error: any) => void;
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
      readonly fullExchangeName: string;
      readonly routeKey: string;
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
      persistent?: boolean;
      autoAck?: boolean;
  }
  export interface MessageExtra {
      ack?: () => void;
  }
  export interface ListenerFunc {
      (message: any, extra: MessageExtra): void;
  }
  export class EventListener {
      exchange: string;
      topic: string;
      queue: string;
      userId: string;
      persistent: boolean;
      autoAck: boolean;
      private listener;
      private queueOptions;
      constructor(options: EventListenerConstructorOptions);
      onReconnect: () => void;
      readonly fullExchangeName: string;
      queueName: string;
      readonly routeKey: string;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      private ack(msg);
      private onMessageReceived;
      private consume();
      listen(listener: (message, extra?) => void): any;
  }

}
declare module 'amqptools/EventEmitter' {
  import * as events from "events";
  import { EventListener } from 'amqptools/EventListener';
  export interface EventsListeners {
      [index: string]: EventListener;
  }
  export interface EventOptions {
      event: string;
      persistent?: boolean;
      autoAck?: boolean;
  }
  export class AMQPEventEmitter {
      runtime: string;
      ee: events.EventEmitter;
      private eventsListeners;
      constructor(runtime: any);
      private preListen(options, cb);
      emit(event: any, data: any): void;
      addListener(event: string | EventOptions, listener: Function, cb?: Function): void;
      on(event: string | EventOptions, listener: Function, cb?: Function): void;
      once(event: string | EventOptions, listener: Function, cb?: Function): void;
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
      taskCallback: any;
      opts: any;
      static taskManager: TaskManager;
      constructor(type: string, params?: TaskParams);
      onReconnect: () => void;
      readonly exchangeName: string;
      readonly queueName: string;
      start(done?: any): this;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      purgeQueue(): any;
      consume(): any;
      processTask(opts: any, taskCallback: any): any;
  }

}
declare module 'amqptools/TaskManager' {
  import { Task, TaskParams } from 'amqptools/Task';
  export class TaskManager {
      service: string;
      constructor();
      createTask(type: string, params: TaskParams): Task;
      purgeQueue(taskType: string, cb?: any): any;
      processTask(taskType: any, taskCallback: any, opts?: any, cb?: any): any;
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
  import { ChannelManager } from 'amqptools/ChannelManager';
  import { TaskManager } from 'amqptools/TaskManager';
  import { Event } from 'amqptools/Event';
  import { EventListener } from 'amqptools/EventListener';
  import { EventListenerConstructorOptions } from 'amqptools/EventListener';
  import { EventConstructorOptions } from 'amqptools/Event';
  import { RPCManager } from 'amqptools/RPCManager';
  export class AMQPManager {
      private taskManager;
      readonly events: typeof eventManager;
      readonly rpc: typeof RPCManager;
      readonly channelManager: ChannelManager;
      readonly tasks: TaskManager;
      createEvent(options: EventConstructorOptions): Event;
      createEventListener(options: EventListenerConstructorOptions): EventListener;
      setConnectionURI(uri: any): void;
      disconnect(cb: any): void;
      reconnect(cb?: any): void;
  }

}
declare module 'amqptools/index' {
  /// <reference path="../typings/index.d.ts" />
  import { AMQPManager } from 'amqptools/AMQPManager';
  export { AMQPManager } from 'amqptools/AMQPManager';
  export var amqpManager: AMQPManager;

}
declare module 'amqptools' {
  import main = require('amqptools/index');
  export = main;
}
