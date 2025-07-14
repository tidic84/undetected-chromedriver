const UndetectedChrome = require('./index');

async function basicExample() {
  console.log('🚀 Exemple basique - Test de navigation');
  
  const undetectedChrome = new UndetectedChrome({
    headless: false, // Visible pour voir le résultat
    windowSize: { width: 1280, height: 720 }
  });

  try {
    console.log('Création du driver...');
    const driver = await undetectedChrome.build();
    
    console.log('Navigation vers httpbin.org...');
    await driver.get('https://httpbin.org/user-agent');
    
    // Attendre le chargement
    await driver.sleep(2000);
    
    const title = await driver.getTitle();
    console.log(`✓ Titre de la page: ${title}`);
    
    // Maintenir le navigateur ouvert pour inspection
    console.log('Navigateur ouvert pour 5 secondes...');
    await driver.sleep(5000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await undetectedChrome.quit();
    console.log('✓ Navigateur fermé');
  }
}

async function cloudflareExample() {
  console.log('🛡️  Exemple Cloudflare - Test anti-bot');
  
  const undetectedChrome = new UndetectedChrome({
    headless: false,
    arguments: [
      '--disable-notifications',
      '--disable-popup-blocking'
    ]
  });

  try {
    console.log('Création du driver anti-détection...');
    const driver = await undetectedChrome.build();
    
    console.log('Test avec nowsecure.nl...');
    await driver.get('https://nowsecure.nl/');
    
    // Attendre le traitement Cloudflare
    console.log('Attente du bypass Cloudflare...');
    await driver.sleep(8000);
    
    const title = await driver.getTitle();
    console.log(`✓ Page chargée: ${title}`);
    
    // Vérifier si on a réussi
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('You are now successfully')) {
      console.log('🎉 Bypass réussi !');
    } else {
      console.log('⚠️  Résultat à vérifier manuellement');
    }
    
    console.log('Inspection manuelle - 10 secondes...');
    await driver.sleep(10000);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await undetectedChrome.quit();
    console.log('✓ Test terminé');
  }
}

async function scrapingExample() {
  console.log('📊 Exemple scraping - Extraction de données');
  
  const undetectedChrome = new UndetectedChrome({
    headless: true, // Mode silencieux pour le scraping
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  });

  try {
    console.log('Démarrage du scraping...');
    const driver = await undetectedChrome.build();
    
    // Exemple avec Quotes to Scrape
    await driver.get('http://quotes.toscrape.com/');
    
    console.log('Extraction des citations...');
    const quotes = await driver.findElements({ css: '.quote' });
    
    console.log(`Trouvé ${quotes.length} citations:`);
    
    for (let i = 0; i < Math.min(3, quotes.length); i++) {
      const quote = quotes[i];
      const text = await quote.findElement({ css: '.text' }).getText();
      const author = await quote.findElement({ css: '.author' }).getText();
      
      console.log(`${i + 1}. "${text}" - ${author}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de scraping:', error.message);
  } finally {
    await undetectedChrome.quit();
    console.log('✓ Scraping terminé');
  }
}

async function runAllExamples() {
  console.log('🎬 Lancement de tous les exemples\n');
  
  try {
    await basicExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await cloudflareExample();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await scrapingExample();
    
    console.log('\n🎊 Tous les exemples terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    process.exit(1);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--basic')) {
  basicExample().catch(console.error);
} else if (args.includes('--cloudflare')) {
  cloudflareExample().catch(console.error);
} else if (args.includes('--scraping')) {
  scrapingExample().catch(console.error);
} else {
  console.log('Usage:');
  console.log('  node example.js --basic      # Exemple basique');
  console.log('  node example.js --cloudflare # Test anti-bot');
  console.log('  node example.js --scraping   # Exemple scraping');
  console.log('  node example.js              # Tous les exemples');
  console.log('');
  runAllExamples().catch(console.error);
}