import { validationResult } from 'express-validator';
import { User } from '../models/User.js';

/**
 * Obtener perfil del usuario logueado
 * @route GET /api/v1/users/profile
 * @access Private
 */
export const getProfile = async (req, res) => {
  try {
    // El usuario viene del middleware authenticate
    const user = req.user;

    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          profileImage: user.profileImage,
          address: user.address,
          favoriteRestaurants: user.favoriteRestaurants,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Actualizar perfil del usuario logueado
 * @route PATCH /api/v1/users/profile
 * @access Private
 */
export const updateProfile = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { name, phone, profileImage, address } = req.body;

    // Buscar el usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Preparar datos para actualizar (solo campos permitidos)
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) {
      // Verificar si el teléfono ya está en uso por otro usuario
      if (phone) {
        const existingUser = await User.findOne({ 
          where: { 
            phone,
            id: { [User.sequelize.Sequelize.Op.ne]: userId } 
          } 
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Este número de teléfono ya está en uso'
          });
        }
      }
      updateData.phone = phone;
    }
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (address !== undefined) updateData.address = address;

    // Actualizar usuario
    await user.update(updateData);

    // Obtener usuario actualizado
    const updatedUser = await User.findByPk(userId);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isEmailVerified: updatedUser.isEmailVerified,
          isPhoneVerified: updatedUser.isPhoneVerified,
          profileImage: updatedUser.profileImage,
          address: updatedUser.address,
          favoriteRestaurants: updatedUser.favoriteRestaurants,
          lastLoginAt: updatedUser.lastLoginAt,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener direcciones del usuario
 * @route GET /api/v1/users/addresses
 * @access Private
 */
export const getAddresses = async (req, res) => {
  try {
    const user = req.user;
    const addresses = user.address || [];

    res.json({
      success: true,
      message: 'Direcciones obtenidas exitosamente',
      data: {
        addresses
      }
    });

  } catch (error) {
    console.error('Error obteniendo direcciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Agregar nueva dirección
 * @route POST /api/v1/users/addresses
 * @access Private
 */
export const addAddress = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { street, city, state, zipCode, country, isDefault, label } = req.body;

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Obtener direcciones actuales
    const currentAddresses = user.address || [];

    // Crear nueva dirección
    const newAddress = {
      id: Date.now().toString(), // ID temporal simple
      street,
      city,
      state,
      zipCode,
      country: country || 'Colombia',
      isDefault: isDefault || false,
      label: label || 'Casa',
      createdAt: new Date().toISOString()
    };

    // Si esta dirección es la predeterminada, quitar el flag de las demás
    if (newAddress.isDefault) {
      currentAddresses.forEach(addr => addr.isDefault = false);
    }

    // Agregar nueva dirección
    const updatedAddresses = [...currentAddresses, newAddress];

    // Actualizar usuario
    await user.update({ address: updatedAddresses });

    res.status(201).json({
      success: true,
      message: 'Dirección agregada exitosamente',
      data: {
        address: newAddress,
        addresses: updatedAddresses
      }
    });

  } catch (error) {
    console.error('Error agregando dirección:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cambiar contraseña
 * @route PATCH /api/v1/users/change-password
 * @access Private
 */
export const changePassword = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Error en los datos proporcionados',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

    // Actualizar contraseña (se hasheará automáticamente por el hook beforeUpdate)
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Listar todos los usuarios (solo admin)
 * @route GET /api/v1/users
 * @access Private (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Excluir contraseña
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: {
        users,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
