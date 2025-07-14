const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class SetupManager {
  constructor() {
    this.platform = os.platform();
    this.setupPythonScript = path.join(__dirname, 'generate_executable.py');
    this.venvPath = path.join(process.cwd(), '.venv');
    this.pythonCmd = this.platform === 'win32' ? 'python' : 'python3';
    this.pipCmd = this.platform === 'win32' ? 
      path.join(this.venvPath, 'Scripts', 'pip') : 
      path.join(this.venvPath, 'bin', 'pip');
    this.venvPythonCmd = this.platform === 'win32' ? 
      path.join(this.venvPath, 'Scripts', 'python') : 
      path.join(this.venvPath, 'bin', 'python');
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
      
      // Check if venv already exists
      if (fs.existsSync(this.venvPath)) {
        console.log('✓ Virtual environment already exists');
        resolve(true);
        return;
      }

      const child = spawn(this.pythonCmd, ['-m', 'venv', this.venvPath]);
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Virtual environment created');
          resolve(true);
        } else {
          console.error('✗ Failed to create virtual environment');
          resolve(false);
        }
      });
    });
  }

  async installSetuptools() {
    return new Promise((resolve) => {
      console.log('Installing setuptools for Python 3.13+ compatibility...');
      const child = spawn(this.pipCmd, ['install', 'setuptools']);
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ setuptools installed');
          resolve(true);
        } else {
          console.error('✗ Failed to install setuptools');
          resolve(false);
        }
      });
    });
  }

  async installUndetectedChromedriver() {
    return new Promise((resolve) => {
      console.log('Installing undetected-chromedriver...');
      const child = spawn(this.pipCmd, ['install', 'undetected-chromedriver']);
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          console.log('✓ undetected-chromedriver installed');
          resolve(true);
        } else {
          console.error('✗ Failed to install undetected-chromedriver');
          resolve(false);
        }
      });
    });
  }

  createPythonScript() {
    const pythonCode = `
# -*- coding: utf-8 -*-
import undetected_chromedriver as uc
from multiprocessing import freeze_support
import os
import sys
import platform

def find_chrome_binary():
    """Find Chrome binary on Windows"""
    if platform.system() == "Windows":
        possible_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe")
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
    return None

if __name__ == '__main__':
    try:
        freeze_support()
        print("Creating undetected ChromeDriver executable...")
        
        # Find Chrome binary on Windows
        chrome_binary = find_chrome_binary()
        
        if chrome_binary:
            print(f"Using Chrome at: {chrome_binary}")
            # Create a temporary driver instance with Chrome path
            driver = uc.Chrome(browser_executable_path=chrome_binary, headless=True, use_subprocess=False)
        else:
            print("Chrome not found, using default...")
            # Try without specifying Chrome path
            driver = uc.Chrome(headless=True, use_subprocess=False)
        
        # Get the executable path
        executable_path = driver.service.path
        print(f"Executable created at: {executable_path}")
        
        # Close the driver
        driver.quit()
        
        # Write the path to a file for Node.js to read
        with open('chromedriver_path.txt', 'w', encoding='utf-8') as f:
            f.write(executable_path)
            
        print("Setup completed successfully!")
        
    except Exception as e:
        print(f"Error during setup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
`;

    fs.writeFileSync(this.setupPythonScript, pythonCode);
  }

  async generateExecutable() {
    return new Promise((resolve) => {
      console.log('Generating undetected ChromeDriver executable...');
      
      this.createPythonScript();
      
      // Set environment for proper UTF-8 encoding on Windows
      const env = { ...process.env };
      if (this.platform === 'win32') {
        env.PYTHONIOENCODING = 'utf-8';
        env.PYTHONUTF8 = '1';
      }
      
      const child = spawn(this.venvPythonCmd, [this.setupPythonScript], {
        cwd: process.cwd(),
        env: env
      });
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        // Clean up temporary Python script
        if (fs.existsSync(this.setupPythonScript)) {
          fs.unlinkSync(this.setupPythonScript);
        }
        
        if (code === 0) {
          console.log('✓ Executable generated successfully');
          resolve(true);
        } else {
          console.error('✗ Failed to generate executable');
          resolve(false);
        }
      });
    });
  }

  async run() {
    console.log('🔧 Setting up undetected-chromedriver-js...\n');
    
    const pythonOk = await this.checkPython();
    if (!pythonOk) {
      process.exit(1);
    }

    const venvOk = await this.createVirtualEnv();
    if (!venvOk) {
      process.exit(1);
    }

    const setuptoolsOk = await this.installSetuptools();
    if (!setuptoolsOk) {
      process.exit(1);
    }

    const installOk = await this.installUndetectedChromedriver();
    if (!installOk) {
      process.exit(1);
    }

    const executableOk = await this.generateExecutable();
    if (!executableOk) {
      process.exit(1);
    }

    console.log('\n🎉 Setup completed! You can now use undetected-chromedriver-js');
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  const setup = new SetupManager();
  setup.run().catch(console.error);
}

module.exports = SetupManager;