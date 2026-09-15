const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');

const colorMap = {
  '#6366f1': '#6C4FF5',
  '#4f46e5': '#4C1D95',
  '#f43f5e': '#EF4444',
  '#e11d48': '#DC2626',
  '#1db970': '#22C55E',
  '#15803d': '#16A34A',
  '#0ea5e9': '#38BDF8',
  '#3b82f6': '#38BDF8',
  '#2563eb': '#0284C7',
  '#b91c1c': '#DC2626',
  '#f59e0b': '#F59E0B'
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    const regex = new RegExp(oldColor, 'gi');
    content = content.replace(regex, newColor);
  }

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

traverseDirectory(directoryPath);
