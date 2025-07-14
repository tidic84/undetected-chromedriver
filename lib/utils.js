const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class Utils {
  static getOS() {
    return os.platform();
  }

  static async getChromeFromRegistry() {
    if (os.platform() !== 'win32') return null;
    
    return new Promise((resolve) => {
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
            if (fs.existsSync(registryPath)) {
              resolve(registryPath);
              return;
            }
          }
        }
        resolve(null);
      });
      
      child.on('error', () => resolve(null));
    });
  }

  static getChromePath() {
    const platform = os.platform();
    
    const chromePaths = {
      'win32': [
        // Chemins standards Windows (64-bit et 32-bit)
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        
        // Répertoire utilisateur avec différentes méthodes
        path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe'),
        os.homedir() + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
        
        // Avec nom d'utilisateur explicite
        `C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
        
        // Formats Unix (au cas où)
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        
        // Autres emplacements possibles
        'C:\\Chrome\\Application\\chrome.exe',
        'D:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      ],
      'darwin': [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      ],
      'linux': [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium'
      ]
    };

    const possiblePaths = chromePaths[platform] || chromePaths['linux'];
    
    for (const chromePath of possiblePaths) {
      if (fs.existsSync(chromePath)) {
        return chromePath;
      }
    }
    
    throw new Error(`Chrome browser not found. Please install Google Chrome or set the path manually.`);
  }

  static async getChromePathAsync() {
    const platform = os.platform();
    
    // Sur Windows, essayer le registre
    if (platform === 'win32') {
      const registryPath = await this.getChromeFromRegistry();
      if (registryPath) {
        return registryPath;
      }
    }
    
    // Fallback sur la méthode synchrone
    try {
      return this.getChromePath();
    } catch (error) {
      throw new Error(`Chrome browser not found. Please install Google Chrome or set the path manually.`);
    }
  }

  static getUndetectedDriverPath() {
    const platform = os.platform();
    
    // Check if we have a saved path from setup
    const pathFile = path.join(process.cwd(), 'chromedriver_path.txt');
    if (fs.existsSync(pathFile)) {
      const savedPath = fs.readFileSync(pathFile, 'utf8').trim();
      if (fs.existsSync(savedPath)) {
        return savedPath;
      }
    }

    // Default paths based on platform
    const defaultPaths = {
      'win32': [
        path.join(os.homedir(), 'AppData\\Roaming\\undetected_chromedriver\\undetected_chromedriver.exe'),
        path.join(os.homedir(), 'AppData\\Local\\undetected_chromedriver\\undetected_chromedriver.exe'),
        path.join(os.homedir(), 'AppData/Roaming/undetected_chromedriver/undetected_chromedriver.exe'),
        path.join(os.homedir(), 'AppData/Local/undetected_chromedriver/undetected_chromedriver.exe')
      ],
      'darwin': [
        path.join(os.homedir(), '.local/share/undetected_chromedriver/undetected_chromedriver'),
        path.join(os.homedir(), 'Library/Application Support/undetected_chromedriver/undetected_chromedriver')
      ],
      'linux': [
        path.join(os.homedir(), '.local/share/undetected_chromedriver/undetected_chromedriver'),
        '/tmp/undetected_chromedriver/undetected_chromedriver'
      ]
    };

    const possiblePaths = defaultPaths[platform] || defaultPaths['linux'];
    
    for (const driverPath of possiblePaths) {
      if (fs.existsSync(driverPath)) {
        return driverPath;
      }
    }
    
    throw new Error(`Undetected ChromeDriver executable not found. Please run 'npm run setup' first.`);
  }

  static validateEnvironment() {
    const errors = [];
    
    try {
      this.getChromePath();
    } catch (error) {
      errors.push(`Chrome not found: ${error.message}`);
    }
    
    try {
      this.getUndetectedDriverPath();
    } catch (error) {
      errors.push(`Undetected ChromeDriver not found: ${error.message}`);
    }
    
    if (errors.length > 0) {
      throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
    }
    
    return true;
  }

  static createUserAgent() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    ];
    
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
}

module.exports = Utils;