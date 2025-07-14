const fs = require('fs');
const path = require('path');

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ Removed ${dirPath}`);
  }
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✓ Removed ${filePath}`);
  }
}

console.log('🧹 Cleaning up undetected-chromedriver-js...');

// Remove virtual environment
removeDir(path.join(process.cwd(), '.venv'));

// Remove generated files
removeFile(path.join(process.cwd(), 'chromedriver_path.txt'));
removeFile(path.join(__dirname, 'generate_executable.py'));

console.log('✅ Cleanup completed. Run npm run setup to reinstall.');