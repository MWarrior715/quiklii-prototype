'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Datos de ejemplo para usuarios
    const users = [
      {
        id: crypto.randomUUID(),
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        phone: '+573001234567',
        password: await bcrypt.hash('password123', 12),
        role: 'customer',
        is_email_verified: false,
        is_phone_verified: true,
        profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        address: JSON.stringify({
          street: 'Carrera 15 #123-45',
          city: 'Bogotá',
          neighborhood: 'Zona Rosa'
        }),
        favorite_restaurants: JSON.stringify([]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'María García',
        email: 'maria.garcia@example.com',
        phone: '+573001234568',
        password: await bcrypt.hash('password123', 12),
        role: 'customer',
        is_email_verified: true,
        is_phone_verified: true,
        profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        address: JSON.stringify({
          street: 'Calle 72 #10-15',
          city: 'Bogotá',
          neighborhood: 'Chapinero'
        }),
        favorite_restaurants: JSON.stringify([]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        phone: '+573001234569',
        password: await bcrypt.hash('password123', 12),
        role: 'restaurant_owner',
        is_email_verified: true,
        is_phone_verified: true,
        profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        address: JSON.stringify({
          street: 'Carrera 7 #85-20',
          city: 'Bogotá',
          neighborhood: 'Centro'
        }),
        favorite_restaurants: JSON.stringify([]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Ana López',
        email: 'ana.lopez@example.com',
        phone: '+573001234570',
        password: await bcrypt.hash('password123', 12),
        role: 'admin',
        is_email_verified: true,
        is_phone_verified: true,
        profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        address: JSON.stringify({
          street: 'Calle 100 #15-30',
          city: 'Bogotá',
          neighborhood: 'Usaquén'
        }),
        favorite_restaurants: JSON.stringify([]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: crypto.randomUUID(),
        name: 'Pedro Sánchez',
        email: 'pedro.sanchez@example.com',
        phone: '+573001234571',
        password: await bcrypt.hash('password123', 12),
        role: 'delivery_person',
        is_email_verified: true,
        is_phone_verified: true,
        profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        address: JSON.stringify({
          street: 'Carrera 30 #45-67',
          city: 'Bogotá',
          neighborhood: 'Kennedy'
        }),
        favorite_restaurants: JSON.stringify([]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};