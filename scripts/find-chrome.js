const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 Recherche de Chrome sur Windows...\n');

console.log('📁 Informations système:');
console.log(`- Plateforme: ${os.platform()}`);
console.log(`- Architecture: ${os.arch()}`);
console.log(`- Répertoire utilisateur: ${os.homedir()}\n`);

const possiblePaths = [
  // Chemins standards
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  
  // Répertoire utilisateur - différentes méthodes
  path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe'),
  path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'),
  os.homedir() + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  
  // Autres emplacements possibles
  'C:\\Users\\' + os.userInfo().username + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
  
  // Format Unix sur Windows
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
];

console.log('🔎 Chemins testés:');
let found = false;

possiblePaths.forEach((chromePath, index) => {
  const exists = fs.existsSync(chromePath);
  const status = exists ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${chromePath}`);
  
  if (exists && !found) {
    console.log(`\n🎉 Chrome trouvé: ${chromePath}`);
    found = true;
    
    // Vérifier les infos du fichier
    try {
      const stats = fs.statSync(chromePath);
      console.log(`   - Taille: ${Math.round(stats.size / 1024 / 1024)} MB`);
      console.log(`   - Modifié: ${stats.mtime.toLocaleDateString()}`);
    } catch (error) {
      console.log(`   - Erreur lecture stats: ${error.message}`);
    }
  }
});

if (!found) {
  console.log('\n❌ Aucune installation de Chrome trouvée!');
  console.log('\n💡 Solutions:');
  console.log('1. Installer Google Chrome depuis https://www.google.com/chrome/');
  console.log('2. Ou spécifier le chemin manuellement avec chromePath option');
  console.log('3. Vérifier que Chrome est installé pour tous les utilisateurs');
}

// Test avec Registry Windows si disponible
if (os.platform() === 'win32') {
  console.log('\n🔍 Test du registre Windows...');
  try {
    const { spawn } = require('child_process');
    
    const child = spawn('reg', ['query', 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe', '/ve'], {
      shell: true
    });
    
    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0 && output.includes('REG_SZ')) {
        const match = output.match(/REG_SZ\s+(.+)/);
        if (match) {
          const registryPath = match[1].trim();
          console.log(`✅ Trouvé dans le registre: ${registryPath}`);
          console.log(`   Existe: ${fs.existsSync(registryPath) ? 'Oui' : 'Non'}`);
        }
      } else {
        console.log('❌ Chrome non trouvé dans le registre');
      }
    });
    
  } catch (error) {
    console.log(`❌ Erreur registre: ${error.message}`);
  }
}