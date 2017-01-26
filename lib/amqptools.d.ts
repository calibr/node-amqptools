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
      private channel;
      constructor(options: EventListenerConstructorOptions);
      fullExchangeName: string;
      queueName: string;
      routeKey: string;
      private assertExchange();
      private assertQueue();
      private bindQueue();
      private onMessageReceived;
      listen(listener: (message, extra?) => void): any;
  }

}
declare module 'amqptools' {
  }
