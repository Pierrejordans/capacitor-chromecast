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

  public async launchMedia(options: { mediaUrl: string }): Promise<{ value: boolean }> {
    let mediaInfo = new this.cast.media.MediaInfo(options.mediaUrl);
    let request = new this.cast.media.LoadRequest(mediaInfo);
    console.log('launch media with session', this.session);

    if (!this.session) {
      window.open(options.mediaUrl);
      return { value: false };
    }
    // this.session.loadMedia(request, this.onMediaDiscovered.bind(this, 'loadMedia'), this.onMediaError);
    this.session.loadMedia(request);
    return { value: true };
  }

  public async loadMedia(options: any): Promise<any> {
    console.log('loadMedia called with options:', options);
    
    if (!this.session) {
      this.session = this.instance.getCurrentSession();
    }
    
    if (!this.session) {
      throw new Error('Aucune session Chromecast active');
    }

    // Créer MediaInfo avec les options étendues
    let mediaInfo = new this.cast.media.MediaInfo(options.contentId, options.contentType);
    
    // Ajouter les métadonnées si disponibles
    if (options.metadata) {
      mediaInfo.metadata = options.metadata;
    }
    
    // Ajouter les données personnalisées incluant les en-têtes d'authentification
    if (options.customData || options.authHeaders || options.authToken) {
      mediaInfo.customData = options.customData || {};
      
      if (options.authHeaders) {
        mediaInfo.customData.authHeaders = options.authHeaders;
      }
      
      if (options.authToken) {
        mediaInfo.customData.authToken = options.authToken;
      }
    }
    
    // Configurer la durée du stream
    if (options.duration) {
      mediaInfo.streamDuration = options.duration;
    }
    
    // Configurer le type de stream
    if (options.streamType) {
      switch (options.streamType) {
        case 'LIVE':
          mediaInfo.streamType = this.cast.media.StreamType.LIVE;
          break;
        case 'BUFFERED':
          mediaInfo.streamType = this.cast.media.StreamType.BUFFERED;
          break;
        default:
          mediaInfo.streamType = this.cast.media.StreamType.NONE;
      }
    }

    // Créer la requête de chargement
    let request = new this.cast.media.LoadRequest(mediaInfo);
    
    // Configurer les options de lecture
    if (options.autoPlay !== undefined) {
      request.autoplay = options.autoPlay;
    }
    
    if (options.currentTime !== undefined) {
      request.currentTime = options.currentTime;
    }

    console.log('Chargement du média avec MediaInfo:', mediaInfo);
    console.log('Request:', request);
    
    // Charger le média
    return new Promise((resolve, reject) => {
      this.session.loadMedia(request)
        .then((result: any) => {
          console.log('Média chargé avec succès:', result);
          resolve(result);
        })
        .catch((error: any) => {
          console.error('Erreur lors du chargement du média:', error);
          reject(error);
        });
    });
  }

  public async loadMediaWithHeaders(options: any): Promise<any> {
    console.log('loadMediaWithHeaders called with options:', options);
    
    // Cette méthode utilise la même logique que loadMedia mais avec un logging spécifique
    console.log('Chargement du média avec en-têtes d\'authentification');
    
    if (options.authHeaders) {
      console.log('En-têtes d\'authentification détectés:', options.authHeaders);
    }
    
    if (options.authToken) {
      console.log('Token d\'authentification détecté');
    }
    
    // Utiliser la méthode loadMedia existante
    return this.loadMedia(options);
  }

  public async loadSecureHLS(options: any): Promise<any> {
    console.log('loadSecureHLS called with options:', options);
    
    // Avertissement pour la plateforme web
    console.warn('loadSecureHLS: La gestion des flux HLS sécurisés est optimisée pour les appareils mobiles.');
    console.warn('Sur le web, utilisez loadMedia ou loadMediaWithHeaders à la place.');
    
    // Extraire le token de l'URL si nécessaire
    let authToken = options.authToken;
    if (!authToken && options.contentId && options.contentId.includes('token=')) {
      const urlParams = new URLSearchParams(options.contentId.split('?')[1]);
      authToken = urlParams.get('token');
      console.log('Token extrait de l\'URL:', authToken ? 'PRÉSENT' : 'ABSENT');
    }
    
    // Préparer les options pour loadMedia
    const loadOptions = {
      contentId: options.contentId,
      contentType: options.contentType || 'application/x-mpegURL',
      streamType: options.streamType || 'LIVE',
      autoPlay: options.autoPlay !== false,
      metadata: options.metadata || {},
      customData: {
        ...options.customData,
        authToken: authToken,
        secureHLS: true,
        authType: 'url_token'
      }
    };
    
    console.log('Redirection vers loadMedia avec options sécurisées');
    return this.loadMedia(loadOptions);
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
