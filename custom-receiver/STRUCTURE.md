# 📁 Structure du Récepteur Chromecast

```
custom-receiver/
│
├── 🎬 index.html              # Récepteur principal (À DÉPLOYER)
│   ├── Interface utilisateur avec debug visuel
│   ├── Interception des requêtes LOAD
│   ├── Extraction des tokens d'authentification
│   ├── Modification des requêtes XMLHttpRequest/fetch
│   └── Gestion des segments HLS (.ts, .m4s)
│
├── 🧪 test.html               # Page de test interactive
│   ├── Interface graphique pour tester le récepteur
│   ├── URLs de test prédéfinies
│   ├── Logs en temps réel
│   └── Simulation de casting
│
├── 📖 README.md               # Documentation complète
│   ├── Explication du problème HLS sécurisé
│   ├── Instructions d'installation détaillées
│   ├── Guide de personnalisation
│   └── Dépannage et support
│
├── 🚀 QUICK_START.md          # Guide de démarrage express
│   ├── Test en 5 minutes
│   ├── Commandes essentielles
│   └── Problèmes fréquents
│
├── 📋 STRUCTURE.md            # Ce fichier
│
├── ⚙️ package.json            # Configuration npm
│   ├── Scripts de développement
│   ├── Dépendances pour le test
│   └── Métadonnées du projet
│
├── ✅ validate.js             # Script de validation
│   ├── Vérifications automatiques
│   ├── Checklist de déploiement
│   └── Diagnostics de qualité
│
└── 🙈 .gitignore             # Fichiers à ignorer par Git
```

## 🎯 Fichiers principaux

### `index.html` - Le récepteur
**Rôle** : Application Chromecast qui résout le problème d'authentification HLS
**Déployer** : ✅ OUI - Doit être accessible en HTTPS public
**Fonctionnalités** :
- 🔑 Extraction des tokens depuis customData et URLs
- 🔧 Interception des requêtes réseau (XMLHttpRequest + fetch)
- 🔗 Ajout automatique des tokens aux segments HLS
- 📺 Interface de debug visuelle sur l'écran TV
- 🎮 Gestion des états de lecture (playing, buffering, etc.)

### `test.html` - Interface de test
**Rôle** : Tester le récepteur depuis un navigateur
**Déployer** : ❌ Optionnel - Utile pour le développement
**Fonctionnalités** :
- 🎯 Interface graphique pour tester différentes URLs
- 📝 Logs en temps réel des requêtes Cast
- 🔗 URLs de test prédéfinies
- ⚙️ Contrôles de session (start/stop)

## 🔧 Fichiers de configuration

### `package.json` - Outils de développement
**Scripts disponibles** :
```bash
npm start          # Serveur local HTTP
npm run start:https # Serveur local HTTPS
npm run tunnel     # Tunnel public avec ngrok
npm test           # Ouvre la page de test
npm run validate   # Valide le récepteur
```

### `validate.js` - Assurance qualité
**Vérifications automatiques** :
- ✅ Présence des fonctionnalités critiques
- ✅ Taille du fichier raisonnable
- ✅ Structure HTML correcte
- ✅ Imports des librairies requises

## 📦 Workflow de développement

### 1. Développement local
```bash
cd custom-receiver
npm start           # Servir en local
npm test            # Tester l'interface
npm run validate    # Vérifier la qualité
```

### 2. Test avec Chromecast réel
```bash
npm run tunnel      # Créer tunnel HTTPS public
# Utiliser l'URL ngrok pour enregistrer l'app Chromecast
```

### 3. Déploiement
```bash
# Option A: GitHub Pages
git add . && git commit -m "Deploy" && git push

# Option B: Netlify
npm run deploy:netlify

# Option C: Serveur personnel
scp index.html user@server:/var/www/html/
```

## 🛠️ Personnalisation

### Modifier l'authentification
**Fichier** : `index.html` (lignes ~200-250)
**Cas d'usage** :
- Headers Authorization au lieu de tokens URL
- Méthodes d'authentification personnalisées
- Algorithmes de signature spécifiques

### Ajouter des fonctionnalités
**Exemples** :
- Analytics de viewing
- Contrôles parentaux
- Sous-titres personnalisés
- Interface utilisateur améliorée

### Debug avancé
**Options** :
- Logs détaillés dans la console
- Envoi de métriques vers votre serveur
- Interface de debug enrichie
- Monitoring des performances

## 📋 Checklist de mise en production

- [ ] `index.html` testé et validé
- [ ] Récepteur hébergé en HTTPS
- [ ] App ID Chromecast enregistrée
- [ ] Tests avec Chromecast réel
- [ ] CORS configuré sur serveur HLS
- [ ] Documentation mise à jour
- [ ] Sauvegarde de configuration

## 🔗 Liens utiles

- [Google Cast Developer Console](https://cast.google.com/publish/)
- [Documentation Cast SDK](https://developers.google.com/cast/)
- [GitHub Pages](https://pages.github.com/)
- [Netlify](https://netlify.com/)
- [ngrok](https://ngrok.com/) 