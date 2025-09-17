import { body, validationResult, param, query } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validaciones para autenticación
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una letra y un número'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

// Validaciones para restaurantes
export const validateRestaurant = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d\s\-\(\)]{7,19}$/)
    .withMessage('Debe ser un número de teléfono válido'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('La URL de la imagen debe ser válida'),
  
  body('category')
    .trim()
    .isIn(['Italiana', 'Japonesa', 'Mexicana', 'Comida local', 'Asiática', 'Americana', 'Mediterránea', 'Vegetariana', 'Pizzería', 'Hamburguesas', 'Sushi', 'Parrilla', 'General'])
    .withMessage('Categoría no válida'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0.0, max: 5.0 })
    .withMessage('La calificación debe estar entre 0.0 y 5.0'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  body('deliveryTime')
    .optional()
    .isInt({ min: 10, max: 120 })
    .withMessage('El tiempo de entrega debe estar entre 10 y 120 minutos'),
  
  body('deliveryFee')
    .optional()
    .isFloat({ min: 0.00, max: 50.00 })
    .withMessage('El costo de envío debe estar entre 0.00 y 50.00'),
  
  body('minOrder')
    .optional()
    .isFloat({ min: 0.00 })
    .withMessage('El pedido mínimo debe ser un número positivo'),
  
  handleValidationErrors
];

// Validaciones para items del menú
export const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('La descripción no puede exceder 300 caracteres'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida'),
  
  body('isVegetarian')
    .optional()
    .isBoolean()
    .withMessage('isVegetarian debe ser true o false'),
  
  body('isSpicy')
    .optional()
    .isBoolean()
    .withMessage('isSpicy debe ser true o false'),
  
  handleValidationErrors
];

// Validaciones para pedidos
export const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe incluir al menos un item en el pedido'),
  
  body('items.*.menuItemId')
    .isUUID()
    .withMessage('ID de item de menú inválido'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero positivo'),
  
  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('La dirección de entrega es requerida'),
  
  body('deliveryAddress.neighborhood')
    .trim()
    .notEmpty()
    .withMessage('El barrio es requerido'),
  
  body('paymentMethod')
    .isIn(['mercadopago', 'payu', 'pse', 'nequi', 'daviplata', 'cash'])
    .withMessage('Método de pago inválido'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ruta
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  
  handleValidationErrors
];

// Validaciones para queries de paginación
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El número de página debe ser un entero positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  handleValidationErrors
];

// Validaciones para filtros de restaurantes
export const validateRestaurantFilters = [
  query('cuisine')
    .optional()
    .isString()
    .trim(),
  
  query('serviceType')
    .optional()
    .isIn(['delivery', 'dining', 'nightlife'])
    .withMessage('Tipo de servicio inválido'),
  
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('La calificación mínima debe estar entre 0 y 5'),
  
  query('maxDeliveryTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El tiempo máximo de entrega debe ser un número positivo'),
  
  query('openNow')
    .optional()
    .isBoolean()
    .withMessage('openNow debe ser true o false'),
  
  handleValidationErrors
];

// Validaciones para actualización de perfil de usuario
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('phone')
    .optional({ nullable: true })
    .matches(/^\+?[0-9\s-()]{10,}$/)
    .withMessage('Debe ser un número de teléfono válido'),
  
  body('profileImage')
    .optional()
    .isURL()
    .withMessage('La imagen de perfil debe ser una URL válida'),
  
  body('address')
    .optional()
    .isArray()
    .withMessage('Las direcciones deben ser un array'),
  
  handleValidationErrors
];

// Validaciones para agregar dirección
export const validateAddress = [
  body('street')
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),
  
  body('city')
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ciudad debe tener entre 2 y 50 caracteres'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El estado debe tener entre 2 y 50 caracteres'),
  
  body('zipCode')
    .optional()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('El código postal debe tener entre 3 y 10 caracteres'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El país debe tener entre 2 y 50 caracteres'),
  
  body('label')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('La etiqueta debe tener entre 1 y 30 caracteres'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault debe ser true o false'),
  
  handleValidationErrors
];

// Validaciones para cambio de contraseña
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una letra y un número'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('La confirmación de contraseña no coincide');
      }
      return true;
    }),
  
  handleValidationErrors
];
