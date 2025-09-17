import { config } from '../config/environment.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error('🚨 Error:', err);

  // Error de validación de Mongoose/Sequelize
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      status: 'error',
      statusCode: 400,
      message: 'Error de validación',
      errors: message
    };
  }

  // Error de duplicado de clave (Unique constraint)
  if (err.code === 11000 || err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Recurso duplicado';
    error = {
      status: 'error',
      statusCode: 400,
      message,
      field: err.fields ? Object.keys(err.fields)[0] : 'unknown'
    };
  }

  // Error de recurso no encontrado
  if (err.name === 'CastError' || err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Recurso no encontrado';
    error = {
      status: 'error',
      statusCode: 404,
      message
    };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido. Por favor inicia sesión nuevamente';
    error = {
      status: 'error',
      statusCode: 401,
      message
    };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado. Por favor inicia sesión nuevamente';
    error = {
      status: 'error',
      statusCode: 401,
      message
    };
  }

  res.status(error.statusCode || err.statusCode || 500).json({
    success: false,
    status: 'error',
    statusCode: error.statusCode || err.statusCode || 500,
    message: error.message || 'Error interno del servidor',
    ...(config.server.environment === 'development' && { 
      stack: err.stack,
      fullError: err 
    }),
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};
