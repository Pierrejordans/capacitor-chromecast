#!/usr/bin/env node

/**
 * Script de validation du récepteur Chromecast HLS sécurisé
 * Vérifie que tous les éléments nécessaires sont présents et corrects
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation du récepteur Chromecast HLS sécurisé...\n');

let errors = 0;
let warnings = 0;

function error(message) {
    console.log(`❌ ERREUR: ${message}`);
    errors++;
}

function warning(message) {
    console.log(`⚠️  ATTENTION: ${message}`);
    warnings++;
}

function success(message) {
    console.log(`✅ ${message}`);
}

// Vérifier que index.html existe
if (!fs.existsSync('index.html')) {
    error('Le fichier index.html est manquant');
} else {
    success('Fichier index.html trouvé');
    
    // Lire et analyser le contenu
    const content = fs.readFileSync('index.html', 'utf8');
    
    // Vérifications du contenu
    const checks = [
        {
            pattern: /cast\.framework\.CastReceiverContext/,
            message: 'Google Cast Framework importé',
            required: true
        },
        {
            pattern: /setMessageInterceptor/,
            message: 'Intercepteur de messages configuré',
            required: true
        },
        {
            pattern: /XMLHttpRequest/,
            message: 'Interception XMLHttpRequest implémentée',
            required: true
        },
        {
            pattern: /window\.fetch/,
            message: 'Interception fetch implémentée',
            required: true
        },
        {
            pattern: /authToken/,
            message: 'Gestion des tokens d\'authentification',
            required: true
        },
        {
            pattern: /\.m3u8/,
            message: 'Support des fichiers HLS (.m3u8)',
            required: true
        },
        {
            pattern: /\.ts.*token/,
            message: 'Ajout de tokens aux segments TS',
            required: true
        },
        {
            pattern: /https:\/\/www\.gstatic\.com\/cast\/sdk/,
            message: 'Google Cast SDK chargé depuis CDN',
            required: true
        }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(content)) {
            success(check.message);
        } else {
            if (check.required) {
                error(check.message + ' - MANQUANT');
            } else {
                warning(check.message + ' - recommandé');
            }
        }
    });
    
    // Vérifier la taille du fichier (ne doit pas être trop volumineux)
    const stats = fs.statSync('index.html');
    const sizeKB = Math.round(stats.size / 1024);
    
    if (sizeKB > 100) {
        warning(`Fichier assez volumineux: ${sizeKB}KB (recommandé < 100KB)`);
    } else {
        success(`Taille du fichier acceptable: ${sizeKB}KB`);
    }
    
    // Vérifier les éléments HTML essentiels
    const htmlChecks = [
        { pattern: /<meta.*viewport/, message: 'Meta viewport configuré' },
        { pattern: /<title>/, message: 'Titre de la page défini' },
        { pattern: /charset="?UTF-8"?/, message: 'Encodage UTF-8 défini' },
        { pattern: /#player/, message: 'Élément player présent' },
        { pattern: /#debug/, message: 'Interface de debug présente' }
    ];
    
    htmlChecks.forEach(check => {
        if (check.pattern.test(content)) {
            success(check.message);
        } else {
            warning(check.message + ' - recommandé');
        }
    });
}

// Vérifier les autres fichiers
const files = [
    { name: 'README.md', required: false, message: 'Documentation présente' },
    { name: 'test.html', required: false, message: 'Page de test disponible' },
    { name: 'package.json', required: false, message: 'Configuration npm présente' }
];

files.forEach(file => {
    if (fs.existsSync(file.name)) {
        success(file.message);
    } else {
        if (file.required) {
            error(`${file.name} manquant`);
        } else {
            warning(`${file.name} recommandé mais absent`);
        }
    }
});

// Vérifications spécifiques au déploiement
console.log('\n📋 Checklist de déploiement:');

const deploymentChecks = [
    '1. Héberger le fichier sur un serveur HTTPS',
    '2. Enregistrer l\'application sur Google Cast Developer Console',
    '3. Configurer l\'App ID dans votre application mobile',
    '4. Tester avec un appareil Chromecast réel',
    '5. Ajouter votre Chromecast comme device de test',
    '6. Vérifier les logs dans la console du récepteur'
];

deploymentChecks.forEach(check => {
    console.log(`📝 ${check}`);
});

// Résumé
console.log('\n' + '='.repeat(50));

if (errors === 0 && warnings === 0) {
    console.log('🎉 PARFAIT! Le récepteur est prêt pour le déploiement.');
} else if (errors === 0) {
    console.log(`✅ Le récepteur est fonctionnel avec ${warnings} suggestion(s) d'amélioration.`);
} else {
    console.log(`❌ Le récepteur a ${errors} erreur(s) et ${warnings} avertissement(s) à corriger.`);
}

console.log('\n🚀 Commandes de démarrage rapide:');
console.log('  npm start          # Servir en local (HTTP)');
console.log('  npm run start:https # Servir en local (HTTPS)');
console.log('  npm run tunnel     # Créer un tunnel public avec ngrok');
console.log('  npm test           # Ouvrir la page de test');

process.exit(errors > 0 ? 1 : 0); 