// backend/src/middleware/imageValidation.js
const multer = require('multer');
const path = require('path');
const FileType = require('file-type');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images/temp'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

// wrapper para validar file-type después de multer
async function validateImage(req, res, next) {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.file) return res.status(400).json({ error: 'No se proporcionó imagen' });

    try {
      const ft = await FileType.fromFile(req.file.path);
      const mime = ft?.mime || req.file.mimetype;
      const allowed = ['image/jpeg','image/png','image/webp'];
      if (!allowed.includes(mime)) {
        // borrar archivo temporal
        const fs = require('fs').promises;
        await fs.unlink(req.file.path).catch(()=>{});
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo JPEG, PNG, WEBP.'});
      }
      // inyectar detectedMime para controladores
      req.file.detectedMime = mime;
      next();
    } catch (e) {
      return res.status(500).json({ error: 'Error validando imagen', details: e.message });
    }
  });
}

module.exports = validateImage;