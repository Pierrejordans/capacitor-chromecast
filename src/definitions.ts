import { ListenerCallback, PluginListenerHandle } from '@capacitor/core';

export interface ChromecastPlugin {
  initialize(options: any): Promise<void>;

  requestSession(): Promise<void>;

  launchMedia(mediaUrl: string): Promise<boolean>;

  addListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ): Promise<PluginListenerHandle>;

  sendMessage(messageObj: any): Promise<any>;
}
