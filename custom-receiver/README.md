# Récepteur Chromecast HLS Sécurisé

Ce récepteur personnalisé résout le problème des flux HLS avec authentification en transmettant automatiquement les tokens d'authentification aux segments vidéo.

## 🎯 Problème résolu

**Avant** : Flux HLS sécurisés → Chargement infini sur Chromecast
- Fichier `.m3u8` principal chargé ✅
- Segments `.ts` chargés sans token ❌

**Après** : Récepteur personnalisé → Lecture normale
- Fichier `.m3u8` principal chargé ✅  
- Segments `.ts` chargés avec token ✅

## 🚀 Installation

### 1. Héberger le récepteur

Vous devez héberger le fichier `index.html` sur un serveur HTTPS accessible publiquement.

**Options d'hébergement :**

**A. GitHub Pages (Gratuit)**
```bash
# Créer un repo GitHub
git init
git add .
git commit -m "Récepteur Chromecast HLS"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/chromecast-hls-receiver.git
git push -u origin main

# Activer GitHub Pages dans les settings du repo
# URL finale: https://VOTRE_USERNAME.github.io/chromecast-hls-receiver/
```

**B. Netlify (Gratuit)**
1. Glissez-déposez le dossier sur [netlify.com](https://netlify.com)
2. URL automatique fournie (ex: `https://amazing-name-123456.netlify.app`)

**C. Votre propre serveur**
```bash
# Copier sur votre serveur HTTPS
scp index.html user@yourserver.com:/var/www/html/chromecast-receiver/
```

### 2. Enregistrer l'application Chromecast

1. Allez sur [Google Cast SDK Developer Console](https://cast.google.com/publish/)
2. Cliquez sur "Add New Application"
3. Choisissez "Custom Receiver"
4. Entrez l'URL de votre récepteur : `https://votre-domaine.com/index.html`
5. Notez l'**Application ID** généré (ex: `1234ABCD`)

### 3. Publier l'application

⚠️ **Important** : Pour tester immédiatement, ajoutez votre Chromecast comme "device de test" dans la console.

Pour une utilisation en production, soumettez l'application pour publication (processus de review de Google).

## 📱 Utilisation avec votre app

```typescript
import { Chromecast } from '@caprockapps/capacitor-chromecast';

// Initialiser avec votre App ID personnalisé
await Chromecast.initialize({ 
  appId: 'VOTRE_APP_ID_PERSONNALISE' 
});

// Demander une session
await Chromecast.requestSession();

// Charger un flux HLS sécurisé
await Chromecast.loadSecureHLS({
  contentId: 'https://example.com/stream.m3u8?token=your_auth_token',
  customAppId: 'VOTRE_APP_ID_PERSONNALISE',
  metadata: {
    title: 'Mon Stream Sécurisé',
    subtitle: 'Avec authentification'
  }
});
```

## 🔧 Comment ça fonctionne

### 1. **Interception des requêtes LOAD**
Le récepteur intercepte les requêtes de chargement de média et extrait le token d'authentification.

### 2. **Modification des requêtes réseau**
Toutes les requêtes vers les segments HLS (`.ts`, `.m4s`, `.m3u8`) sont automatiquement modifiées pour inclure le token.

### 3. **Support multi-formats**
- URLs avec tokens : `stream.m3u8?token=xxx`
- CustomData : `{ authToken: 'xxx' }`
- Extraction automatique des tokens

## 🐛 Debug et logs

Le récepteur affiche des informations de debug directement sur l'écran du Chromecast :

- **Info** (coin supérieur gauche) : État actuel
- **Debug** (coin inférieur gauche) : Logs détaillés des 5 dernières actions

### Messages de debug typiques :
```
📨 Requête LOAD reçue
🔑 Token d'authentification détecté  
🎥 Flux HLS détecté
🔗 Token ajouté à: segment001.ts
▶️ Lecture en cours
```

## 🛠️ Personnalisation

### Modifier l'authentification

Si votre serveur utilise une méthode d'authentification différente, modifiez cette section dans `index.html` :

```javascript
// Ligne ~200 - Personnaliser l'ajout du token
if (currentAuthToken && (url.includes('.ts') || url.includes('.m4s'))) {
  // Méthode 1: Token dans l'URL (actuel)
  const separator = url.includes('?') ? '&' : '?';
  url = `${url}${separator}token=${currentAuthToken}`;
  
  // Méthode 2: Token dans un header (alternative)
  // init.headers = init.headers || {};
  // init.headers['Authorization'] = `Bearer ${currentAuthToken}`;
}
```

### Ajouter des headers personnalisés

```javascript
// Intercepter fetch pour ajouter des headers
window.fetch = function(input, init = {}) {
  if (currentAuthToken && url.includes('.ts')) {
    init.headers = init.headers || {};
    init.headers['Authorization'] = `Bearer ${currentAuthToken}`;
    init.headers['X-Custom-Header'] = 'custom-value';
  }
  return originalFetch.call(this, input, init);
};
```

## ⚡ Test rapide

### 1. Test en local
```bash
# Servir le fichier localement (HTTPS requis pour Chromecast)
npx http-server -S -C cert.pem -K key.pem -p 8443

# Ou avec Python
python3 -m http.server 8443 --bind 0.0.0.0
```

### 2. Test avec ngrok (recommandé)
```bash
# Installer ngrok si pas déjà fait
npm install -g ngrok

# Servir en local
npx http-server -p 8080

# Dans un autre terminal, exposer avec HTTPS
ngrok http 8080

# Utiliser l'URL HTTPS fournie par ngrok
```

## 🔒 Sécurité

### Points importants :
1. **HTTPS obligatoire** : Chromecast exige HTTPS pour les récepteurs personnalisés
2. **CORS** : Assurez-vous que votre serveur HLS autorise les requêtes depuis le domaine du récepteur
3. **Tokens temporaires** : Utilisez des tokens avec expiration pour la sécurité
4. **Validation** : Le récepteur ne valide pas les tokens, il les transmet seulement

### Headers CORS recommandés :
```
Access-Control-Allow-Origin: https://votre-recepteur.com
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Allow-Headers: Authorization, Range
```

## 📞 Support

En cas de problème :

1. **Vérifiez les logs** : Console développeur sur https://votre-recepteur.com
2. **Testez l'URL** : Vérifiez que `https://example.com/segment.ts?token=xxx` fonctionne dans un navigateur
3. **Chromecast logs** : Utilisez l'outil de debug Chromecast
4. **Network inspection** : Vérifiez que les requêtes incluent bien les tokens

## 🎯 Prochaines étapes

Une fois que ça fonctionne :
1. **Optimiser** : Ajuster le cache et les timeouts
2. **Monitorer** : Ajouter des analytics
3. **Publier** : Soumettre l'app pour publication Google
4. **Sécuriser** : Implémenter une validation côté serveur 