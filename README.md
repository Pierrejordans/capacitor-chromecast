# @caprockapps/capacitor-chromecast

This is a plugin for Capacitor that enables Chromecast functionality for iOS and Android.

## Install

```bash
npm install @caprockapps/capacitor-chromecast
npx cap sync
```

## API

<docgen-index>

* [`initialize(...)`](#initialize)
* [`requestSession()`](#requestsession)
* [`launchMedia(...)`](#launchmedia)
* [`loadMedia(...)`](#loadmedia)
* [`loadMediaWithHeaders(...)`](#loadmediawithheaders)
* [`loadSecureHLS(...)`](#loadsecurehls)
* [`addListener(string, ...)`](#addlistenerstring-)
* [`sendMessage(...)`](#sendmessage)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initialize(...)

```typescript
initialize(options: ChromecastInitializeOptions) => Promise<void>
```

Initialise le plugin Chromecast avec les options spécifiées

| Param         | Type                                                                                | Description                                    |
| ------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| **`options`** | <code><a href="#chromecastinitializeoptions">ChromecastInitializeOptions</a></code> | Options de configuration pour l'initialisation |

--------------------


### requestSession()

```typescript
requestSession() => Promise<void>
```

--------------------


### launchMedia(...)

```typescript
launchMedia(options: ChromecastLaunchMediaOptions) => Promise<{ value: boolean; }>
```

Lance un média sur Chromecast avec des paramètres par défaut

| Param         | Type                                                                                  | Description                      |
| ------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| **`options`** | <code><a href="#chromecastlaunchmediaoptions">ChromecastLaunchMediaOptions</a></code> | Options contenant l'URL du média |

**Returns:** <code>Promise&lt;{ value: boolean; }&gt;</code>

--------------------


### loadMedia(...)

```typescript
loadMedia(options: ChromecastLoadMediaOptions) => Promise<any>
```

Charge un média avec des options étendues incluant le support pour les en-têtes d'authentification

| Param         | Type                                                                              | Description                                    |
| ------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| **`options`** | <code><a href="#chromecastloadmediaoptions">ChromecastLoadMediaOptions</a></code> | Options détaillées pour le chargement du média |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### loadMediaWithHeaders(...)

```typescript
loadMediaWithHeaders(options: ChromecastLoadMediaOptions) => Promise<any>
```

Charge un média avec des en-têtes d'authentification personnalisés

| Param         | Type                                                                              | Description                                      |
| ------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| **`options`** | <code><a href="#chromecastloadmediaoptions">ChromecastLoadMediaOptions</a></code> | Options incluant les en-têtes d'authentification |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### loadSecureHLS(...)

```typescript
loadSecureHLS(options: ChromecastSecureHLSOptions) => Promise<any>
```

Charge un flux HLS sécurisé avec gestion spécialisée de l'authentification

| Param         | Type                                                                              | Description                       |
| ------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| **`options`** | <code><a href="#chromecastsecurehlsoptions">ChromecastSecureHLSOptions</a></code> | Options pour le flux HLS sécurisé |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### addListener(string, ...)

```typescript
addListener(eventName: string, listenerFunc: ListenerCallback) => Promise<PluginListenerHandle>
```

| Param              | Type                                                          |
| ------------------ | ------------------------------------------------------------- |
| **`eventName`**    | <code>string</code>                                           |
| **`listenerFunc`** | <code><a href="#listenercallback">ListenerCallback</a></code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### sendMessage(...)

```typescript
sendMessage(messageObj: any) => Promise<any>
```

| Param            | Type             |
| ---------------- | ---------------- |
| **`messageObj`** | <code>any</code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### Interfaces


#### ChromecastInitializeOptions

Options pour l'initialisation du plugin Chromecast

| Prop                      | Type                                                                     | Description                                                                                                                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`appId`**               | <code>string</code>                                                      | L'ID de l'application de récepteur Chromecast Si non fourni, utilise l'ID par défaut du récepteur média                                                                                                                                                                        |
| **`autoJoinPolicy`**      | <code>'tab_and_origin_scoped' \| 'origin_scoped' \| 'page_scoped'</code> | Politique d'auto-join pour les sessions Chromecast - 'tab_and_origin_scoped': Joint automatiquement les sessions de l'onglet et de l'origine - 'origin_scoped': Joint automatiquement les sessions de l'origine - 'page_scoped': Joint automatiquement les sessions de la page |
| **`defaultActionPolicy`** | <code>'create_session' \| 'cast_this_tab'</code>                         | Politique d'action par défaut pour les sessions Chromecast - 'create_session': Crée une nouvelle session - 'cast_this_tab': Diffuse l'onglet actuel                                                                                                                            |


#### ChromecastLaunchMediaOptions

Options pour lancer un média sur Chromecast

| Prop           | Type                | Description           |
| -------------- | ------------------- | --------------------- |
| **`mediaUrl`** | <code>string</code> | URL du média à lancer |


#### ChromecastLoadMediaOptions

Options pour charger un média avec des en-têtes d'authentification personnalisés

| Prop                 | Type                                        | Description                                                                                               |
| -------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **`contentId`**      | <code>string</code>                         | URL du média à charger                                                                                    |
| **`customData`**     | <code>any</code>                            | Données personnalisées à inclure avec le média                                                            |
| **`contentType`**    | <code>string</code>                         | Type MIME du contenu (ex: 'application/x-mpegURL' pour HLS) Si non spécifié, sera détecté automatiquement |
| **`duration`**       | <code>number</code>                         | Durée du média en secondes                                                                                |
| **`streamType`**     | <code>'LIVE' \| 'BUFFERED' \| 'NONE'</code> | Type de stream: 'LIVE', 'BUFFERED', ou 'NONE' Si non spécifié, sera détecté automatiquement               |
| **`autoPlay`**       | <code>boolean</code>                        | Démarrer la lecture automatiquement                                                                       |
| **`currentTime`**    | <code>number</code>                         | Position de départ en secondes                                                                            |
| **`metadata`**       | <code>any</code>                            | Métadonnées du média                                                                                      |
| **`textTrackStyle`** | <code>any</code>                            | Style des sous-titres                                                                                     |
| **`authHeaders`**    | <code>{ [key: string]: string; }</code>     | En-têtes d'authentification personnalisés                                                                 |
| **`authToken`**      | <code>string</code>                         | Token d'authentification à ajouter aux données personnalisées                                             |


#### ChromecastSecureHLSOptions

Options pour charger un flux HLS sécurisé

| Prop              | Type                                        | Description                                                                                                              |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **`contentId`**   | <code>string</code>                         | URL du flux HLS avec token d'authentification                                                                            |
| **`customAppId`** | <code>string</code>                         | ID de l'application récepteur personnalisé (optionnel) Si fourni, utilisera ce récepteur au lieu du récepteur par défaut |
| **`authToken`**   | <code>string</code>                         | Token d'authentification (extrait automatiquement de l'URL si non fourni)                                                |
| **`contentType`** | <code>string</code>                         | Type MIME du contenu (par défaut: 'application/x-mpegURL')                                                               |
| **`streamType`**  | <code>'LIVE' \| 'BUFFERED' \| 'NONE'</code> | Type de stream (par défaut: 'LIVE')                                                                                      |
| **`autoPlay`**    | <code>boolean</code>                        | Démarrer la lecture automatiquement (par défaut: true)                                                                   |
| **`metadata`**    | <code>any</code>                            | Métadonnées du média                                                                                                     |
| **`customData`**  | <code>any</code>                            | Données personnalisées additionnelles                                                                                    |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


### Type Aliases


#### ListenerCallback

<code>(err: any, ...args: any[]): void</code>

</docgen-api>

## Casting de flux HLS sécurisés

Si vous avez des flux m3u8 avec des tokens d'authentification (ex: `https://example.com/stream.m3u8?token=xxx`), vous rencontrez probablement un problème de "chargement infini" sur votre TV. Voici pourquoi et comment le résoudre :

### 🔍 Pourquoi les flux HLS sécurisés ne fonctionnent-ils pas ?

**Le problème** : Un flux HLS fonctionne en deux étapes :
1. **Fichier maître** : Le fichier `.m3u8` principal est chargé avec votre token ✅
2. **Segments vidéo** : Les segments `.ts` sont chargés **sans** le token ❌

Le récepteur par défaut de Chromecast ne transmet pas automatiquement les tokens aux segments vidéo.

### 🛠️ Solutions disponibles

#### Solution 1: **Utiliser `loadSecureHLS` (Recommandé)**

```typescript
import { Chromecast } from '@caprockapps/capacitor-chromecast';

// Initialiser le plugin
await Chromecast.initialize({ appId: 'YOUR_APP_ID' });

// Demander une session
await Chromecast.requestSession();

// Charger un flux HLS sécurisé
await Chromecast.loadSecureHLS({
  contentId: 'https://example.com/stream.m3u8?token=your_auth_token',
  metadata: {
    title: 'Mon Stream Sécurisé',
    subtitle: 'Avec authentification'
  }
});
```

#### Solution 2: **Utiliser un récepteur personnalisé**

Si vous avez votre propre récepteur Chromecast qui gère l'authentification HLS :

```typescript
await Chromecast.loadSecureHLS({
  contentId: 'https://example.com/stream.m3u8?token=your_auth_token',
  customAppId: 'YOUR_CUSTOM_RECEIVER_APP_ID',
  authToken: 'your_auth_token',
  metadata: {
    title: 'Mon Stream Sécurisé'
  }
});
```

#### Solution 3: **Modifier votre serveur de streaming**

La solution la plus robuste est de modifier votre serveur pour inclure les tokens dans les URLs des segments :

```m3u8
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXTINF:10.0,
segment1.ts?token=your_token
#EXTINF:10.0,
segment2.ts?token=your_token
```

#### Solution 4: **Utiliser des URLs pré-authentifiées**

Générez des URLs avec des tokens temporaires intégrés pour chaque segment.

### 🧪 Méthodes de test

```typescript
// Méthode de base (peut ne pas fonctionner avec des tokens)
await Chromecast.loadMedia({
  contentId: 'https://example.com/stream.m3u8?token=your_auth_token',
  contentType: 'application/x-mpegURL',
  streamType: 'LIVE',
  autoPlay: true
});

// Méthode avec en-têtes personnalisés
await Chromecast.loadMediaWithHeaders({
  contentId: 'https://example.com/stream.m3u8?token=your_auth_token',
  contentType: 'application/x-mpegURL',
  streamType: 'LIVE',
  autoPlay: true,
  authHeaders: {
    'Authorization': 'Bearer your_jwt_token'
  },
  authToken: 'your_auth_token'
});
```

### 📱 Développement d'un récepteur personnalisé

Pour une solution complète, vous pouvez créer un récepteur Chromecast personnalisé :

1. **Créer un récepteur** sur [Google Cast SDK Developer Console](https://cast.google.com/publish)
2. **Implémenter la logique** d'authentification HLS
3. **Utiliser votre App ID** personnalisé

Exemple de récepteur personnalisé (JavaScript) :

```javascript
// Dans votre récepteur personnalisé
cast.framework.CastReceiverContext.getInstance().start({
  customNamespaces: {
    'urn:x-cast:com.yourapp.auth': 'JSON'
  }
});

// Gérer l'authentification des segments
const playerManager = cast.framework.CastReceiverContext.getInstance().getPlayerManager();
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (loadRequestData) => {
    if (loadRequestData.customData && loadRequestData.customData.authToken) {
      // Ajouter le token aux requests de segments
      const token = loadRequestData.customData.authToken;
      // Logique personnalisée pour gérer l'authentification
    }
    return loadRequestData;
  }
);
```

### 🔧 Logs de débogage

Pour voir les logs de débogage dans Android Studio :

```bash
adb logcat | grep -i chromecast
```

Vous devriez voir des messages comme :
- `=== SECURE HLS DEBUG ===`
- `authToken: PRESENT`
- `customData: {"authToken":"...","secureHLS":true}`

### 🔍 Dépannage

1. **Testez avec un flux public** : Vérifiez que les flux HLS fonctionnent normalement
2. **Vérifiez les logs** : Regardez les messages d'erreur dans logcat
3. **Testez l'URL** : Utilisez `testUrl()` pour diagnostiquer les problèmes

```typescript
// Tester l'URL
await Chromecast.testUrl({ url: 'https://example.com/stream.m3u8?token=xxx' });

// Diagnostic réseau
await Chromecast.networkDiagnostic();
```

La solution `loadSecureHLS` transmet les informations d'authentification aux `customData`, mais pour une solution complète, vous devrez probablement implémenter un récepteur personnalisé ou modifier votre serveur de streaming.
