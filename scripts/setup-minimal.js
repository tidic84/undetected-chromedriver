const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class MinimalSetup {
  constructor() {
    this.platform = os.platform();
    this.venvPath = path.join(process.cwd(), '.venv');
    this.pythonCmd = this.platform === 'win32' ? 'python' : 'python3';
    this.pipCmd = this.platform === 'win32' ? 
      path.join(this.venvPath, 'Scripts', 'pip') : 
      path.join(this.venvPath, 'bin', 'pip');
  }

  async checkPython() {
    return new Promise((resolve) => {
      const child = spawn(this.pythonCmd, ['--version']);
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Python found');
          resolve(true);
        } else {
          console.error('✗ Python not found. Please install Python first.');
          resolve(false);
        }
      });
    });
  }

  async createVirtualEnv() {
    return new Promise((resolve) => {
      console.log('Creating Python virtual environment...');
      
      if (fs.existsSync(this.venvPath)) {
        console.log('✓ Virtual environment already exists');
        resolve(true);
        return;
      }

      const child = spawn(this.pythonCmd, ['-m', 'venv', this.venvPath]);
      
      child.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('No module named venv')) {
          console.log('\n⚠️  Python venv module not found');
          console.log('🔄 Trying alternative methods...');
          this.tryAlternativeVenv().then(resolve);
          return;
        }
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Virtual environment created');
          resolve(true);
        } else {
          console.error('✗ Failed to create virtual environment');
          console.log('\n💡 Try installing python3-venv:');
          console.log('   sudo apt install python3-venv');
          resolve(false);
        }
      });
    });
  }

  async tryAlternativeVenv() {
    // Try multiple methods to create virtual environment
    console.log('1️⃣ Trying to install python3-venv...');
    
    return new Promise((resolve) => {
      // First try installing python3-venv
      const aptChild = spawn('sudo', ['apt', 'install', '-y', 'python3-venv'], {
        stdio: 'pipe'
      });
      
      aptChild.on('close', async (code) => {
        if (code === 0) {
          console.log('✓ python3-venv installed');
          const venvResult = await this.retryCreateVenv();
          if (venvResult) {
            resolve(true);
            return;
          }
        }
        
        // If that failed, try virtualenv
        console.log('2️⃣ Trying virtualenv...');
        const virtualenvResult = await this.tryVirtualenv();
        if (virtualenvResult) {
          resolve(true);
          return;
        }
        
        // Last resort: install without virtual environment
        console.log('3️⃣ Installing globally (not recommended)...');
        this.modifyForGlobalInstall();
        resolve(true);
      });
    });
  }

  async retryCreateVenv() {
    return new Promise((resolve) => {
      const child = spawn(this.pythonCmd, ['-m', 'venv', this.venvPath]);
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Virtual environment created with venv');
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  async tryVirtualenv() {
    return new Promise((resolve) => {
      // Try installing virtualenv
      const pipChild = spawn('pip3', ['install', '--user', 'virtualenv']);
      
      pipChild.on('close', (code) => {
        if (code === 0) {
          // Try creating venv with virtualenv
          const venvChild = spawn('virtualenv', [this.venvPath]);
          
          venvChild.on('close', (venvCode) => {
            if (venvCode === 0) {
              console.log('✓ Virtual environment created with virtualenv');
              resolve(true);
            } else {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  }

  modifyForGlobalInstall() {
    console.log('⚠️  Installing Python packages globally');
    console.log('   This is not recommended but will allow the module to work');
    
    // Modify paths to use global Python
    this.venvPath = '';
    this.pipCmd = 'pip3';
    this.pythonCmd = 'python3';
  }

  async installDependencies() {
    return new Promise((resolve) => {
      console.log('Installing Python dependencies...');
      const child = spawn(this.pipCmd, ['install', 'setuptools', 'undetected-chromedriver']);
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Dependencies installed');
          resolve(true);
        } else {
          console.error('✗ Failed to install dependencies');
          resolve(false);
        }
      });
    });
  }

  async checkChrome() {
    const Utils = require('../lib/utils');
    try {
      await Utils.getChromePathAsync();
      return true;
    } catch (error) {
      return false;
    }
  }

  async run() {
    console.log('🔧 Setup for undetected-chromedriver-js...\n');
    
    console.log('1. Vérification de Chrome...');
    const chromeOk = await this.checkChrome();
    if (!chromeOk) {
      console.log('\n❌ CHROME NON TROUVÉ');
      console.log('🌐 Veuillez installer Google Chrome:');
      console.log('   → https://www.google.com/chrome/');
      console.log('');
      console.log('⚠️  Sans Chrome, le module ne fonctionnera pas.');
      console.log('   Vous pouvez continuer le setup et installer Chrome plus tard.\n');
    } else {
      console.log('✅ Chrome détecté');
    }

    console.log('2. Vérification de Python...');
    const pythonOk = await this.checkPython();
    if (!pythonOk) {
      console.log('\n❌ Setup failed: Python not found');
      return false;
    }

    console.log('\n3. Création de l\'environnement virtuel...');
    const venvOk = await this.createVirtualEnv();
    if (!venvOk) {
      console.log('\n❌ Setup failed: Could not create virtual environment');
      return false;
    }

    console.log('\n4. Installation des dépendances Python...');
    const installOk = await this.installDependencies();
    if (!installOk) {
      console.log('\n❌ Setup failed: Could not install dependencies');
      return false;
    }

    if (chromeOk) {
      console.log('\n🎉 Setup completed successfully!');
    } else {
      console.log('\n⚠️  Setup completed but Chrome is missing');
      console.log('📝 Install Chrome from: https://www.google.com/chrome/');
    }
    
    console.log('📝 Note: Run driver.build() to generate executable on first use');
    return true;
  }
}

if (require.main === module) {
  const setup = new MinimalSetup();
  setup.run().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Setup error:', error);
    process.exit(1);
  });
}

module.exports = MinimalSetup;