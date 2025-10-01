// backend/src/routes/uploadRoutes.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const validateImage = require('../middleware/imageValidation');
const sharp = require('sharp');

const router = express.Router();

// Ruta POST para cargar imágenes de restaurantes
router.post('/restaurant-image', validateImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen'
      });
    }

    const { filename, path: tempPath, detectedMime } = req.file;
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    
    // Crear rutas finales
    const finalDir = path.join(__dirname, '../../uploads/images/restaurants');
    const finalPath = path.join(finalDir, filename);
    const optimizedPath = path.join(finalDir, `${name}-optimized${ext}`);
    const thumbPath = path.join(finalDir, `${name}-thumb${ext}`);

    // Asegurar que existe el directorio
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    // Optimizar imagen con sharp
    await sharp(tempPath)
      .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Crear thumbnail
    await sharp(tempPath)
      .resize(300, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    // Mover archivo original
    fs.renameSync(tempPath, finalPath);

    // Construir URLs accesibles
    const baseUrl = '/uploads/images/restaurants';
    const imageUrl = `${baseUrl}/${filename}`;
    const optimizedUrl = `${baseUrl}/${name}-optimized${ext}`;
    const thumbUrl = `${baseUrl}/${name}-thumb${ext}`;
    
    res.status(200).json({
      success: true,
      message: 'Imagen cargada y optimizada exitosamente',
      data: {
        filename: filename,
        originalName: req.file.originalname,
        mimetype: detectedMime,
        size: req.file.size,
        urls: {
          original: imageUrl,
          optimized: optimizedUrl,
          thumbnail: thumbUrl
        }
      }
    });
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    
    // Limpiar archivo temporal en caso de error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar la imagen'
    });
  }
});

// Ruta POST para cargar imágenes de productos
router.post('/product-image', validateImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen'
      });
    }

    const { filename, path: tempPath, detectedMime } = req.file;
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    
    // Crear rutas finales
    const finalDir = path.join(__dirname, '../../uploads/images/products');
    const finalPath = path.join(finalDir, filename);
    const optimizedPath = path.join(finalDir, `${name}-optimized${ext}`);
    const thumbPath = path.join(finalDir, `${name}-thumb${ext}`);

    // Asegurar que existe el directorio
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    // Optimizar imagen con sharp
    await sharp(tempPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Crear thumbnail cuadrado para productos
    await sharp(tempPath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    // Mover archivo original
    fs.renameSync(tempPath, finalPath);

    // Construir URLs accesibles
    const baseUrl = '/uploads/images/products';
    const imageUrl = `${baseUrl}/${filename}`;
    const optimizedUrl = `${baseUrl}/${name}-optimized${ext}`;
    const thumbUrl = `${baseUrl}/${name}-thumb${ext}`;
    
    res.status(200).json({
      success: true,
      message: 'Imagen de producto cargada y optimizada exitosamente',
      data: {
        filename: filename,
        originalName: req.file.originalname,
        mimetype: detectedMime,
        size: req.file.size,
        urls: {
          original: imageUrl,
          optimized: optimizedUrl,
          thumbnail: thumbUrl
        }
      }
    });
  } catch (error) {
    console.error('Error al procesar la imagen del producto:', error);
    
    // Limpiar archivo temporal en caso de error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar la imagen del producto'
    });
  }
});

// Ruta GET para verificar el estado del servicio de upload
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Servicio de upload funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta GET para listar imágenes cargadas (opcional, para debugging)
router.get('/images/:type(restaurants|products)', (req, res) => {
  try {
    const { type } = req.params;
    const uploadPath = path.join(__dirname, `../../uploads/images/${type}`);
    
    if (!fs.existsSync(uploadPath)) {
      return res.json({
        success: true,
        data: [],
        message: `No hay imágenes de ${type} cargadas`
      });
    }

    const files = fs.readdirSync(uploadPath)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && !file.includes('-thumb') && !file.includes('-optimized');
      })
      .map(file => {
        const name = path.basename(file, path.extname(file));
        const ext = path.extname(file);
        return {
          filename: file,
          originalUrl: `/uploads/images/${type}/${file}`,
          optimizedUrl: `/uploads/images/${type}/${name}-optimized${ext}`,
          thumbnailUrl: `/uploads/images/${type}/${name}-thumb${ext}`,
          size: fs.statSync(path.join(uploadPath, file)).size,
          created: fs.statSync(path.join(uploadPath, file)).birthtime
        };
      });

    res.json({
      success: true,
      data: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error al listar imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar imágenes'
    });
  }
});

module.exports = router;