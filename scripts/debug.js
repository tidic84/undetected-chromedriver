const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

class DebugSetup {
  constructor() {
    this.platform = os.platform();
    this.venvPath = path.join(process.cwd(), '.venv');
    this.pythonCmd = this.platform === 'win32' ? 'python' : 'python3';
    this.venvPythonCmd = this.platform === 'win32' ? 
      path.join(this.venvPath, 'Scripts', 'python') : 
      path.join(this.venvPath, 'bin', 'python');
  }

  async checkPython() {
    console.log('🔍 Checking Python version...');
    return new Promise((resolve) => {
      const child = spawn(this.pythonCmd, ['--version']);
      
      child.stdout.on('data', (data) => {
        console.log(`System Python: ${data.toString()}`);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  async checkVenvPython() {
    console.log('🔍 Checking virtual environment Python...');
    return new Promise((resolve) => {
      const child = spawn(this.venvPythonCmd, ['--version']);
      
      child.stdout.on('data', (data) => {
        console.log(`Venv Python: ${data.toString()}`);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  async checkDistutils() {
    console.log('🔍 Checking distutils availability...');
    return new Promise((resolve) => {
      const child = spawn(this.venvPythonCmd, ['-c', 'import distutils; print("distutils available")']);
      
      child.stdout.on('data', (data) => {
        console.log(`✓ ${data.toString()}`);
      });

      child.stderr.on('data', (data) => {
        console.log(`✗ ${data.toString()}`);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  async checkSetuptools() {
    console.log('🔍 Checking setuptools availability...');
    return new Promise((resolve) => {
      const child = spawn(this.venvPythonCmd, ['-c', 'import setuptools; print("setuptools available")']);
      
      child.stdout.on('data', (data) => {
        console.log(`✓ ${data.toString()}`);
      });

      child.stderr.on('data', (data) => {
        console.log(`✗ ${data.toString()}`);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  async checkUndetectedChrome() {
    console.log('🔍 Checking undetected-chromedriver import...');
    return new Promise((resolve) => {
      const child = spawn(this.venvPythonCmd, ['-c', 'import undetected_chromedriver; print("undetected-chromedriver available")']);
      
      child.stdout.on('data', (data) => {
        console.log(`✓ ${data.toString()}`);
      });

      child.stderr.on('data', (data) => {
        console.log(`✗ ${data.toString()}`);
      });

      child.on('close', (code) => {
        resolve(code === 0);
      });
    });
  }

  async installSetuptools() {
    console.log('🔧 Installing setuptools...');
    return new Promise((resolve) => {
      const pipCmd = this.platform === 'win32' ? 
        path.join(this.venvPath, 'Scripts', 'pip') : 
        path.join(this.venvPath, 'bin', 'pip');

      const child = spawn(pipCmd, ['install', 'setuptools']);
      
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
          console.log('✗ Failed to install setuptools');
          resolve(false);
        }
      });
    });
  }

  async run() {
    console.log('🐛 Debug mode - Checking environment...\n');
    
    await this.checkPython();
    await this.checkVenvPython();
    
    console.log('\n--- Checking Python modules ---');
    const hasDistutils = await this.checkDistutils();
    const hasSetuptools = await this.checkSetuptools();
    
    if (!hasDistutils && !hasSetuptools) {
      console.log('\n🔧 Neither distutils nor setuptools found, installing setuptools...');
      await this.installSetuptools();
      await this.checkSetuptools();
    }
    
    await this.checkUndetectedChrome();
    
    console.log('\n✅ Debug completed');
  }
}

if (require.main === module) {
  const debug = new DebugSetup();
  debug.run().catch(console.error);
}

module.exports = DebugSetup;