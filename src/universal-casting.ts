import { PluginListenerHandle } from '@capacitor/core';
import { ChromecastSecureHLSOptions, ChromecastLoadMediaOptions } from './definitions';

/**
 * Énumération des types d'appareils de casting supportés
 */
export enum CastDeviceType {
  CHROMECAST = 'chromecast',
  ANDROID_TV = 'android-tv',
  AIRPLAY = 'airplay',
  DLNA = 'dlna',
  SMART_TV = 'smart-tv',
  UNKNOWN = 'unknown'
}

/**
 * Interface pour les informations d'appareil détecté
 */
export interface DetectedCastDevice {
  id: string;
  name: string;
  type: CastDeviceType;
  capabilities: string[];
  isAvailable: boolean;
  networkInfo?: {
    ipAddress: string;
    port: number;
  };
}

/**
 * Options universelles pour le streaming sécurisé
 */
export interface UniversalStreamOptions {
  contentId: string;
  authToken?: string;
  metadata?: {
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    duration?: number;
  };
  customData?: any;
  headers?: Record<string, string>;
  preferredDeviceType?: CastDeviceType;
  fallbackStrategy?: 'web' | 'native' | 'intent';
}

/**
 * Résultat d'une opération de casting universel
 */
export interface UniversalCastResult {
  success: boolean;
  deviceType: CastDeviceType;
  deviceId: string;
  method: 'chromecast' | 'android-tv' | 'intent' | 'web' | 'native';
  message?: string;
}

/**
 * Événements du casting universel
 */
export interface UniversalCastEvents {
  deviceDiscovered: (device: DetectedCastDevice) => void;
  deviceLost: (deviceId: string) => void;
  connectionStateChanged: (state: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
  mediaStateChanged: (state: 'playing' | 'paused' | 'buffering' | 'idle' | 'error') => void;
  mediaProgress: (progress: { currentTime: number; duration: number; position: number }) => void;
}

/**
 * Classe principale pour le casting universel
 */
export class UniversalCasting {
  private static instance: UniversalCasting;
  private discoveredDevices: Map<string, DetectedCastDevice> = new Map();
  private currentConnection: DetectedCastDevice | null = null;
  private eventListeners: Map<string, { callback: Function; handle: PluginListenerHandle }[]> = new Map();

  private constructor() {}

  /**
   * Obtenir l'instance singleton
   */
  public static getInstance(): UniversalCasting {
    if (!UniversalCasting.instance) {
      UniversalCasting.instance = new UniversalCasting();
    }
    return UniversalCasting.instance;
  }

  /**
   * Détecter automatiquement les appareils de casting disponibles
   */
  public async discoverDevices(): Promise<DetectedCastDevice[]> {
    console.log('🔍 Découverte d\'appareils de casting...');
    
    const devices: DetectedCastDevice[] = [];

    try {
      // 1. Détecter les Chromecast via Google Cast SDK
      const chromecastDevices = await this.discoverChromecastDevices();
      devices.push(...chromecastDevices);

      // 2. Détecter les Android TV via réseau local
      const androidTVDevices = await this.discoverAndroidTVDevices();
      devices.push(...androidTVDevices);

      // 3. Détecter les appareils AirPlay (iOS)
      if (this.isIOS()) {
        const airplayDevices = await this.discoverAirPlayDevices();
        devices.push(...airplayDevices);
      }

      // 4. Détecter les appareils DLNA
      const dlnaDevices = await this.discoverDLNADevices();
      devices.push(...dlnaDevices);

      // Mettre à jour la liste des appareils découverts
      devices.forEach(device => {
        this.discoveredDevices.set(device.id, device);
        this.notifyDeviceDiscovered(device);
      });

      console.log(`✅ ${devices.length} appareil(s) de casting découvert(s)`);
      return devices;

    } catch (error) {
      console.error('❌ Erreur lors de la découverte d\'appareils:', error);
      return devices;
    }
  }

  /**
   * Caster un stream de manière universelle
   */
  public async castStream(options: UniversalStreamOptions): Promise<UniversalCastResult> {
    console.log('🎬 Début du casting universel...');
    console.log('📋 Options:', options);

    // 1. Détecter l'appareil cible
    const targetDevice = await this.selectTargetDevice(options.preferredDeviceType);
    
    if (!targetDevice) {
      return {
        success: false,
        deviceType: CastDeviceType.UNKNOWN,
        deviceId: '',
        method: 'web',
        message: 'Aucun appareil de casting trouvé'
      };
    }

    console.log(`🎯 Appareil cible: ${targetDevice.name} (${targetDevice.type})`);

    // 2. Router vers la méthode appropriée selon le type d'appareil
    try {
      switch (targetDevice.type) {
        case CastDeviceType.CHROMECAST:
          return await this.castToChromecast(options, targetDevice);
        
        case CastDeviceType.ANDROID_TV:
          return await this.castToAndroidTV(options, targetDevice);
        
        case CastDeviceType.AIRPLAY:
          return await this.castToAirPlay(options, targetDevice);
        
        case CastDeviceType.DLNA:
          return await this.castToDLNA(options, targetDevice);
        
        default:
          return await this.castFallback(options);
      }
    } catch (error) {
      console.error(`❌ Erreur casting vers ${targetDevice.type}:`, error);
      
      // Stratégie de fallback
      if (options.fallbackStrategy) {
        return await this.handleFallback(options, error as Error);
      }
      
      return {
        success: false,
        deviceType: targetDevice.type,
        deviceId: targetDevice.id,
        method: 'web',
        message: `Erreur: ${(error as Error).message}`
      };
    }
  }

  /**
   * Casting vers Chromecast
   */
  private async castToChromecast(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<UniversalCastResult> {
    console.log('📡 Casting vers Chromecast...');
    
    try {
      // Importer le plugin Chromecast existant
      const { Chromecast } = await import('./index');
      
      // Si un token est fourni, utiliser la méthode sécurisée
      if (options.authToken) {
        await Chromecast.loadSecureHLS({
          contentId: options.contentId,
          authToken: options.authToken,
          customAppId: undefined, // Utiliser le récepteur par défaut
          metadata: options.metadata
        });
      } else {
        // Utiliser la méthode standard
        await Chromecast.loadMedia({
          contentId: options.contentId,
          contentType: this.getContentType(options.contentId),
          streamType: this.getStreamType(options.contentId) as "LIVE" | "BUFFERED" | "NONE",
          metadata: options.metadata,
          customData: options.customData
        });
      }
      
      return {
        success: true,
        deviceType: CastDeviceType.CHROMECAST,
        deviceId: device.id,
        method: 'chromecast',
        message: 'Stream casté vers Chromecast avec succès'
      };
      
    } catch (error) {
      throw new Error(`Échec casting Chromecast: ${(error as Error).message}`);
    }
  }

  /**
   * Casting vers Android TV
   */
  private async castToAndroidTV(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<UniversalCastResult> {
    console.log('📺 Casting vers Android TV...');
    
    try {
      // Méthode 1: Intent direct vers l'application universelle
      if (await this.hasUniversalReceiverApp()) {
        await this.launchUniversalReceiverIntent(options, device);
        
        return {
          success: true,
          deviceType: CastDeviceType.ANDROID_TV,
          deviceId: device.id,
          method: 'android-tv',
          message: 'Stream lancé sur Android TV'
        };
      }
      
      // Méthode 2: Intent vers applications tierces (VLC, Kodi, etc.)
      const result = await this.launchThirdPartyIntent(options);
      if (result.success) {
        return {
          success: true,
          deviceType: CastDeviceType.ANDROID_TV,
          deviceId: device.id,
          method: 'intent',
          message: 'Stream lancé via application tierce'
        };
      }
      
      throw new Error('Aucune méthode de casting Android TV disponible');
      
    } catch (error) {
      throw new Error(`Échec casting Android TV: ${(error as Error).message}`);
    }
  }

  /**
   * Casting vers AirPlay (iOS)
   */
  private async castToAirPlay(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<UniversalCastResult> {
    console.log('📱 Casting vers AirPlay...');
    
    try {
      // Utiliser l'API AirPlay native d'iOS
      if (this.isIOS() && (window as any).webkit) {
        // Implémenter l'interface AirPlay native
        await this.nativeAirPlayCast(options, device);
        
        return {
          success: true,
          deviceType: CastDeviceType.AIRPLAY,
          deviceId: device.id,
          method: 'native',
          message: 'Stream casté vers AirPlay'
        };
      }
      
      throw new Error('AirPlay non disponible sur cette plateforme');
      
    } catch (error) {
      throw new Error(`Échec casting AirPlay: ${(error as Error).message}`);
    }
  }

  /**
   * Casting vers DLNA
   */
  private async castToDLNA(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<UniversalCastResult> {
    console.log('🌐 Casting vers DLNA...');
    
    try {
      // Utiliser l'API UPnP/DLNA
      await this.dlnaCast(options, device);
      
      return {
        success: true,
        deviceType: CastDeviceType.DLNA,
        deviceId: device.id,
        method: 'native',
        message: 'Stream casté vers appareil DLNA'
      };
      
    } catch (error) {
      throw new Error(`Échec casting DLNA: ${(error as Error).message}`);
    }
  }

  /**
   * Stratégie de fallback
   */
  private async castFallback(options: UniversalStreamOptions): Promise<UniversalCastResult> {
    console.log('🔄 Utilisation de la stratégie de fallback...');
    
    // 1. Essayer d'ouvrir dans le navigateur web avec player intégré
    if (options.fallbackStrategy === 'web') {
      await this.openWebPlayer(options);
      
      return {
        success: true,
        deviceType: CastDeviceType.UNKNOWN,
        deviceId: 'web-fallback',
        method: 'web',
        message: 'Stream ouvert dans le navigateur web'
      };
    }
    
    // 2. Essayer les intents Android génériques
    if (options.fallbackStrategy === 'intent' && this.isAndroid()) {
      const intentResult = await this.launchGenericIntent(options);
      
      return {
        success: intentResult.success,
        deviceType: CastDeviceType.UNKNOWN,
        deviceId: 'intent-fallback',
        method: 'intent',
        message: intentResult.message
      };
    }
    
    // 3. Player natif de l'application
    if (options.fallbackStrategy === 'native') {
      await this.playInNativePlayer(options);
      
      return {
        success: true,
        deviceType: CastDeviceType.UNKNOWN,
        deviceId: 'native-fallback',
        method: 'native',
        message: 'Lecture dans le player natif de l\'application'
      };
    }
    
    return {
      success: false,
      deviceType: CastDeviceType.UNKNOWN,
      deviceId: '',
      method: 'web',
      message: 'Aucune stratégie de fallback disponible'
    };
  }

  // Méthodes de découverte spécifiques à chaque type d'appareil

  private async discoverChromecastDevices(): Promise<DetectedCastDevice[]> {
    const devices: DetectedCastDevice[] = [];
    
    try {
      // Utiliser le SDK Google Cast pour détecter les Chromecast
      const { Chromecast } = await import('./index');
      
      // Demander la liste des appareils disponibles
      // Note: Le SDK ne fournit pas directement une liste, mais on peut détecter la disponibilité
      await Chromecast.initialize({ appId: undefined });
      
      // Simuler la détection (dans une vraie implémentation, utiliser les événements du SDK)
      return []; // À implémenter avec les vrais événements du SDK
      
    } catch (error) {
      console.warn('Impossible de détecter les Chromecast:', error);
      return devices;
    }
  }

  private async discoverAndroidTVDevices(): Promise<DetectedCastDevice[]> {
    const devices: DetectedCastDevice[] = [];
    
    try {
      // Scanner le réseau local pour les Android TV
      // (Nécessiterait une implémentation native ou un service de découverte)
      
      // Pour l'instant, détecter si on est sur Android et supposer qu'il y a potentiellement des Android TV
      if (this.isAndroid()) {
        devices.push({
          id: 'android-tv-local',
          name: 'Android TV Local',
          type: CastDeviceType.ANDROID_TV,
          capabilities: ['hls', 'mp4', 'auth'],
          isAvailable: true
        });
      }
      
      return devices;
      
    } catch (error) {
      console.warn('Impossible de détecter les Android TV:', error);
      return devices;
    }
  }

  private async discoverAirPlayDevices(): Promise<DetectedCastDevice[]> {
    const devices: DetectedCastDevice[] = [];
    
    if (this.isIOS()) {
      // Utiliser les API iOS pour détecter AirPlay
      // (Nécessiterait l'implémentation native iOS)
      
      devices.push({
        id: 'airplay-default',
        name: 'AirPlay',
        type: CastDeviceType.AIRPLAY,
        capabilities: ['airplay', 'hls', 'mp4'],
        isAvailable: true
      });
    }
    
    return devices;
  }

  private async discoverDLNADevices(): Promise<DetectedCastDevice[]> {
    const devices: DetectedCastDevice[] = [];
    
    // Scanner UPnP/DLNA sur le réseau local
    // (Nécessiterait une implémentation de découverte UPnP)
    
    return devices;
  }

  // Méthodes utilitaires

  private async selectTargetDevice(preferredType?: CastDeviceType): Promise<DetectedCastDevice | null> {
    if (this.discoveredDevices.size === 0) {
      await this.discoverDevices();
    }
    
    const availableDevices = Array.from(this.discoveredDevices.values())
      .filter(device => device.isAvailable);
    
    if (preferredType) {
      const preferredDevice = availableDevices.find(device => device.type === preferredType);
      if (preferredDevice) return preferredDevice;
    }
    
    // Priorité par défaut: Chromecast > Android TV > AirPlay > DLNA
    const priorityOrder = [
      CastDeviceType.CHROMECAST,
      CastDeviceType.ANDROID_TV,
      CastDeviceType.AIRPLAY,
      CastDeviceType.DLNA
    ];
    
    for (const type of priorityOrder) {
      const device = availableDevices.find(d => d.type === type);
      if (device) return device;
    }
    
    return availableDevices[0] || null;
  }

  private getContentType(contentId: string): string {
    if (contentId.includes('.m3u8')) return 'application/x-mpegURL';
    if (contentId.includes('.mp4')) return 'video/mp4';
    if (contentId.includes('.webm')) return 'video/webm';
    return 'video/mp4';
  }

  private getStreamType(contentId: string): string {
    return contentId.includes('.m3u8') ? 'LIVE' : 'BUFFERED';
  }

  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private async hasUniversalReceiverApp(): Promise<boolean> {
    // Vérifier si l'application universelle est installée
    try {
      // Simuler la vérification d'app
      return Promise.resolve(false);
    } catch {
      return false;
    }
  }

  private async launchUniversalReceiverIntent(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<void> {
    const intentUrl = `universalreceiver://cast?` + 
      `url=${encodeURIComponent(options.contentId)}&` +
      `token=${encodeURIComponent(options.authToken || '')}&` +
      `title=${encodeURIComponent(options.metadata?.title || '')}`;
    
    // Ouvrir l'URL dans le navigateur pour déclencher l'intent
    window.open(intentUrl, '_system');
    return Promise.resolve();
  }

  private async launchThirdPartyIntent(options: UniversalStreamOptions): Promise<{ success: boolean; message: string }> {
    try {
      // Essayer VLC en premier
      const vlcUrl = `vlc://${options.contentId}`;
      window.open(vlcUrl, '_system');
      
      return { success: true, message: 'Ouvert avec VLC' };
    } catch {
      try {
        // Essayer un intent générique
        window.open(options.contentId, '_system');
        
        return { success: true, message: 'Ouvert avec application par défaut' };
      } catch {
        return { success: false, message: 'Aucune application compatible trouvée' };
      }
    }
  }

  private async launchGenericIntent(options: UniversalStreamOptions): Promise<{ success: boolean; message: string }> {
    try {
      window.open(options.contentId, '_system');
      
      return { success: true, message: 'Stream ouvert avec l\'application par défaut' };
    } catch (error) {
      return { success: false, message: `Erreur: ${(error as Error).message}` };
    }
  }

  private async openWebPlayer(options: UniversalStreamOptions): Promise<void> {
    // Créer une page de player web temporaire
    const playerUrl = this.createWebPlayerUrl(options);
    window.open(playerUrl, '_blank');
    return Promise.resolve();
  }

  private createWebPlayerUrl(options: UniversalStreamOptions): string {
    const baseUrl = 'https://votre-domaine.com/universal-receiver/web/';
    const params = new URLSearchParams({
      url: options.contentId,
      token: options.authToken || '',
      title: options.metadata?.title || '',
      autoplay: 'true'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  private async playInNativePlayer(options: UniversalStreamOptions): Promise<void> {
    // Implémenter le player natif dans l'application
    // (Nécessiterait l'intégration d'un player vidéo dans l'app)
    console.log('Player natif non encore implémenté');
    return Promise.resolve();
  }

  private async nativeAirPlayCast(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<void> {
    // Implémenter le casting AirPlay natif
    console.log('AirPlay natif non encore implémenté');
    return Promise.resolve();
  }

  private async dlnaCast(options: UniversalStreamOptions, device: DetectedCastDevice): Promise<void> {
    // Implémenter le casting DLNA
    console.log('DLNA non encore implémenté');
    return Promise.resolve();
  }

  private async handleFallback(options: UniversalStreamOptions, error: Error): Promise<UniversalCastResult> {
    console.log('🔄 Gestion du fallback après erreur:', error.message);
    
    // Essayer la stratégie de fallback configurée
    return await this.castFallback(options);
  }

  // Gestion des événements

  private notifyDeviceDiscovered(device: DetectedCastDevice): void {
    const listeners = this.eventListeners.get('deviceDiscovered') || [];
    listeners.forEach(listener => {
      try {
        listener.callback(device);
      } catch (error) {
        console.error('Erreur dans le listener deviceDiscovered:', error);
      }
    });
  }

  public addEventListener(event: keyof UniversalCastEvents, callback: Function): PluginListenerHandle {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    const handle: PluginListenerHandle = {
      remove: async () => {
        const listeners = this.eventListeners.get(event) || [];
        const index = listeners.findIndex(listener => listener.handle === handle);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
    
    const listener = { callback, handle };
    this.eventListeners.get(event)!.push(listener);
    return handle;
  }

  public removeAllListeners(): void {
    this.eventListeners.clear();
  }
}

// Export de l'instance singleton
export const universalCasting = UniversalCasting.getInstance(); 