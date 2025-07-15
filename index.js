const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const Utils = require('./lib/utils');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

class UndetectedChrome {
  constructor(options = {}) {
    this.options = {
      headless: options.headless || false,
      userAgent: options.userAgent || Utils.createUserAgent(),
      windowSize: options.windowSize || { width: 1920, height: 1080 },
      chromePath: options.chromePath || null,
      driverPath: options.driverPath || null,
      arguments: options.arguments || [],
      ...options
    };
    
    this.driver = null;
    this.userDataDir = null;
  }

  async generateExecutableIfNeeded() {
    try {
      // Check if we already have a driver path
      const pathFile = path.join(__dirname, 'chromedriver_path.txt');
      if (fs.existsSync(pathFile)) {
        const savedPath = fs.readFileSync(pathFile, 'utf8').trim();
        if (fs.existsSync(savedPath)) {
          return savedPath;
        }
      }

      console.log('Generating undetected ChromeDriver executable...');
      
      // Create simple Python script to generate executable
      const platform = os.platform();
      const venvPythonCmd = platform === 'win32' ? 
        path.join(__dirname, '.venv', 'Scripts', 'python') : 
        path.join(__dirname, '.venv', 'bin', 'python');
        
      const pythonScript = path.join(__dirname, 'generate_temp.py');
      
      const pythonCode = `
import undetected_chromedriver as uc
from multiprocessing import freeze_support
import os

if __name__ == '__main__':
    freeze_support()
    try:
        driver = uc.Chrome(headless=True, use_subprocess=False)
        executable_path = driver.service.path
        driver.quit()
        
        with open('chromedriver_path.txt', 'w', encoding='utf-8') as f:
            f.write(executable_path)
        print(f"Executable at: {executable_path}")
    except Exception as e:
        print(f"Error: {e}")
        exit(1)
`;

      fs.writeFileSync(pythonScript, pythonCode);
      
      return new Promise((resolve, reject) => {
        const child = spawn(venvPythonCmd, [pythonScript], {
          cwd: __dirname,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
        });
        
        child.on('close', (code) => {
          fs.unlinkSync(pythonScript);
          
          if (code === 0) {
            const savedPath = fs.readFileSync(pathFile, 'utf8').trim();
            resolve(savedPath);
          } else {
            reject(new Error('Failed to generate executable'));
          }
        });
      });
      
    } catch (error) {
      throw new Error(`Failed to generate executable: ${error.message}`);
    }
  }

  async build() {
    try {
      // Get Chrome path (async pour Windows registry)
      let chromePath = this.options.chromePath;
      
      if (!chromePath) {
        try {
          chromePath = await Utils.getChromePathAsync();
        } catch (error) {
          throw new Error(`Chrome browser not found. Please install Google Chrome from https://www.google.com/chrome/ or specify the chromePath option manually.`);
        }
      }
      
      // Get or generate driver path
      let driverPath = this.options.driverPath;
      if (!driverPath) {
        try {
          driverPath = Utils.getUndetectedDriverPath();
        } catch (error) {
          // If not found, try to generate it
          driverPath = await this.generateExecutableIfNeeded();
        }
      }

      // Set up Chrome options
      const chromeOptions = new chrome.Options();
      chromeOptions.setChromeBinaryPath(chromePath);
      
      // Add user agent
      chromeOptions.addArguments(`--user-agent=${this.options.userAgent}`);
      
      // Add window size
      chromeOptions.addArguments(`--window-size=${this.options.windowSize.width},${this.options.windowSize.height}`);
      
      // Add headless mode if requested
      if (this.options.headless) {
        chromeOptions.addArguments('--headless=new');
      }

      // Generate unique user data directory to avoid conflicts
      if (!this.userDataDir) {
        const uniqueId = crypto.randomUUID();
        const timestamp = Date.now();
        const processId = process.pid;
        this.userDataDir = path.join(os.tmpdir(), `chrome_undetected_${timestamp}_${processId}_${uniqueId}`);
        
        // Ensure directory doesn't exist (double check)
        let counter = 0;
        let finalDir = this.userDataDir;
        while (fs.existsSync(finalDir) && counter < 10) {
          counter++;
          finalDir = `${this.userDataDir}_${counter}`;
        }
        this.userDataDir = finalDir;
      }

      // Add common stealth arguments - Ubuntu server specific optimizations
      const stealthArgs = [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--ignore-ssl-errors',
        '--ignore-certificate-errors-spki-list',
        `--user-data-dir=${this.userDataDir}`,
        '--remote-debugging-port=0',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--single-process'
      ];

      stealthArgs.forEach(arg => chromeOptions.addArguments(arg));
      
      // Add custom arguments
      this.options.arguments.forEach(arg => chromeOptions.addArguments(arg));

      // Create service with undetected driver path
      const service = new chrome.ServiceBuilder(driverPath);

      // Build the driver
      this.driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .setChromeService(service)
        .build();

      // Execute scripts to remove webdriver detection
      await this.removeWebDriverTraces();

      return this.driver;
      
    } catch (error) {
      throw new Error(`Failed to create UndetectedChrome driver: ${error.message}`);
    }
  }

  async removeWebDriverTraces() {
    if (!this.driver) return;

    try {
      // Remove webdriver property
      await this.driver.executeScript(`
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      `);

      // Override chrome property
      await this.driver.executeScript(`
        window.chrome = {
          runtime: {},
        };
      `);

      // Override permissions
      await this.driver.executeScript(`
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
      `);

      // Override plugins
      await this.driver.executeScript(`
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
      `);

      // Override languages
      await this.driver.executeScript(`
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
      `);

    } catch (error) {
      console.warn('Warning: Could not remove all webdriver traces:', error.message);
    }
  }

  async get(url) {
    if (!this.driver) {
      await this.build();
    }
    return await this.driver.get(url);
  }

  async quit() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
    
    // Clean up temporary user data directory
    if (this.userDataDir && fs.existsSync(this.userDataDir)) {
      try {
        fs.rmSync(this.userDataDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`Warning: Could not clean up user data directory: ${error.message}`);
      }
    }
  }

  getDriver() {
    return this.driver;
  }

  // Static method for quick usage
  static async create(options = {}) {
    const instance = new UndetectedChrome(options);
    await instance.build();
    return instance;
  }
}

module.exports = UndetectedChrome;