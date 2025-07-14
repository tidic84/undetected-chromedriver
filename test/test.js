const UndetectedChrome = require('../index');

async function basicTest() {
  console.log('🧪 Running basic test...');
  
  let driver;
  try {
    // Create undetected Chrome instance
    const undetectedChrome = new UndetectedChrome({
      headless: true // Run in headless mode for testing
    });
    
    driver = await undetectedChrome.build();
    console.log('✓ Driver created successfully');

    // Test navigation
    await driver.get('https://httpbin.org/user-agent');
    console.log('✓ Navigation successful');

    // Get page title
    const title = await driver.getTitle();
    console.log(`✓ Page title: ${title}`);

    // Get page source to verify user agent
    const pageSource = await driver.getPageSource();
    console.log('✓ Page source retrieved');

    // Clean up
    await undetectedChrome.quit();
    console.log('✓ Driver closed successfully');
    
    console.log('🎉 Basic test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (driver) {
      try {
        await driver.quit();
      } catch (closeError) {
        console.error('Error closing driver:', closeError.message);
      }
    }
    process.exit(1);
  }
}

async function antiDetectionTest() {
  console.log('🕵️  Running anti-detection test...');
  
  let undetectedChrome;
  try {
    // Create instance for testing detection
    undetectedChrome = new UndetectedChrome({
      headless: false // Show browser for visual verification
    });
    
    await undetectedChrome.build();
    console.log('✓ Driver created for anti-detection test');

    // Test against a site that checks for automation
    await undetectedChrome.get('https://nowsecure.nl/');
    console.log('✓ Navigated to nowsecure.nl');

    // Wait a moment for page to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    const driver = undetectedChrome.getDriver();
    const pageTitle = await driver.getTitle();
    console.log(`✓ Page loaded: ${pageTitle}`);

    // Check if we passed the detection
    const pageSource = await driver.getPageSource();
    if (pageSource.includes('blocked') || pageSource.includes('Access Denied')) {
      console.log('⚠️  May have been detected - check browser window');
    } else {
      console.log('✓ Successfully bypassed detection');
    }

    // Keep browser open for 5 seconds for manual verification
    console.log('Browser will close in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    await undetectedChrome.quit();
    console.log('✓ Anti-detection test completed');

  } catch (error) {
    console.error('❌ Anti-detection test failed:', error.message);
    if (undetectedChrome) {
      try {
        await undetectedChrome.quit();
      } catch (closeError) {
        console.error('Error closing driver:', closeError.message);
      }
    }
    process.exit(1);
  }
}

async function runTests() {
  console.log('🚀 Starting undetected-chromedriver-js tests\n');
  
  await basicTest();
  console.log('');
  await antiDetectionTest();
  
  console.log('\n🎊 All tests completed successfully!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { basicTest, antiDetectionTest, runTests };