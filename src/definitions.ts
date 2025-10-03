import { ListenerCallback, PluginListenerHandle } from '@capacitor/core';

/**
 * Options pour l'initialisation du plugin Chromecast
 */
export interface ChromecastInitializeOptions {
  /**
   * L'ID de l'application de récepteur Chromecast
   * Si non fourni, utilise l'ID par défaut du récepteur média
   */
  appId?: string;
  
  /**
   * Politique d'auto-join pour les sessions Chromecast
   * - 'tab_and_origin_scoped': Joint automatiquement les sessions de l'onglet et de l'origine
   * - 'origin_scoped': Joint automatiquement les sessions de l'origine
   * - 'page_scoped': Joint automatiquement les sessions de la page
   */
  autoJoinPolicy?: 'tab_and_origin_scoped' | 'origin_scoped' | 'page_scoped';
  
  /**
   * Politique d'action par défaut pour les sessions Chromecast
   * - 'create_session': Crée une nouvelle session
   * - 'cast_this_tab': Diffuse l'onglet actuel
   */
  defaultActionPolicy?: 'create_session' | 'cast_this_tab';
}

/**
 * Options pour lancer un média sur Chromecast
 */
export interface ChromecastLaunchMediaOptions {
  /**
   * URL du média à lancer
   */
  mediaUrl: string;
}

/**
 * Options pour charger un média avec des en-têtes d'authentification personnalisés
 */
export interface ChromecastLoadMediaOptions {
  /**
   * URL du média à charger
   */
  contentId: string;
  
  /**
   * Données personnalisées à inclure avec le média
   */
  customData?: any;
  
  /**
   * Type MIME du contenu (ex: 'application/x-mpegURL' pour HLS)
   * Si non spécifié, sera détecté automatiquement
   */
  contentType?: string;
  
  /**
   * Durée du média en secondes
   */
  duration?: number;
  
  /**
   * Type de stream: 'LIVE', 'BUFFERED', ou 'NONE'
   * Si non spécifié, sera détecté automatiquement
   */
  streamType?: 'LIVE' | 'BUFFERED' | 'NONE';
  
  /**
   * Démarrer la lecture automatiquement
   */
  autoPlay?: boolean;
  
  /**
   * Position de départ en secondes
   */
  currentTime?: number;
  
  /**
   * Métadonnées du média
   */
  metadata?: any;
  
  /**
   * Style des sous-titres
   */
  textTrackStyle?: any;
  
  /**
   * En-têtes d'authentification personnalisés
   */
  authHeaders?: { [key: string]: string };
  
  /**
   * Token d'authentification à ajouter aux données personnalisées
   */
  authToken?: string;
}

/**
 * Options pour charger un flux HLS sécurisé
 */
export interface ChromecastSecureHLSOptions {
  /**
   * URL du flux HLS avec token d'authentification
   */
  contentId: string;
  
  /**
   * ID de l'application récepteur personnalisé (optionnel)
   * Si fourni, utilisera ce récepteur au lieu du récepteur par défaut
   */
  customAppId?: string;
  
  /**
   * Token d'authentification (extrait automatiquement de l'URL si non fourni)
   */
  authToken?: string;
  
  /**
   * Type MIME du contenu (par défaut: 'application/x-mpegURL')
   */
  contentType?: string;
  
  /**
   * Type de stream (par défaut: 'LIVE')
   */
  streamType?: 'LIVE' | 'BUFFERED' | 'NONE';
  
  /**
   * Démarrer la lecture automatiquement (par défaut: true)
   */
  autoPlay?: boolean;
  
  /**
   * Métadonnées du média
   */
  metadata?: any;
  
  /**
   * Données personnalisées additionnelles
   */
  customData?: any;
}

export interface ChromecastPlugin {
  /**
   * Initialise le plugin Chromecast avec les options spécifiées
   * @param options Options de configuration pour l'initialisation
   * @returns Promise qui se résout quand l'initialisation est terminée
   */
  initialize(options: ChromecastInitializeOptions): Promise<void>;

  requestSession(): Promise<void>;

  /**
   * Lance un média sur Chromecast avec des paramètres par défaut
   * @param options Options contenant l'URL du média
   * @returns Promise qui se résout avec true si le lancement réussit, false sinon
   */
  launchMedia(options: ChromecastLaunchMediaOptions): Promise<{ value: boolean }>;

  /**
   * Charge un média avec des options étendues incluant le support pour les en-têtes d'authentification
   * @param options Options détaillées pour le chargement du média
   * @returns Promise qui se résout avec les informations du média chargé
   */
  loadMedia(options: ChromecastLoadMediaOptions): Promise<any>;

  /**
   * Charge un média avec des en-têtes d'authentification personnalisés
   * @param options Options incluant les en-têtes d'authentification
   * @returns Promise qui se résout avec les informations du média chargé
   */
  loadMediaWithHeaders(options: ChromecastLoadMediaOptions): Promise<any>;

  /**
   * Charge un flux HLS sécurisé avec gestion spécialisée de l'authentification
   * @param options Options pour le flux HLS sécurisé
   * @returns Promise qui se résout avec les informations du média chargé
   */
  loadSecureHLS(options: ChromecastSecureHLSOptions): Promise<any>;

  addListener(
    eventName: string,
    listenerFunc: ListenerCallback,
  ): Promise<PluginListenerHandle>;

  sendMessage(messageObj: any): Promise<any>;
}
