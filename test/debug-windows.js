const UndetectedChrome = require('../index');
const Utils = require('../lib/utils');

async function debugWindows() {
  console.log('🐛 Debug Windows - Détection de Chrome');
  console.log('=====================================\n');
  
  try {
    console.log('1. Test de détection Chrome synchrone...');
    try {
      const chromePath = Utils.getChromePath();
      console.log(`✅ Chrome trouvé (sync): ${chromePath}`);
    } catch (error) {
      console.log(`❌ Chrome non trouvé (sync): ${error.message}`);
    }
    
    console.log('\n2. Test de détection Chrome asynchrone...');
    try {
      const chromePath = await Utils.getChromePathAsync();
      console.log(`✅ Chrome trouvé (async): ${chromePath}`);
    } catch (error) {
      console.log(`❌ Chrome non trouvé (async): ${error.message}`);
    }
    
    console.log('\n3. Test du registre Windows...');
    try {
      const registryPath = await Utils.getChromeFromRegistry();
      if (registryPath) {
        console.log(`✅ Chrome dans le registre: ${registryPath}`);
      } else {
        console.log(`❌ Chrome non trouvé dans le registre`);
      }
    } catch (error) {
      console.log(`❌ Erreur registre: ${error.message}`);
    }
    
    console.log('\n4. Test de création du driver...');
    try {
      // Spécifier un chemin Chrome manuellement si trouvé
      let options = {};
      try {
        options.chromePath = await Utils.getChromePathAsync();
        console.log(`🔧 Utilisation de Chrome: ${options.chromePath}`);
      } catch (e) {
        console.log(`⚠️  Pas de Chrome auto-détecté, test avec chemins par défaut`);
      }
      
      const undetectedChrome = new UndetectedChrome(options);
      console.log('⏳ Création du driver...');
      
      await undetectedChrome.build();
      console.log('✅ Driver créé avec succès!');
      
      console.log('⏳ Test de navigation...');
      await undetectedChrome.get('https://httpbin.org/user-agent');
      
      console.log('⏳ Fermeture...');
      await undetectedChrome.quit();
      
      console.log('🎉 Test complet réussi!');
      
    } catch (error) {
      console.log(`❌ Erreur driver: ${error.message}`);
      console.log('Stack trace:', error.stack);
    }
    
  } catch (error) {
    console.log(`❌ Erreur générale: ${error.message}`);
  }
}

if (require.main === module) {
  debugWindows().catch(console.error);
}

module.exports = { debugWindows };