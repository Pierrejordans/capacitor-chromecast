# 🌐 Récepteur Universel de Casting HLS Sécurisé

Un système de casting universel qui fonctionne sur **tous les appareils** supportant le streaming : Chromecast, Android TV, AirPlay, DLNA, et plus.

## 🎯 Problème résolu

**Le défi** : Les flux HLS sécurisés avec tokens d'authentification ne fonctionnent pas correctement sur les appareils de casting standard car les segments vidéo sont chargés sans préserver l'authentification.

**Notre solution** : Un système universel qui :
- ✅ **Détecte automatiquement** le type d'appareil disponible
- ✅ **Route intelligemment** vers la méthode appropriée
- ✅ **Préserve l'authentification** pour tous les segments
- ✅ **Fournit des fallbacks** en cas d'échec
- ✅ **Supporte tous les protocoles** de casting majeurs

## 🏗️ Architecture

```
📱 Application Mobile
    ↓
🧠 Système de Détection Universel
    ↓
🔀 Router Intelligent
   ├── 📡 Chromecast (récepteur web)
   ├── 📺 Android TV (app native)
   ├── 📱 AirPlay (API native)
   ├── 🌐 DLNA/UPnP
   └── 🔄 Stratégies de fallback
```

## 📦 Contenu du projet

```
universal-receiver/
├── 🌐 web/
│   ├── index.html          # Récepteur web universel
│   └── test.html           # Interface de test
├── 📺 android-tv/
│   ├── app/                # Application Android TV native
│   ├── MainActivity.kt     # Activité principale
│   └── layout/             # Interfaces utilisateur
├── 🔧 src/
│   └── universal-casting.ts # Système de casting universel
└── 📖 docs/               # Documentation complète
```

## 🚀 Installation et déploiement

### 1. Intégration dans votre app Capacitor

```bash
# Installer le plugin (avec les nouvelles fonctionnalités)
npm install @caprockapps/capacitor-chromecast

# Importer le système universel
```

```typescript
import { universalCasting, CastDeviceType } from '@caprockapps/capacitor-chromecast/universal-casting';

// Découvrir les appareils disponibles
const devices = await universalCasting.discoverDevices();
console.log('Appareils trouvés:', devices);

// Caster de manière universelle
const result = await universalCasting.castStream({
  contentId: 'https://example.com/stream.m3u8?token=xxx',
  authToken: 'your_auth_token',
  metadata: {
    title: 'Mon Stream Sécurisé',
    subtitle: 'Avec authentification'
  },
  preferredDeviceType: CastDeviceType.CHROMECAST,
  fallbackStrategy: 'intent'
});

console.log('Résultat:', result);
```

### 2. Déployer le récepteur web (Chromecast)

```bash
# 1. Héberger le récepteur web
cd universal-receiver/web
npm start          # Test local
npm run tunnel     # Tunnel public HTTPS

# 2. Enregistrer sur Google Cast Console
# https://cast.google.com/publish/
# URL: https://votre-domaine.com/universal-receiver/web/index.html
```

### 3. Installer l'app Android TV

```bash
# 1. Compiler l'APK
cd universal-receiver/android-tv
./gradlew assembleRelease

# 2. Installer sur Android TV
adb install app/build/outputs/apk/release/app-release.apk

# 3. Configurer les intents dans votre app principale
```

## 🎮 Utilisation

### API Simple - Détection automatique

```typescript
import { universalCasting } from '@caprockapps/capacitor-chromecast/universal-casting';

// Le plus simple - détection et casting automatiques
const result = await universalCasting.castStream({
  contentId: 'https://example.com/stream.m3u8?token=xxx',
  authToken: 'your_token'
});

if (result.success) {
  console.log(`✅ Casting réussi vers ${result.deviceType} via ${result.method}`);
} else {
  console.log(`❌ Erreur: ${result.message}`);
}
```

### API Avancée - Contrôle précis

```typescript
// 1. Découvrir les appareils spécifiques
const devices = await universalCasting.discoverDevices();
const androidTVs = devices.filter(d => d.type === CastDeviceType.ANDROID_TV);

// 2. Configurer des stratégies de fallback
const result = await universalCasting.castStream({
  contentId: 'https://example.com/secure-stream.m3u8',
  authToken: 'jwt_token_here',
  metadata: {
    title: 'Film Premium',
    subtitle: 'Qualité 4K',
    description: 'Un film incroyable',
    image: 'https://example.com/poster.jpg',
    duration: 7200 // 2 heures
  },
  headers: {
    'Authorization': 'Bearer jwt_token_here',
    'X-Custom-Header': 'custom_value'
  },
  preferredDeviceType: CastDeviceType.ANDROID_TV,
  fallbackStrategy: 'web' // Si Android TV échoue, ouvrir dans le navigateur
});

// 3. Écouter les événements
universalCasting.addEventListener('deviceDiscovered', (device) => {
  console.log(`📡 Nouvel appareil: ${device.name} (${device.type})`);
});

universalCasting.addEventListener('mediaStateChanged', (state) => {
  console.log(`🎮 État de lecture: ${state}`);
});
```

## 🔧 Types d'appareils supportés

### 📡 Chromecast
- **Méthode** : Récepteur web HTML/JS
- **Authentification** : Interception des requêtes réseau
- **Avantages** : Support natif, stable, répandu
- **Limitations** : Nécessite un récepteur personnalisé pour l'auth

### 📺 Android TV
- **Méthode** : Application native Android avec ExoPlayer
- **Authentification** : Headers HTTP personnalisés
- **Avantages** : Contrôle total, performance optimale
- **Limitations** : Nécessite installation d'une app

### 📱 AirPlay (iOS)
- **Méthode** : API native iOS
- **Authentification** : Intégration système
- **Avantages** : Seamless sur iOS, qualité excellente
- **Limitations** : Limité à l'écosystème Apple

### 🌐 DLNA/UPnP
- **Méthode** : Protocole réseau standard
- **Authentification** : Via headers HTTP
- **Avantages** : Compatible avec de nombreux appareils
- **Limitations** : Configuration réseau requise

## 🛠️ Stratégies de fallback

### 1. **Fallback Web**
Si aucun appareil de casting n'est trouvé, ouvre le stream dans un navigateur web avec un player intégré.

```typescript
fallbackStrategy: 'web'
```

### 2. **Fallback Intent (Android)**
Utilise les intents Android pour ouvrir le stream avec des applications tierces (VLC, Kodi, etc.).

```typescript
fallbackStrategy: 'intent'
```

### 3. **Fallback Native**
Lit le stream directement dans l'application avec un player intégré.

```typescript
fallbackStrategy: 'native'
```

## 🔒 Gestion de l'authentification

### Méthodes d'authentification supportées

1. **Token dans l'URL**
```typescript
contentId: 'https://stream.m3u8?token=your_token'
```

2. **Token séparé**
```typescript
{
  contentId: 'https://stream.m3u8',
  authToken: 'your_token'
}
```

3. **Headers personnalisés**
```typescript
{
  contentId: 'https://stream.m3u8',
  headers: {
    'Authorization': 'Bearer your_token',
    'X-API-Key': 'your_api_key'
  }
}
```

### Fonctionnement de l'authentification par appareil

| Appareil | Méthode | Description |
|----------|---------|-------------|
| Chromecast | Interception JS | Le récepteur web intercepte toutes les requêtes et ajoute le token |
| Android TV | Headers HTTP | ExoPlayer configuré avec headers d'authentification |
| AirPlay | Token URL | Le token est inclus dans l'URL du stream |
| DLNA | Headers HTTP | Les headers sont transmis via le protocole UPnP |

## 📊 Monitoring et debug

### Événements disponibles

```typescript
// Découverte d'appareils
universalCasting.addEventListener('deviceDiscovered', (device) => {
  console.log('Appareil trouvé:', device);
});

// Perte d'appareils
universalCasting.addEventListener('deviceLost', (deviceId) => {
  console.log('Appareil perdu:', deviceId);
});

// État de connexion
universalCasting.addEventListener('connectionStateChanged', (state) => {
  console.log('État connexion:', state); // connected, disconnected, connecting, error
});

// État de lecture
universalCasting.addEventListener('mediaStateChanged', (state) => {
  console.log('État média:', state); // playing, paused, buffering, idle, error
});

// Progression
universalCasting.addEventListener('mediaProgress', (progress) => {
  console.log(`Progression: ${progress.position}% (${progress.currentTime}s / ${progress.duration}s)`);
});
```

### Debug et logs

```typescript
// Activer les logs détaillés
console.log('Mode debug activé');

// Les logs apparaissent automatiquement dans la console
// et sur l'interface des récepteurs (web et Android TV)
```

## 🧪 Tests et validation

### 1. Test du récepteur web
```bash
cd universal-receiver/web
npm test  # Ouvre l'interface de test interactive
```

### 2. Test de l'app Android TV
```bash
cd universal-receiver/android-tv
./gradlew connectedAndroidTest
```

### 3. Test d'intégration
```typescript
import { universalCasting } from './universal-casting';

async function testUniversalCasting() {
  // Test de découverte
  const devices = await universalCasting.discoverDevices();
  console.log(`✅ ${devices.length} appareil(s) découvert(s)`);
  
  // Test de casting
  const testStreams = [
    'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  ];
  
  for (const stream of testStreams) {
    const result = await universalCasting.castStream({
      contentId: stream,
      metadata: { title: `Test Stream ${stream}` }
    });
    
    console.log(`Stream ${stream}: ${result.success ? '✅' : '❌'}`);
  }
}

testUniversalCasting();
```

## 🔧 Configuration avancée

### Personnaliser les types d'appareils détectés

```typescript
import { UniversalCasting, CastDeviceType } from './universal-casting';

const casting = UniversalCasting.getInstance();

// Désactiver certains types d'appareils
const devices = await casting.discoverDevices();
const filteredDevices = devices.filter(device => 
  device.type !== CastDeviceType.DLNA // Exclure DLNA
);
```

### Ajouter des headers d'authentification personnalisés

```typescript
const result = await universalCasting.castStream({
  contentId: 'https://secure-stream.m3u8',
  headers: {
    'Authorization': 'Bearer ' + getJWTToken(),
    'X-Device-ID': getDeviceId(),
    'X-Session-ID': getSessionId(),
    'User-Agent': 'MyApp/1.0'
  }
});
```

### Configurer les timeouts et retry

```typescript
// Configuration globale (à implémenter)
const options = {
  discoveryTimeout: 10000,  // 10 secondes
  connectionTimeout: 15000, // 15 secondes
  maxRetries: 3,
  retryDelay: 2000         // 2 secondes
};
```

## 🆘 Dépannage

### Problèmes fréquents

**1. "Aucun appareil trouvé"**
- Vérifiez que les appareils sont sur le même réseau
- Assurez-vous que le WiFi est activé
- Redémarrez la découverte d'appareils

**2. "Échec de casting Chromecast"**
- Vérifiez que le récepteur web est déployé en HTTPS
- Contrôlez l'App ID dans Google Cast Console
- Ajoutez votre appareil comme device de test

**3. "Application Android TV non trouvée"**
- Installez l'APK sur l'Android TV
- Vérifiez les permissions dans le manifeste
- Testez avec un intent direct

**4. "Authentification échoue"**
- Vérifiez que le token est valide
- Contrôlez les headers dans les requêtes réseau
- Testez l'URL directement dans un navigateur

### Debug avancé

```bash
# Chromecast - Console du récepteur
# Ouvrez https://votre-recepteur.com dans Chrome
# F12 → Console → Voir les logs

# Android TV - Logs système
adb logcat | grep UniversalReceiver

# iOS - Console Xcode
# Window → Devices and Simulators → Voir les logs

# Réseau - Wireshark
# Capturer le trafic réseau pour diagnostiquer les requêtes
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎉 Remerciements

- Google Cast SDK pour l'infrastructure Chromecast
- ExoPlayer pour le player Android haute performance
- La communauté open source pour les outils et librairies

---

**🎯 Maintenant vous avez un système de casting vraiment universel qui fonctionne partout !** 