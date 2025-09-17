import { MenuItem } from '../models/index.js';
import { Restaurant } from '../models/index.js';
import { handleError } from '../utils/helpers.js';

// GET /api/v1/menu
export const getAllMenuItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const items = await MenuItem.findAndCountAll({
      limit,
      offset,
      include: [{
        model: Restaurant,
        attributes: ['id', 'name']
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: items.rows,
      total: items.count,
      currentPage: page,
      totalPages: Math.ceil(items.count / limit)
    });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/v1/menu/:id
export const getMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findByPk(id, {
      include: [{
        model: Restaurant,
        attributes: ['id', 'name']
      }]
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/v1/restaurants/:restaurantId/menu
export const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category } = req.query;

    const where = { restaurantId, available: true };
    if (category) {
      where.category = category;
    }

    const items = await MenuItem.findAll({
      where,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/v1/menu
export const createMenuItem = async (req, res) => {
  try {
    const newItem = await MenuItem.create(req.body);

    const itemWithRestaurant = await MenuItem.findByPk(newItem.id, {
      include: [{ model: Restaurant, attributes: ['id', 'name'] }]
    });

    res.status(201).json({ success: true, data: itemWithRestaurant });
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/v1/menu/:id
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    await item.update(req.body);

    const updatedItem = await MenuItem.findByPk(id, {
      include: [{ model: Restaurant, attributes: ['id', 'name'] }]
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/v1/menu/:id (soft delete)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByPk(id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item no encontrado' });
    }

    await item.update({ available: false });

    res.json({ success: true, message: 'Item eliminado correctamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/v1/menu/category/:category
export const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const items = await MenuItem.findAll({
      where: { category, available: true },
      include: [{ model: Restaurant, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/v1/menu/available
export const getAvailableMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      where: { available: true },
      include: [{ model: Restaurant, attributes: ['id', 'name'] }]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/v1/menu/on-sale
export const getMenuItemsOnSale = async (req, res) => {
  try {
    // ⚠️ En caso de que no exista findOnSale en el modelo, fallback:
    const items = await MenuItem.findAll({
      where: { onSale: true, available: true },
      include: [{ model: Restaurant, attributes: ['id', 'name'] }]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    handleError(res, error);
  }
};
