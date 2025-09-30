import Joi from 'joi';

// Middleware para manejar errores de validación de Joi
export const validateJoi = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errorDetails
      });
    }

    next();
  };
};

// Esquemas de validación con Joi

// Validación para registro de usuario
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.empty': 'El apellido es requerido',
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'any.required': 'El apellido es requerido'
    }),
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una letra y un número',
      'any.required': 'La contraseña es requerida'
    }),

  phone: Joi.string()
    .pattern(/^\+?[1-9][\d\s\-\(\)]{7,19}$/)
    .optional()
    .messages({
      'string.pattern.base': 'El número de teléfono debe ser válido'
    }),

  role: Joi.string()
    .valid('customer', 'restaurant_owner', 'delivery_person', 'admin')
    .default('customer')
    .messages({
      'any.only': 'Rol inválido'
    })
});

// Validación para login
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.empty': 'El email es requerido',
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'La contraseña es requerida',
      'any.required': 'La contraseña es requerida'
    })
});

// Validación para crear orden
export const createOrderSchema = Joi.object({
  restaurantId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'El ID del restaurante es requerido',
      'string.uuid': 'ID de restaurante inválido',
      'any.required': 'El ID del restaurante es requerido'
    }),

  items: Joi.array()
    .items(
      Joi.object({
        menuItemId: Joi.string()
          .uuid()
          .required()
          .messages({
            'string.empty': 'El ID del item es requerido',
            'string.uuid': 'ID de item inválido',
            'any.required': 'El ID del item es requerido'
          }),

        quantity: Joi.number()
          .integer()
          .min(1)
          .required()
          .messages({
            'number.base': 'La cantidad debe ser un número',
            'number.integer': 'La cantidad debe ser un número entero',
            'number.min': 'La cantidad debe ser al menos 1',
            'any.required': 'La cantidad es requerida'
          }),

        notes: Joi.string()
          .max(200)
          .trim()
          .optional()
          .messages({
            'string.max': 'Las notas no pueden exceder 200 caracteres'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Los items deben ser un array',
      'array.min': 'Debe incluir al menos un item',
      'any.required': 'Los items son requeridos'
    }),

  deliveryAddress: Joi.object({
    street: Joi.string()
      .min(5)
      .max(200)
      .trim()
      .required()
      .messages({
        'string.empty': 'La dirección es requerida',
        'string.min': 'La dirección debe tener al menos 5 caracteres',
        'string.max': 'La dirección no puede exceder 200 caracteres',
        'any.required': 'La dirección es requerida'
      }),

    neighborhood: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .required()
      .messages({
        'string.empty': 'El barrio es requerido',
        'string.min': 'El barrio debe tener al menos 2 caracteres',
        'string.max': 'El barrio no puede exceder 100 caracteres',
        'any.required': 'El barrio es requerido'
      }),

    city: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .required()
      .messages({
        'string.empty': 'La ciudad es requerida',
        'string.min': 'La ciudad debe tener al menos 2 caracteres',
        'string.max': 'La ciudad no puede exceder 50 caracteres',
        'any.required': 'La ciudad es requerida'
      }),

    coordinates: Joi.object({
      lat: Joi.number()
        .min(-90)
        .max(90)
        .optional()
        .messages({
          'number.min': 'Latitud inválida',
          'number.max': 'Latitud inválida'
        }),

      lng: Joi.number()
        .min(-180)
        .max(180)
        .optional()
        .messages({
          'number.min': 'Longitud inválida',
          'number.max': 'Longitud inválida'
        })
    }).optional()
  }).required().messages({
    'any.required': 'La dirección de entrega es requerida'
  }),

  paymentMethod: Joi.string()
    .valid('cash', 'card', 'mercadopago', 'nequi', 'daviplata')
    .required()
    .messages({
      'any.only': 'Método de pago inválido',
      'any.required': 'El método de pago es requerido'
    }),

  notes: Joi.string()
    .max(300)
    .trim()
    .optional()
    .messages({
      'string.max': 'Las notas no pueden exceder 300 caracteres'
    }),

  scheduledTime: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.min': 'La hora programada debe ser en el futuro'
    })
});

// Validación para crear item del menú
export const createMenuItemSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido'
    }),

  description: Joi.string()
    .max(300)
    .trim()
    .optional()
    .messages({
      'string.max': 'La descripción no puede exceder 300 caracteres'
    }),

  price: Joi.number()
    .min(0)
    .precision(2)
    .required()
    .messages({
      'number.base': 'El precio debe ser un número',
      'number.min': 'El precio debe ser positivo',
      'any.required': 'El precio es requerido'
    }),

  category: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'La categoría es requerida',
      'any.required': 'La categoría es requerida'
    }),

  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'La URL de la imagen debe ser válida'
    }),

  isAvailable: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'isAvailable debe ser true o false'
    }),

  isVegetarian: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'isVegetarian debe ser true o false'
    }),

  isSpicy: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'isSpicy debe ser true o false'
    }),

  preparationTime: Joi.number()
    .integer()
    .min(1)
    .max(120)
    .optional()
    .messages({
      'number.base': 'El tiempo de preparación debe ser un número',
      'number.integer': 'El tiempo de preparación debe ser un número entero',
      'number.min': 'El tiempo de preparación debe ser al menos 1 minuto',
      'number.max': 'El tiempo de preparación no puede exceder 120 minutos'
    })
});

// Validación para confirmar pago
export const confirmPaymentSchema = Joi.object({
  transactionId: Joi.string()
    .required()
    .messages({
      'string.empty': 'El ID de transacción es requerido',
      'any.required': 'El ID de transacción es requerido'
    }),

  status: Joi.string()
    .valid('APPROVED', 'DECLINED', 'ERROR', 'PENDING')
    .required()
    .messages({
      'any.only': 'Estado de pago inválido',
      'any.required': 'El estado del pago es requerido'
    }),

  amount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .messages({
      'number.min': 'El monto debe ser positivo',
      'number.precision': 'El monto debe tener máximo 2 decimales'
    }),

  currency: Joi.string()
    .length(3)
    .uppercase()
    .optional()
    .messages({
      'string.length': 'La moneda debe tener 3 caracteres'
    }),

  reference: Joi.string()
    .optional()
    .messages({
      'string.base': 'La referencia debe ser una cadena'
    }),

  paymentMethod: Joi.string()
    .valid('cash', 'card', 'nequi', 'daviplata', 'mercadopago', 'wompi', 'stripe')
    .optional()
    .messages({
      'any.only': 'Método de pago inválido'
    })
});

// Validación para crear pago
export const createPaymentSchema = Joi.object({
  orderId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'El ID de la orden es requerido',
      'string.uuid': 'ID de orden inválido',
      'any.required': 'El ID de la orden es requerido'
    }),

  paymentMethod: Joi.string()
    .valid('cash', 'card', 'nequi', 'daviplata', 'mercadopago', 'wompi', 'stripe')
    .required()
    .messages({
      'any.only': 'Método de pago inválido',
      'any.required': 'El método de pago es requerido'
    }),

  provider: Joi.string()
    .valid('wompi', 'stripe', 'internal')
    .optional()
    .messages({
      'any.only': 'Proveedor de pago inválido'
    })
});

// Validación para actualizar estado de pago
export const updatePaymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'PROCESSING', 'APPROVED', 'DECLINED', 'FAILED', 'CANCELLED', 'REFUNDED')
    .required()
    .messages({
      'any.only': 'Estado de pago inválido',
      'any.required': 'El estado del pago es requerido'
    }),

  transactionId: Joi.string()
    .optional()
    .messages({
      'string.empty': 'El ID de transacción no puede estar vacío'
    }),

  amount: Joi.number()
    .min(0)
    .precision(2)
    .optional()
    .messages({
      'number.min': 'El monto debe ser positivo',
      'number.precision': 'El monto debe tener máximo 2 decimales'
    })
});

// Middleware validador para esquemas específicos
export const validateRegister = validateJoi(registerSchema);
export const validateLogin = validateJoi(loginSchema);
export const validateCreateOrder = validateJoi(createOrderSchema);
export const validateCreateMenuItem = validateJoi(createMenuItemSchema);
export const validateConfirmPayment = validateJoi(confirmPaymentSchema);
export const validateCreatePayment = validateJoi(createPaymentSchema);
export const validatePaymentStatus = validateJoi(updatePaymentStatusSchema);