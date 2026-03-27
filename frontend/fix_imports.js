const fs = require('fs');
const path = require('path');

const dirs = [
  'home/farmer',
  'home/consumer',
  'market/farmer',
  'market/consumer',
  'social/farmer',
  'insights/farmer'
];

dirs.forEach(d => {
  const dirPath = path.join(__dirname, 'src/pages', d);
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.jsx'));
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Update relative imports from '../../' to '../../../'
      const newContent = content.replace(/(\"|')\.\.\/\.\.\//g, '$1../../../');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Fixed imports in', filePath);
      }
    });
  }
});
