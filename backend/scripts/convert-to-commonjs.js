const fs = require('fs');
const path = require('path');

// Directorios a procesar
const directories = [
  'src/routes',
  'src/controllers',
  'src/middleware',
  'src/services'
];

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Convertir import a require
  content = content.replace(/import\s+(\w+)\s+from\s+['"](.+?)['"]/g, (match, varName, modulePath) => {
    modified = true;
    return `const ${varName} = require('${modulePath}')`;
  });

  // Convertir import { ... } from '...' a const { ... } = require('...')
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"](.+?)['"]/g, (match, vars, modulePath) => {
    modified = true;
    return `const {${vars}} = require('${modulePath}')`;
  });

  // Convertir import * as ... from '...' a const ... = require('...')
  content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"](.+?)['"]/g, (match, varName, modulePath) => {
    modified = true;
    return `const ${varName} = require('${modulePath}')`;
  });

  // Convertir export default a module.exports
  content = content.replace(/export\s+default\s+/g, () => {
    modified = true;
    return 'module.exports = ';
  });

  // Convertir export { ... } a module.exports = { ... }
  content = content.replace(/export\s+\{([^}]+)\}/g, (match, vars) => {
    modified = true;
    return `module.exports = {${vars}}`;
  });

  // Convertir export const/function/class
  content = content.replace(/export\s+(const|let|var|function|class)\s+/g, (match, keyword) => {
    modified = true;
    return `${keyword} `;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Convertido: ${filePath}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const fullPath = path.join(__dirname, '..', dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Directorio no existe: ${dir}`);
    return;
  }

  const files = fs.readdirSync(fullPath, { recursive: true });
  let convertedCount = 0;

  files.forEach(file => {
    const filePath = path.join(fullPath, file);
    
    if (fs.statSync(filePath).isFile() && filePath.endsWith('.js')) {
      if (convertFile(filePath)) {
        convertedCount++;
      }
    }
  });

  console.log(`📁 ${dir}: ${convertedCount} archivos convertidos\n`);
}

console.log('🔄 Iniciando conversión de ES Modules a CommonJS...\n');

directories.forEach(dir => processDirectory(dir));

console.log('✅ Conversión completada!');