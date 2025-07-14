const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class WindowsCleaner {
  constructor() {
    this.venvPath = path.join(process.cwd(), '.venv');
  }

  async forceRemoveDirectory(dirPath) {
    return new Promise((resolve) => {
      if (!fs.existsSync(dirPath)) {
        resolve(true);
        return;
      }

      console.log(`Removing ${dirPath}...`);
      
      // Use Windows rmdir with force flags
      const child = spawn('rmdir', ['/s', '/q', dirPath], { 
        shell: true,
        stdio: 'inherit'
      });
      
      child.on('close', (code) => {
        if (code === 0 || !fs.existsSync(dirPath)) {
          console.log('✓ Directory removed successfully');
          resolve(true);
        } else {
          console.log('⚠️  Some files may remain locked. Try closing Python processes.');
          resolve(false);
        }
      });

      child.on('error', (error) => {
        console.log(`Warning: ${error.message}`);
        resolve(false);
      });
    });
  }

  async killPythonProcesses() {
    return new Promise((resolve) => {
      console.log('Killing Python processes...');
      
      const child = spawn('taskkill', ['/f', '/im', 'python.exe'], { 
        shell: true 
      });
      
      child.on('close', () => {
        resolve(true);
      });

      child.on('error', () => {
        resolve(true); // Continue even if no processes found
      });
    });
  }

  async run() {
    console.log('🧹 Windows cleanup for undetected-chromedriver-js...');
    
    // Kill any running Python processes that might lock files
    await this.killPythonProcesses();
    
    // Wait a moment for processes to close
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force remove virtual environment
    await this.forceRemoveDirectory(this.venvPath);
    
    // Remove other generated files
    const filesToRemove = [
      path.join(process.cwd(), 'chromedriver_path.txt'),
      path.join(__dirname, 'generate_executable.py')
    ];
    
    filesToRemove.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`✓ Removed ${file}`);
        } catch (error) {
          console.log(`⚠️  Could not remove ${file}: ${error.message}`);
        }
      }
    });
    
    console.log('✅ Windows cleanup completed. Run npm run setup to reinstall.');
  }
}

if (require.main === module) {
  const cleaner = new WindowsCleaner();
  cleaner.run().catch(console.error);
}

module.exports = WindowsCleaner;