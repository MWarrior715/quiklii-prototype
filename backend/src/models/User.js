// backend/src/models/User.js
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

let User;

export function initUser(sequelize) {
  User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
      validate: {
        is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im // formato E.164 internacional
      }
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },

    role: {
      type: DataTypes.ENUM('customer', 'restaurant_owner', 'delivery_person', 'admin'),
      defaultValue: 'customer',
      allowNull: false
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_email_verified'
    },

    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_phone_verified'
    },

    profileImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'profile_image',
      validate: {
        isUrl: true
      }
    },

    address: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },

    favoriteRestaurants: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      field: 'favorite_restaurants'
    },

    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at'
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['email'] },
      {
        unique: true,
        fields: ['phone'],
        where: { phone: { [sequelize.Sequelize.Op.ne]: null } }
      },
      { fields: ['role'] }
    ]
  });

  // 🔹 Hooks (hash de password)
  User.beforeCreate(async (user) => {
    if (user.password) {
      const saltRounds = 12;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const saltRounds = 12;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  });

  // 🔹 Métodos de instancia
  User.prototype.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password; // ocultar password al serializar
    return values;
  };

  // 🔹 Métodos de clase
  User.findByEmail = async function (email) {
    return this.findOne({ where: { email, isActive: true } });
  };

  User.findByPhone = async function (phone) {
    return this.findOne({ where: { phone, isActive: true } });
  };

  return User;
}

export { User };