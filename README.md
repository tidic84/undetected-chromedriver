# undetected-chromedriver-js

Un wrapper Node.js pour undetected-chromedriver avec configuration automatique et support multi-plateforme.

## 🚀 Installation

```bash
npm install undetected-chromedriver-js
```

Le script d'installation configurera automatiquement l'environnement Python. L'exécutable sera généré lors de la première utilisation.

### Installation manuelle (si problèmes)

```bash
# Installation minimal
npm run setup:minimal

# Installation complète (génère l'exécutable immédiatement)  
npm run setup
```

## 📋 Prérequis

- **Node.js** 14.0.0 ou supérieur
- **Python** 3.7 ou supérieur  
- **Google Chrome** installé sur le système
  - 📥 Télécharger : https://www.google.com/chrome/

## ⚡ Usage Rapide

```javascript
const UndetectedChrome = require('undetected-chromedriver-js');

async function example() {
  // Création simple
  const undetectedChrome = new UndetectedChrome();
  const driver = await undetectedChrome.build();

  // Navigation
  await driver.get('https://nowsecure.nl/');
  
  // Votre code de scraping ici
  const title = await driver.getTitle();
  console.log('Titre:', title);

  // Fermeture
  await undetectedChrome.quit();
}

example().catch(console.error);
```

## 🛠️ Configuration Avancée

### Options disponibles

```javascript
const undetectedChrome = new UndetectedChrome({
  headless: false,                    // Mode headless
  userAgent: 'custom-user-agent',     // User agent personnalisé
  windowSize: { width: 1920, height: 1080 }, // Taille de fenêtre
  chromePath: '/path/to/chrome',      // Chemin Chrome personnalisé
  driverPath: '/path/to/driver',      // Chemin driver personnalisé
  arguments: ['--custom-arg']         // Arguments Chrome personnalisés
});
```

### Exemple complet

```javascript
const UndetectedChrome = require('undetected-chromedriver-js');

async function advancedExample() {
  const undetectedChrome = new UndetectedChrome({
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    windowSize: { width: 1366, height: 768 },
    arguments: [
      '--disable-notifications',
      '--disable-popup-blocking'
    ]
  });

  try {
    const driver = await undetectedChrome.build();
    
    // Scraping d'un site protégé
    await driver.get('https://example.com');
    
    // Attendre le chargement
    await driver.sleep(2000);
    
    // Extraire des données
    const elements = await driver.findElements({ css: '.data-item' });
    for (const element of elements) {
      const text = await element.getText();
      console.log('Données:', text);
    }

  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await undetectedChrome.quit();
  }
}

advancedExample();
```

## 🔧 Méthodes disponibles

### Classe UndetectedChrome

#### `constructor(options)`
Crée une nouvelle instance avec les options spécifiées.

#### `async build()`
Construit et configure le driver Chrome.

#### `async get(url)`
Navigue vers l'URL spécifiée. Construit automatiquement le driver si nécessaire.

#### `async quit()`
Ferme le navigateur et libère les ressources.

#### `getDriver()`
Retourne l'instance du driver Selenium pour un contrôle avancé.

#### `static async create(options)`
Méthode statique pour créer et construire une instance en une étape.

```javascript
// Méthode statique
const undetectedChrome = await UndetectedChrome.create({ headless: true });
const driver = undetectedChrome.getDriver();
```

## 🧪 Tests

```bash
# Tests basiques
npm test

# Configuration manuelle (si l'installation automatique échoue)
npm run setup
```

## 🌍 Support Multi-Plateforme

Le module détecte automatiquement le système d'exploitation et configure les chemins appropriés :

- **Windows** : `AppData/Roaming/undetected_chromedriver/`
- **macOS** : `~/Library/Application Support/undetected_chromedriver/`
- **Linux** : `~/.local/share/undetected_chromedriver/`

## 🔍 Dépannage

### Erreur "Chrome not found"
```bash
# Vérifiez l'installation de Chrome
google-chrome --version  # Linux
# ou
"C:/Program Files/Google/Chrome/Application/chrome.exe" --version  # Windows
```

### Erreur "Python not found"
```bash
# Installez Python
sudo apt install python3 python3-pip  # Ubuntu/Debian
# ou téléchargez depuis https://python.org
```

### Erreur "Undetected ChromeDriver not found"
```bash
# Relancez la configuration
npm run setup
```

### Erreur "Chrome browser not found"
```bash
# Installer Google Chrome depuis:
# https://www.google.com/chrome/

# Ou spécifier le chemin manuellement:
const chrome = new UndetectedChrome({
  chromePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});
```

### Problèmes Windows (permissions/Unicode)
```bash
# Nettoyage spécial Windows
npm run clean:windows

# Puis réinstaller
npm run setup
```

## 📚 Exemples d'Usage

### Bypass Cloudflare
```javascript
const UndetectedChrome = require('undetected-chromedriver-js');

async function bypassCloudflare() {
  const undetectedChrome = new UndetectedChrome({ headless: false });
  const driver = await undetectedChrome.build();
  
  await driver.get('https://site-with-cloudflare.com');
  
  // Attendre le bypass Cloudflare
  await driver.sleep(5000);
  
  // Continuer le scraping
  const content = await driver.getPageSource();
  console.log('Contenu récupéré:', content.length, 'caractères');
  
  await undetectedChrome.quit();
}
```

### Scraping avec authentification
```javascript
async function scrapingWithAuth() {
  const undetectedChrome = new UndetectedChrome();
  const driver = await undetectedChrome.build();
  
  // Page de connexion
  await driver.get('https://example.com/login');
  
  // Remplir le formulaire
  await driver.findElement({ name: 'username' }).sendKeys('user');
  await driver.findElement({ name: 'password' }).sendKeys('pass');
  await driver.findElement({ css: 'button[type="submit"]' }).click();
  
  // Attendre la redirection
  await driver.sleep(3000);
  
  // Scraping de la page protégée
  await driver.get('https://example.com/protected');
  const data = await driver.findElement({ css: '.protected-data' }).getText();
  
  console.log('Données protégées:', data);
  await undetectedChrome.quit();
}
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## ⚠️ Avertissement

Ce module est destiné à des fins éducatives et de test uniquement. Respectez les conditions d'utilisation des sites web et les lois locales concernant le web scraping.

## 🔗 Liens Utiles

- [Selenium WebDriver Documentation](https://selenium-webdriver.readthedocs.io/)
- [Undetected ChromeDriver (Python)](https://github.com/ultrafunkamsterdam/undetected-chromedriver)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

---

Développé avec ❤️ pour la communauté Node.js