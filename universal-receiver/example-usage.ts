/**
 * Exemple d'utilisation du système de casting universel
 * 
 * Ce fichier montre comment intégrer et utiliser le casting universel
 * dans votre application Capacitor.
 */

import { universalCasting, CastDeviceType } from '../src/universal-casting';

// Interface pour les stream de test
interface TestStream {
  name: string;
  url: string;
  token?: string;
  metadata?: any;
}

/**
 * Classe exemple pour gérer le casting dans votre application
 */
export class StreamingManager {
  private isDiscovering = false;
  private discoveredDevices: any[] = [];
  private currentConnection: any = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialiser et découvrir les appareils de casting
   */
  async initialize() {
    console.log('🚀 Initialisation du gestionnaire de streaming...');
    
    try {
      // Découvrir les appareils disponibles
      const devices = await universalCasting.discoverDevices();
      this.discoveredDevices = devices;
      
      console.log(`✅ ${devices.length} appareil(s) de casting trouvé(s):`);
      devices.forEach(device => {
        console.log(`  - ${device.name} (${device.type})`);
      });
      
      return devices;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  /**
   * Configurer les listeners d'événements
   */
  private setupEventListeners() {
    // Découverte d'appareils
    universalCasting.addEventListener('deviceDiscovered', (device) => {
      console.log(`📡 Nouvel appareil découvert: ${device.name} (${device.type})`);
      this.discoveredDevices.push(device);
      
      // Notifier l'interface utilisateur
      this.notifyUI('deviceDiscovered', device);
    });

    // Perte d'appareil
    universalCasting.addEventListener('deviceLost', (deviceId) => {
      console.log(`📱 Appareil perdu: ${deviceId}`);
      this.discoveredDevices = this.discoveredDevices.filter(d => d.id !== deviceId);
      
      // Notifier l'interface utilisateur
      this.notifyUI('deviceLost', deviceId);
    });

    // Changement d'état de connexion
    universalCasting.addEventListener('connectionStateChanged', (state) => {
      console.log(`🔗 État de connexion: ${state}`);
      
      // Mettre à jour l'interface selon l'état
      switch (state) {
        case 'connected':
          this.notifyUI('connected', null);
          break;
        case 'disconnected':
          this.notifyUI('disconnected', null);
          break;
        case 'connecting':
          this.notifyUI('connecting', null);
          break;
        case 'error':
          this.notifyUI('connectionError', null);
          break;
      }
    });

    // Changement d'état de lecture
    universalCasting.addEventListener('mediaStateChanged', (state) => {
      console.log(`🎮 État de lecture: ${state}`);
      this.notifyUI('mediaStateChanged', state);
    });

    // Progression de lecture
    universalCasting.addEventListener('mediaProgress', (progress) => {
      console.log(`⏱️ Progression: ${progress.position}% (${progress.currentTime}s / ${progress.duration}s)`);
      this.notifyUI('mediaProgress', progress);
    });
  }

  /**
   * Caster un stream simple
   */
  async castStream(streamUrl: string, options: any = {}) {
    console.log(`🎬 Tentative de casting: ${streamUrl}`);
    
    try {
      const result = await universalCasting.castStream({
        contentId: streamUrl,
        authToken: options.token,
        metadata: {
          title: options.title || 'Stream sans titre',
          subtitle: options.subtitle || '',
          description: options.description || '',
          image: options.image || '',
          duration: options.duration || 0
        },
        preferredDeviceType: options.preferredDevice,
        fallbackStrategy: options.fallbackStrategy || 'web'
      });

      if (result.success) {
        console.log(`✅ Casting réussi vers ${result.deviceType} via ${result.method}`);
        this.currentConnection = result;
        this.notifyUI('castingSuccess', result);
        return result;
      } else {
        console.log(`❌ Échec du casting: ${result.message}`);
        this.notifyUI('castingError', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Erreur lors du casting:', error);
      this.notifyUI('castingError', error.message);
      throw error;
    }
  }

  /**
   * Caster un stream HLS sécurisé
   */
  async castSecureHLS(streamUrl: string, authToken: string, options: any = {}) {
    console.log(`🔐 Casting HLS sécurisé: ${streamUrl}`);
    
    return await this.castStream(streamUrl, {
      ...options,
      token: authToken,
      preferredDevice: CastDeviceType.CHROMECAST,
      fallbackStrategy: 'android-tv'
    });
  }

  /**
   * Obtenir la liste des appareils disponibles
   */
  getAvailableDevices() {
    return this.discoveredDevices.filter(device => device.isAvailable);
  }

  /**
   * Obtenir les appareils par type
   */
  getDevicesByType(type: CastDeviceType) {
    return this.discoveredDevices.filter(device => 
      device.type === type && device.isAvailable
    );
  }

  /**
   * Vérifier si un type d'appareil est disponible
   */
  isDeviceTypeAvailable(type: CastDeviceType): boolean {
    return this.getDevicesByType(type).length > 0;
  }

  /**
   * Fonction utilitaire pour notifier l'interface utilisateur
   */
  private notifyUI(event: string, data: any) {
    // Vous pouvez remplacer ceci par votre système de notification
    // (Redux, Vuex, événements personnalisés, etc.)
    
    // Exemple avec des événements personnalisés
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('universal-casting', {
        detail: { event, data }
      }));
    }
  }

  /**
   * Nettoyer les listeners
   */
  cleanup() {
    universalCasting.removeAllListeners();
  }
}

/**
 * Exemple d'utilisation basique
 */
export async function basicExample() {
  console.log('🎯 Exemple d\'utilisation basique du casting universel');
  
  // Créer le gestionnaire
  const streamingManager = new StreamingManager();
  
  try {
    // Initialiser
    await streamingManager.initialize();
    
    // Streams de test
    const testStreams: TestStream[] = [
      {
        name: 'Stream public HLS',
        url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        metadata: {
          title: 'Tears of Steel',
          subtitle: 'Film de démonstration',
          description: 'Un court-métrage de science-fiction produit par la Blender Foundation',
          image: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
          duration: 734
        }
      },
      {
        name: 'Stream MP4 public',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        metadata: {
          title: 'Big Buck Bunny',
          subtitle: 'Animation 3D',
          description: 'Un court-métrage d\'animation produit par la Blender Foundation',
          image: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
          duration: 596
        }
      },
      {
        name: 'Stream HLS sécurisé (exemple)',
        url: 'https://example.com/secure-stream.m3u8?token=demo_token',
        token: 'demo_token_123456789',
        metadata: {
          title: 'Contenu Premium',
          subtitle: 'Avec authentification',
          description: 'Exemple de stream sécurisé avec token d\'authentification',
          duration: 3600
        }
      }
    ];
    
    // Tester chaque stream
    for (const stream of testStreams) {
      console.log(`\n📺 Test du stream: ${stream.name}`);
      
      try {
        const result = await streamingManager.castStream(stream.url, {
          title: stream.metadata?.title,
          subtitle: stream.metadata?.subtitle,
          description: stream.metadata?.description,
          image: stream.metadata?.image,
          duration: stream.metadata?.duration,
          token: stream.token
        });
        
        console.log(`✅ Succès: ${result.message}`);
        
        // Attendre 5 secondes avant le prochain test
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.log(`❌ Échec: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur dans l\'exemple:', error);
  } finally {
    // Nettoyer
    streamingManager.cleanup();
  }
}

/**
 * Exemple d'utilisation avancée avec préférence d'appareil
 */
export async function advancedExample() {
  console.log('🎯 Exemple d\'utilisation avancée du casting universel');
  
  const streamingManager = new StreamingManager();
  
  try {
    // Initialiser
    const devices = await streamingManager.initialize();
    
    // Vérifier les types d'appareils disponibles
    const hasChromecast = streamingManager.isDeviceTypeAvailable(CastDeviceType.CHROMECAST);
    const hasAndroidTV = streamingManager.isDeviceTypeAvailable(CastDeviceType.ANDROID_TV);
    const hasAirPlay = streamingManager.isDeviceTypeAvailable(CastDeviceType.AIRPLAY);
    
    console.log(`📊 Appareils disponibles:`);
    console.log(`  - Chromecast: ${hasChromecast ? '✅' : '❌'}`);
    console.log(`  - Android TV: ${hasAndroidTV ? '✅' : '❌'}`);
    console.log(`  - AirPlay: ${hasAirPlay ? '✅' : '❌'}`);
    
    // Stream sécurisé avec stratégie intelligente
    const secureStream = {
      url: 'https://example.com/premium-content.m3u8',
      token: 'jwt_token_here',
      metadata: {
        title: 'Contenu Premium 4K',
        subtitle: 'Qualité Ultra HD',
        description: 'Film exclusif avec authentification JWT',
        image: 'https://example.com/premium-poster.jpg',
        duration: 7200
      }
    };
    
    // Stratégie de casting intelligente
    let result;
    
    if (hasChromecast) {
      console.log('📡 Tentative de casting vers Chromecast...');
      result = await streamingManager.castStream(secureStream.url, {
        ...secureStream.metadata,
        token: secureStream.token,
        preferredDevice: CastDeviceType.CHROMECAST,
        fallbackStrategy: 'android-tv'
      });
    } else if (hasAndroidTV) {
      console.log('📺 Tentative de casting vers Android TV...');
      result = await streamingManager.castStream(secureStream.url, {
        ...secureStream.metadata,
        token: secureStream.token,
        preferredDevice: CastDeviceType.ANDROID_TV,
        fallbackStrategy: 'intent'
      });
    } else {
      console.log('🌐 Aucun appareil de casting trouvé, utilisation du fallback web...');
      result = await streamingManager.castStream(secureStream.url, {
        ...secureStream.metadata,
        token: secureStream.token,
        fallbackStrategy: 'web'
      });
    }
    
    console.log(`🎉 Casting terminé: ${result.success ? 'Succès' : 'Échec'}`);
    
  } catch (error) {
    console.error('❌ Erreur dans l\'exemple avancé:', error);
  } finally {
    streamingManager.cleanup();
  }
}

/**
 * Exemple d'intégration avec une interface utilisateur
 */
export class UIIntegrationExample {
  private streamingManager: StreamingManager;
  private uiElements: any = {};
  
  constructor() {
    this.streamingManager = new StreamingManager();
    this.setupUI();
    this.setupEventListeners();
  }
  
  private setupUI() {
    // Simuler des éléments d'interface utilisateur
    this.uiElements = {
      devicesList: document.getElementById('devices-list'),
      castButton: document.getElementById('cast-button'),
      statusDisplay: document.getElementById('status-display'),
      progressBar: document.getElementById('progress-bar')
    };
  }
  
  private setupEventListeners() {
    // Écouter les événements du système de casting
    window.addEventListener('universal-casting', (event: any) => {
      const { event: eventType, data } = event.detail;
      
      switch (eventType) {
        case 'deviceDiscovered':
          this.updateDevicesList();
          break;
        case 'connected':
          this.updateStatus('Connecté');
          break;
        case 'castingSuccess':
          this.updateStatus(`Casting réussi vers ${data.deviceType}`);
          break;
        case 'mediaProgress':
          this.updateProgress(data.position);
          break;
        case 'castingError':
          this.updateStatus(`Erreur: ${data}`, 'error');
          break;
      }
    });
  }
  
  async initialize() {
    await this.streamingManager.initialize();
    this.updateDevicesList();
  }
  
  private updateDevicesList() {
    const devices = this.streamingManager.getAvailableDevices();
    
    // Mettre à jour la liste des appareils dans l'interface
    if (this.uiElements.devicesList) {
      this.uiElements.devicesList.innerHTML = devices.map(device => 
        `<div class="device-item">
          <span class="device-name">${device.name}</span>
          <span class="device-type">${device.type}</span>
          <button onclick="castToDevice('${device.id}')">Caster</button>
        </div>`
      ).join('');
    }
  }
  
  private updateStatus(message: string, type: string = 'info') {
    if (this.uiElements.statusDisplay) {
      this.uiElements.statusDisplay.textContent = message;
      this.uiElements.statusDisplay.className = `status ${type}`;
    }
  }
  
  private updateProgress(position: number) {
    if (this.uiElements.progressBar) {
      this.uiElements.progressBar.value = position;
    }
  }
  
  async castCurrentStream(streamUrl: string, options: any = {}) {
    return await this.streamingManager.castStream(streamUrl, options);
  }
  
  cleanup() {
    this.streamingManager.cleanup();
  }
}

// Les exports sont déjà déclarés au niveau des fonctions/classes

// Utilisation simple pour tester
if (typeof window !== 'undefined') {
  // Rendre les exemples disponibles globalement pour les tests
  (window as any).castingExamples = {
    basicExample,
    advancedExample,
    UIIntegrationExample
  };
} 