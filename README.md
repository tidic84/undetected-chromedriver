# undetected-chromedriver-js

A Node.js wrapper for undetected-chromedriver with automatic setup and cross-platform support.

## 🚀 Installation

```bash
npm install undetected-chromedriver-js
```

The installation script will automatically configure the Python environment. The executable will be generated on first use.

### Manual installation (if issues occur)

```bash
# Minimal installation
npm run setup:minimal

# Full installation (generates executable immediately)  
npm run setup
```

## 📋 Prerequisites

- **Node.js** 14.0.0 or higher
- **Python** 3.7 or higher  
- **Google Chrome** installed on the system
  - 📥 Download: https://www.google.com/chrome/

## ⚡ Quick Usage

```javascript
const UndetectedChrome = require('undetected-chromedriver-js');

async function example() {
  // Simple creation
  const undetectedChrome = new UndetectedChrome();
  const driver = await undetectedChrome.build();

  // Navigation
  await driver.get('https://nowsecure.nl/');
  
  // Your scraping code here
  const title = await driver.getTitle();
  console.log('Title:', title);

  // Close
  await undetectedChrome.quit();
}

example().catch(console.error);
```

## 🛠️ Advanced Configuration

### Available options

```javascript
const undetectedChrome = new UndetectedChrome({
  headless: false,                    // Headless mode
  userAgent: 'custom-user-agent',     // Custom user agent
  windowSize: { width: 1920, height: 1080 }, // Window size
  chromePath: '/path/to/chrome',      // Custom Chrome path
  driverPath: '/path/to/driver',      // Custom driver path
  arguments: ['--custom-arg']         // Custom Chrome arguments
});
```

### Complete example

```javascript
const UndetectedChrome = require('undetected-chromedriver-js');

async function advancedExample() {
  const undetectedChrome = new UndetectedChrome({
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebDriver/537.36',
    windowSize: { width: 1366, height: 768 },
    arguments: [
      '--disable-notifications',
      '--disable-popup-blocking'
    ]
  });

  try {
    const driver = await undetectedChrome.build();
    
    // Scraping a protected site
    await driver.get('https://example.com');
    
    // Wait for loading
    await driver.sleep(2000);
    
    // Extract data
    const elements = await driver.findElements({ css: '.data-item' });
    for (const element of elements) {
      const text = await element.getText();
      console.log('Data:', text);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await undetectedChrome.quit();
  }
}

advancedExample();
```

## 🔧 Available Methods

### UndetectedChrome Class

#### `constructor(options)`
Creates a new instance with specified options.

#### `async build()`
Builds and configures the Chrome driver.

#### `async get(url)`
Navigates to the specified URL. Automatically builds the driver if needed.

#### `async quit()`
Closes the browser and releases resources.

#### `getDriver()`
Returns the Selenium driver instance for advanced control.

#### `static async create(options)`
Static method to create and build an instance in one step.

```javascript
// Static method
const undetectedChrome = await UndetectedChrome.create({ headless: true });
const driver = undetectedChrome.getDriver();
```

## 🧪 Testing

```bash
# Basic tests
npm test

# Manual configuration (if automatic installation fails)
npm run setup
```

## 🌍 Cross-Platform Support

The module automatically detects the operating system and configures appropriate paths:

- **Windows**: `AppData/Roaming/undetected_chromedriver/`
- **macOS**: `~/Library/Application Support/undetected_chromedriver/`
- **Linux**: `~/.local/share/undetected_chromedriver/`

### ✅ Tested Operating Systems

This module has been successfully tested on:

- **🪟 Windows 11** - Full support with automatic Chrome detection
- **🐧 Ubuntu 22.04+** - With python3-venv package
- **🏔️ Arch Linux** - With Python virtual environment support

## 🔍 Troubleshooting

### Error "Python not found"
```bash
# Check Python installation
python --version  # Windows
python3 --version # Linux/macOS

# Install Python and required packages
sudo apt install python3 python3-pip python3-venv  # Ubuntu/Debian
# or download from https://python.org
```

### Error "Could not create virtual environment" (Ubuntu/Debian)
```bash
# Install missing venv module
sudo apt install python3-venv

# Or if that fails, install virtualenv
pip3 install --user virtualenv
```

### Error "Undetected ChromeDriver not found"
```bash
# Re-run configuration
npm run setup
```

### Error "Chrome browser not found"
```bash
# Install Google Chrome from:
# https://www.google.com/chrome/

# Or specify path manually:
const chrome = new UndetectedChrome({
  chromePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
});
```

### Windows Issues (permissions/Unicode)
```bash
# Special Windows cleanup
npm run clean:windows

# Then reinstall
npm run setup
```

## 📚 Usage Examples

### Bypass Cloudflare
```javascript
const UndetectedChrome = require('undetected-chromedriver-js');

async function bypassCloudflare() {
  const undetectedChrome = new UndetectedChrome({ headless: false });
  const driver = await undetectedChrome.build();
  
  await driver.get('https://site-with-cloudflare.com');
  
  // Wait for Cloudflare bypass
  await driver.sleep(5000);
  
  // Continue scraping
  const content = await driver.getPageSource();
  console.log('Content retrieved:', content.length, 'characters');
  
  await undetectedChrome.quit();
}
```

### Scraping with Authentication
```javascript
async function scrapingWithAuth() {
  const undetectedChrome = new UndetectedChrome();
  const driver = await undetectedChrome.build();
  
  // Login page
  await driver.get('https://example.com/login');
  
  // Fill form
  await driver.findElement({ name: 'username' }).sendKeys('user');
  await driver.findElement({ name: 'password' }).sendKeys('pass');
  await driver.findElement({ css: 'button[type="submit"]' }).click();
  
  // Wait for redirect
  await driver.sleep(3000);
  
  // Scrape protected page
  await driver.get('https://example.com/protected');
  const data = await driver.findElement({ css: '.protected-data' }).getText();
  
  console.log('Protected data:', data);
  await undetectedChrome.quit();
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This module is intended for educational and testing purposes only. Please respect website terms of service and local laws regarding web scraping.

## 🔗 Useful Links

- [Selenium WebDriver Documentation](https://selenium-webdriver.readthedocs.io/)
- [Undetected ChromeDriver (Python)](https://github.com/ultrafunkamsterdam/undetected-chromedriver)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

---

Built with ❤️ for the Node.js community