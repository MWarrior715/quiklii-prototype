import { Model, DataTypes } from 'sequelize';

class Payment extends Model {
  static associate(models) {
    Payment.belongsTo(models.Order, {
      foreignKey: 'orderId',
      as: 'order'
    });

    Payment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

export const initPayment = (sequelize) => {
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'COP',
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'nequi', 'daviplata', 'mercadopago', 'wompi', 'stripe'),
      allowNull: false
    },
    provider: {
      type: DataTypes.ENUM('wompi', 'stripe', 'internal'),
      defaultValue: 'internal',
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos adicionales del proveedor de pago (Wompi, Stripe, etc.)'
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    providerReference: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Referencia del proveedor de pago (Wompi, Stripe)'
    },
    providerResponse: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Respuesta completa del proveedor de pago'
    },
    retryCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Contador de reintentos de pago'
    },
    lastRetryAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha del último reintento'
    },
    webhookAttempts: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Historial de intentos de webhook'
    },
    fraudScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Puntuación de riesgo de fraude'
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true,
      comment: 'Nivel de riesgo del pago'
    },
    refundReason: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Razón de la devolución'
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Monto devuelto'
    },
    refundProcessedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de procesamiento de devolución'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadatos adicionales del pago'
    }
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true
  });

  return Payment;
};

export { Payment };