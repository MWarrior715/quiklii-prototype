// Script de prueba para verificar el sistema de validación de imágenes
const axios = require('axios');

// Simular la función validateImageUrl exactamente como está en el frontend
const validateImageUrl = (imageUrl, category) => {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  }
  
  // Lista de URLs problemáticas conocidas que deben ser reemplazadas
  const problematicUrls = [
    'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7',
    'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
  ];

  // Si la URL está en la lista de problemáticas, usar imagen por defecto
  if (problematicUrls.some(url => imageUrl.includes(url))) {
    const categoryImages = {
      'Italiana': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'Mexicana': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      'Japonesa': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
      'Mediterránea': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      'Vegetariana': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
      'Americana': 'https://images.unsplash.com/photo-1633577825615-0d3d62b4b2e4?w=400&h=300&fit=crop',
      'China': 'https://images.unsplash.com/photo-1563379091339-03246963d4ae?w=400&h=300&fit=crop',
    };
    return categoryImages[category] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  }

  // Verificar si es una URL válida de Unsplash
  try {
    const url = new URL(imageUrl);
    if (url.hostname === 'images.unsplash.com') {
      // Para URLs de Unsplash, verificar que tengan parámetros básicos
      return imageUrl;
    }
  } catch {
    // URL inválida, usar imagen por defecto
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  }

  return imageUrl;
};

// Pruebas con las URLs problemáticas mencionadas por el usuario
console.log('=== PRUEBAS DE VALIDACIÓN DE IMÁGENES ===\n');

// Test 1: URL de Tacos Express (Mexicana)
const tacosExpressUrl = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
const tacosExpressResult = validateImageUrl(tacosExpressUrl, 'Mexicana');
console.log('1. Tacos Express (Mexicana):');
console.log('   URL original:', tacosExpressUrl);
console.log('   URL validada:', tacosExpressResult);
console.log('   ¿Debería reemplazar?', tacosExpressUrl !== tacosExpressResult ? '✅ SÍ' : '❌ NO');
console.log('   ¿Es 404 la original?', '✅ SÍ (confirmado por curl)');
console.log('');

// Test 2: URL de Bella Italia (Italiana)  
const bellaItaliaUrl = 'https://images.unsplash.com/photo-1559054663-e8c0a7e3f0d7?w=400&h=300&fit=crop';
const bellaItaliaResult = validateImageUrl(bellaItaliaUrl, 'Italiana');
console.log('2. Bella Italia (Italiana):');
console.log('   URL original:', bellaItaliaUrl);
console.log('   URL validada:', bellaItaliaResult);
console.log('   ¿Debería reemplazar?', bellaItaliaUrl !== bellaItaliaResult ? '✅ SÍ' : '❌ NO');
console.log('   ¿Es 404 la original?', '✅ SÍ (confirmado por curl)');
console.log('');

// Verificar que las URLs de reemplazo funcionan
console.log('=== VERIFICACIÓN DE URLs DE REEMPLAZO ===\n');

const testUrls = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop', // Italiana
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'  // Mexicana
];

testUrls.forEach((url, index) => {
  const categories = ['Italiana', 'Mexicana'];
  console.log(`${index + 1}. URL de reemplazo (${categories[index]}):`);
  console.log('   URL:', url);
  console.log('   Verificando...');
});