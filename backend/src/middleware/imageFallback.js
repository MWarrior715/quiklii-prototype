// backend/src/middleware/imageFallback.js
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Crear imagen placeholder dinámica con sharp
const createPlaceholderImage = async (width = 400, height = 300, text = 'No Image') => {
  try {
    // Crear un buffer de imagen SVG
    const svgText = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#999" text-anchor="middle" dominant-baseline="middle">${text}</text>
      </svg>
    `;
    
    // Convertir SVG a PNG usando sharp
    const buffer = await sharp(Buffer.from(svgText))
      .png()
      .toBuffer();
    
    return buffer;
  } catch (error) {
    console.error('Error al crear imagen placeholder:', error);
    return null;
  }
};

// Middleware para servir imágenes placeholder cuando no existe la imagen solicitada
const imageFallbackMiddleware = (req, res, next) => {
  // Solo procesar solicitudes de imágenes
  if (!req.path.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return next();
  }

  const imagePath = path.join(__dirname, '../../uploads', req.path);
  
  // Verificar si el archivo existe
  fs.access(imagePath, fs.constants.F_OK, async (err) => {
    if (err) {
      // El archivo no existe, crear o servir placeholder
      const placeholderPath = path.join(__dirname, '../../uploads/images/placeholder.png');
      
      try {
        // Intentar crear el directorio si no existe
        const placeholderDir = path.dirname(placeholderPath);
        if (!fs.existsSync(placeholderDir)) {
          fs.mkdirSync(placeholderDir, { recursive: true });
        }
        
        // Verificar si ya existe un placeholder
        if (!fs.existsSync(placeholderPath)) {
          console.log('Creando imagen placeholder...');
          const placeholderBuffer = await createPlaceholderImage();
          
          if (placeholderBuffer) {
            fs.writeFileSync(placeholderPath, placeholderBuffer);
            console.log('Imagen placeholder creada exitosamente');
          } else {
            console.error('No se pudo crear la imagen placeholder');
            return res.status(404).json({
              success: false,
              message: 'Imagen no encontrada y no se pudo crear placeholder'
            });
          }
        }
        
        // Servir la imagen placeholder
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.sendFile(placeholderPath);
        
      } catch (error) {
        console.error('Error al manejar fallback de imagen:', error);
        res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }
    } else {
      // El archivo existe, continuar con el manejo normal
      next();
    }
  });
};

// Middleware para servir imágenes estáticas con fallback
const serveImagesWithFallback = (req, res, next) => {
  const imagePath = path.join(__dirname, '../../uploads', req.path);
  
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      // Si no existe, crear respuesta placeholder dinámica
      createPlaceholderImage().then(buffer => {
        if (buffer) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'no-cache');
          res.send(buffer);
        } else {
          res.status(404).json({
            success: false,
            message: 'Imagen no encontrada'
          });
        }
      }).catch(error => {
        console.error('Error al crear placeholder dinámico:', error);
        res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      });
    } else {
      // El archivo existe, servirlo normalmente
      res.sendFile(imagePath);
    }
  });
};

module.exports = {
  createPlaceholderImage,
  imageFallbackMiddleware,
  serveImagesWithFallback
};
