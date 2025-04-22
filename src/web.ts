import { WebPlugin } from '@capacitor/core';

import type { ChromecastPlugin } from './definitions';

declare global {
  interface Window {
    __onGCastApiAvailable: any;
    chrome: any;
  }
  let cast: any;
}

export class ChromecastWeb extends WebPlugin implements ChromecastPlugin {
  private cast: any;
  private session: any;
  private instance: any;

  constructor() {
    super();
  }

  // private onInitSuccess() {
  //   console.log('GCast initialization success');
  // }

  // private onError(err: any) {
  //   console.error('GCast initialization failed', err);
  // }

  public async initialize(options?: any) {
    const script = window['document'].createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute(
      'src',
      'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1',
    );
    window['document'].body.appendChild(script);

    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      console.log('cast is available:', isAvailable);

      if (isAvailable) {
        this.cast = window['chrome'].cast;
        cast.framework.CastContext.getInstance().setOptions({
          receiverApplicationId: (options === null || options === void 0 ? void 0 : options.appId) || this.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
          autoJoinPolicy: this.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });
        this.instance = cast.framework.CastContext.getInstance();
        this.addCastEventListeners();
        // const sessionRequest = new this.cast.SessionRequest(
        //   options?.appId || this.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        // );

        // const apiConfig = new this.cast.ApiConfig(
        //   sessionRequest,
        //   () => { },
        //   (status: any) => {
        //     if (status === this.cast.ReceiverAvailability.AVAILABLE) {
        //     }
        //   },
        // );
        // this.cast.initialize(apiConfig, this.onInitSuccess, this.onError);
      }
    };
  }

  public async requestSession(): Promise<void> {
    console.log('request session called');
    return this.instance.requestSession();
  }

  public async launchMedia(media: string) {
    let mediaInfo = new this.cast.media.MediaInfo(media);
    let request = new this.cast.media.LoadRequest(mediaInfo);
    console.log('launch media with session', this.session);

    if (!this.session) {
      window.open(media);
      return false;
    }
    // this.session.loadMedia(request, this.onMediaDiscovered.bind(this, 'loadMedia'), this.onMediaError);
    this.session.loadMedia(request);
    return true;
  }
  async sendMessage(messageObj: any) {
    console.log('Send message via session', this.session);
    if (!this.session || this.session != this.instance.getCurrentSession()) this.session = this.instance.getCurrentSession();
    if (!this.session) {
      return { success: false, error: 'Session not established' };
    }

    this.session.sendMessage(messageObj.namespace, messageObj.message);
    if (messageObj.callback && typeof messageObj.callback === 'function') {
      messageObj.callback();
    }
    return { success: true, error: null };
  }
  async addCastEventListeners() {
    console.log('Add listener via instance', this.instance);
    if (!this.instance) this.instance = cast.framework.CastContext.getInstance();
    if (!this.instance) {
      return { success: false, error: 'CastContext does not exist' };
    }
    const that = this;
    this.instance.addEventListener(
      cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      function (event: any) {
        const result: any = {};
        const connected: boolean = that?.instance?.getCurrentSession()?.i?.status === cast.framework.CastState.CONNECTED.toLowerCase();
        switch (event.sessionState) {
          case cast.framework.SessionState.SESSION_STARTED:
            result["isConnected"] = connected;
            result["sessionId"] = event.session.getSessionId();
            that.notifyListeners(cast.framework.SessionState.SESSION_STARTED, result);
            event?.session?.addMessageListener('urn:x-cast:com.example.cast.mynamespace', (namespace: any, data: any) => {
              that.notifyListeners('RECEIVER_MESSAGE', { key: { namespace: namespace, message: data } });
            });
            break;
          case cast.framework.SessionState.SESSION_RESUMED:
            result["isConnected"] = connected;
            result["wasSuspended"] = false;
            that.notifyListeners(cast.framework.SessionState.SESSION_RESUMED, result);
            break;
          case cast.framework.SessionState.SESSION_ENDED:
            result["isConnected"] = connected;
            result["error"] = event.errorCode;
            that.notifyListeners(cast.framework.SessionState.SESSION_ENDED, result);
            console.log('CastContext: CastSession disconnected');
            // Update locally as necessary
            break;
        }
      });
    return {};
  }
}
