# 🚀 Démarrage Rapide - Récepteur HLS Sécurisé

## ⚡ Test en 5 minutes

### 1. Tester localement
```bash
cd custom-receiver
npm start
# Ouvre http://localhost:8080 dans votre navigateur
```

### 2. Créer un tunnel public (pour tester avec Chromecast)
```bash
# Dans un autre terminal
npm run tunnel
# Notez l'URL HTTPS fournie par ngrok (ex: https://abc123.ngrok.io)
```

### 3. Enregistrer l'application Chromecast
1. Allez sur [Google Cast Developer Console](https://cast.google.com/publish/)
2. **Add New Application** → **Custom Receiver**
3. URL du récepteur : `https://abc123.ngrok.io/index.html`
4. Notez l'**App ID** généré (ex: `1234ABCD`)

### 4. Tester avec votre app
```typescript
// Dans votre app Capacitor
await Chromecast.loadSecureHLS({
  contentId: 'https://votre-serveur.com/stream.m3u8?token=xxx',
  customAppId: '1234ABCD' // Votre App ID
});
```

## 🔧 Debug

### Voir les logs du récepteur
1. Ouvrez `https://abc123.ngrok.io/index.html` dans Chrome
2. Ouvrez les DevTools (F12)
3. Castez depuis votre app
4. Regardez les logs dans la console

### Page de test
```bash
npm test
# Ouvre la page de test avec interface graphique
```

## 📦 Déploiement permanent

### GitHub Pages (Gratuit)
```bash
git init
git add .
git commit -m "Récepteur Chromecast"
git remote add origin https://github.com/VOTRE_USER/chromecast-receiver.git
git push -u origin main

# Activez GitHub Pages dans Settings → Pages
# URL finale: https://VOTRE_USER.github.io/chromecast-receiver/
```

### Netlify (Gratuit)
```bash
npm run deploy:netlify
# Ou glissez-déposez le dossier sur netlify.com
```

## ⚠️ Points importants

1. **HTTPS obligatoire** : Chromecast exige HTTPS
2. **Device de test** : Ajoutez votre Chromecast dans la Console Google Cast
3. **CORS** : Votre serveur HLS doit autoriser les requêtes depuis le domaine du récepteur
4. **Logs** : Surveillez les logs sur l'écran du Chromecast

## 🆘 Problèmes fréquents

**"Receiver not found"**
→ Vérifiez que l'App ID est correct et que le récepteur est accessible en HTTPS

**"Failed to load media"**  
→ Vérifiez les logs du récepteur et l'accessibilité de votre URL HLS

**"Loading forever"**
→ Le token n'est probablement pas transmis correctement aux segments

**Need more help?**
→ Consultez le README.md complet pour plus de détails 