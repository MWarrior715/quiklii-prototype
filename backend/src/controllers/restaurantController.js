import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Restaurant } from '../models/index.js';


/**
 * Obtener todos los restaurantes
 * @route GET /api/v1/restaurants
 * @access Public
 */
export const getAllRestaurants = async (req, res) => {
  try {
    console.log('🔍 [getAllRestaurants] Query params:', req.query);
    const {
      category,
      minRating,
      search,
      sortBy = 'rating',
      order = 'DESC',
      limit = 20,
      page = 1
    } = req.query;

    // Construir filtros
    const where = { isActive: true };
    console.log('🔍 [getAllRestaurants] Filtros iniciales:', where);

    if (category) {
      where.category = category;
      console.log('🔍 [getAllRestaurants] Filtro categoría agregado:', category);
    }

    if (minRating) {
      where.rating = { [Op.gte]: parseFloat(minRating) };
      console.log('🔍 [getAllRestaurants] Filtro rating agregado:', minRating);
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { category: { [Op.like]: `%${search}%` } }
      ];
      console.log('🔍 [getAllRestaurants] Filtro búsqueda agregado:', search);
    }

    // Paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    console.log('🔍 [getAllRestaurants] Paginación - limit:', limit, 'offset:', offset);

    // Ordenamiento
    const validSortFields = ['name', 'rating', 'deliveryTime', 'deliveryFee', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'rating';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    console.log('🔍 [getAllRestaurants] Ordenamiento - field:', sortField, 'order:', sortOrder);

    console.log('🔍 [getAllRestaurants] Ejecutando consulta con where:', where);
    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where,
      order: [[sortField, sortOrder]],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('🔍 [getAllRestaurants] Resultados - count:', count, 'restaurants:', restaurants.length);
    console.log('🔍 [getAllRestaurants] Primer restaurante (si existe):', restaurants[0]);

    res.json({
      success: true,
      message: 'Restaurantes obtenidos exitosamente',
      data: {
        restaurants,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ [getAllRestaurants] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener un restaurante por ID
 * @route GET /api/v1/restaurants/:id
 * @access Public
 */
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    if (!restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no disponible'
      });
    }

    res.json({
      success: true,
      message: 'Restaurante obtenido exitosamente',
      data: { restaurant }
    });

  } catch (error) {
    console.error('Error obteniendo restaurante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear nuevo restaurante
 * @route POST /api/v1/restaurants
 * @access Private (Admin)
 */
export const createRestaurant = async (req, res) => {
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

    const {
      name,
      address,
      phone,
      imageUrl,
      category,
      rating = 0.0,
      description,
      deliveryTime = 30,
      deliveryFee = 0.00,
      minOrder = 0.00,
      openingTime,
      closingTime
    } = req.body;

    // Verificar si el restaurante ya existe por nombre
    const existingRestaurant = await Restaurant.findOne({ where: { name } });
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un restaurante con ese nombre'
      });
    }

    // Verificar si el teléfono ya está en uso
    if (phone) {
      const existingPhone = await Restaurant.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un restaurante con ese número de teléfono'
        });
      }
    }

    // Crear nuevo restaurante
    const newRestaurant = await Restaurant.create({
      name,
      address,
      phone: phone || null,
      imageUrl: imageUrl || null,
      category,
      rating: parseFloat(rating),
      description: description || null,
      deliveryTime: parseInt(deliveryTime),
      deliveryFee: parseFloat(deliveryFee),
      minOrder: parseFloat(minOrder),
      openingTime: openingTime || null,
      closingTime: closingTime || null
    });

    res.status(201).json({
      success: true,
      message: 'Restaurante creado exitosamente',
      data: { restaurant: newRestaurant }
    });

  } catch (error) {
    console.error('Error creando restaurante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar restaurante
 * @route PUT /api/v1/restaurants/:id
 * @access Private (Admin/Owner)
 */
export const updateRestaurant = async (req, res) => {
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

    const { id } = req.params;
    const updateData = req.body;

    // Buscar restaurante
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    // Verificar duplicados si se actualiza nombre
    if (updateData.name && updateData.name !== restaurant.name) {
      const existingName = await Restaurant.findOne({
        where: {
          name: updateData.name,
          id: { [Op.ne]: id }
        }
      });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un restaurante con ese nombre'
        });
      }
    }

    // Verificar duplicados si se actualiza teléfono
    if (updateData.phone && updateData.phone !== restaurant.phone) {
      const existingPhone = await Restaurant.findOne({
        where: {
          phone: updateData.phone,
          id: { [Op.ne]: id }
        }
      });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un restaurante con ese número de teléfono'
        });
      }
    }

    // Actualizar restaurante
    await restaurant.update(updateData);

    // Obtener restaurante actualizado
    const updatedRestaurant = await Restaurant.findByPk(id);

    res.json({
      success: true,
      message: 'Restaurante actualizado exitosamente',
      data: { restaurant: updatedRestaurant }
    });

  } catch (error) {
    console.error('Error actualizando restaurante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar restaurante (soft delete)
 * @route DELETE /api/v1/restaurants/:id
 * @access Private (Admin)
 */
export const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado'
      });
    }

    // Soft delete - marcar como inactivo
    await restaurant.update({ isActive: false });

    res.json({
      success: true,
      message: 'Restaurante eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando restaurante:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener restaurantes por categoría
 * @route GET /api/v1/restaurants/category/:category
 * @access Public
 */
export const getRestaurantsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;
    console.log('🔍 [getRestaurantsByCategory] Params:', { category, limit });

    console.log('🔍 [getRestaurantsByCategory] Llamando Restaurant.findByCategory');
    const restaurants = await Restaurant.findByCategory(category);
    console.log('🔍 [getRestaurantsByCategory] Resultados:', restaurants.length, 'restaurantes');

    const limitedRestaurants = restaurants.slice(0, parseInt(limit));
    console.log('🔍 [getRestaurantsByCategory] Después de limit:', limitedRestaurants.length);

    res.json({
      success: true,
      message: `Restaurantes de categoría "${category}" obtenidos exitosamente`,
      data: {
        restaurants: limitedRestaurants,
        category
      }
    });

  } catch (error) {
    console.error('❌ [getRestaurantsByCategory] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener restaurantes mejor calificados
 * @route GET /api/v1/restaurants/top-rated
 * @access Public
 */
export const getTopRatedRestaurants = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log('🔍 [getTopRatedRestaurants] Params:', { limit });

    console.log('🔍 [getTopRatedRestaurants] Llamando Restaurant.findTopRated');
    const restaurants = await Restaurant.findTopRated(parseInt(limit));
    console.log('🔍 [getTopRatedRestaurants] Resultados:', restaurants.length, 'restaurantes');

    res.json({
      success: true,
      message: 'Restaurantes mejor calificados obtenidos exitosamente',
      data: { restaurants }
    });

  } catch (error) {
    console.error('❌ [getTopRatedRestaurants] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
