const fs = require('fs');
const path = require('path');

// Criar diretório dist se não existir
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Criar diretório dist/database se não existir
if (!fs.existsSync('dist/database')) {
  fs.mkdirSync('dist/database', { recursive: true });
}

console.log('✅ Diretórios de build criados com sucesso');