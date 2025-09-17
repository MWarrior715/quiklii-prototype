// Socket.io para actualizaciones en tiempo real de pedidos

export const initializeOrderSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔗 Cliente conectado: ${socket.id}`);

    // Usuario se une a una sala específica (por ID de usuario)
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 Usuario ${userId} se unió a su sala`);
    });

    // Restaurante se une a su sala
    socket.on('join_restaurant_room', (restaurantId) => {
      socket.join(`restaurant_${restaurantId}`);
      console.log(`🍽️ Restaurante ${restaurantId} se unió a su sala`);
    });

    // Repartidor se une a sala general de repartidores
    socket.on('join_delivery_room', (deliveryPersonId) => {
      socket.join('delivery_persons');
      socket.join(`delivery_${deliveryPersonId}`);
      console.log(`🚚 Repartidor ${deliveryPersonId} se unió a las salas`);
    });

    // Actualización de ubicación del repartidor
    socket.on('delivery_location_update', (data) => {
      const { orderId, deliveryPersonId, location } = data;
      
      // Emitir actualización de ubicación al usuario del pedido
      socket.broadcast.to(`order_${orderId}`).emit('delivery_location_updated', {
        orderId,
        location,
        timestamp: new Date()
      });

      console.log(`📍 Ubicación actualizada para pedido ${orderId}`);
    });

    // Manejo de desconexión
    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });

  return {
    // Notificar nuevo pedido al restaurante
    notifyNewOrder: (restaurantId, orderData) => {
      io.to(`restaurant_${restaurantId}`).emit('new_order', {
        message: 'Nuevo pedido recibido',
        order: orderData,
        timestamp: new Date()
      });
      console.log(`🔔 Nuevo pedido notificado al restaurante ${restaurantId}`);
    },

    // Notificar cambio de estado de pedido al usuario
    notifyOrderStatusChange: (userId, orderData) => {
      io.to(`user_${userId}`).emit('order_status_updated', {
        message: 'Estado de tu pedido actualizado',
        order: orderData,
        timestamp: new Date()
      });
      console.log(`📱 Estado de pedido actualizado para usuario ${userId}: ${orderData.status}`);
    },

    // Notificar pedido disponible a repartidores
    notifyDeliveryAvailable: (orderData) => {
      io.to('delivery_persons').emit('delivery_available', {
        message: 'Nuevo pedido disponible para entrega',
        order: {
          id: orderData.id,
          restaurantName: orderData.restaurant.name,
          restaurantAddress: orderData.restaurant.address,
          deliveryAddress: orderData.deliveryAddress,
          estimatedEarnings: orderData.deliveryFee,
          distance: orderData.estimatedDistance || 'N/A'
        },
        timestamp: new Date()
      });
      console.log(`🚚 Pedido disponible notificado a repartidores: ${orderData.id}`);
    },

    // Notificar asignación de repartidor
    notifyDeliveryAssigned: (userId, deliveryData) => {
      io.to(`user_${userId}`).emit('delivery_assigned', {
        message: 'Repartidor asignado a tu pedido',
        delivery: {
          deliveryPersonName: deliveryData.name,
          deliveryPersonPhone: deliveryData.phone,
          estimatedArrival: deliveryData.estimatedArrival
        },
        timestamp: new Date()
      });
      console.log(`🎯 Repartidor asignado notificado al usuario ${userId}`);
    },

    // Notificar entrega completada
    notifyDeliveryCompleted: (userId, orderData) => {
      io.to(`user_${userId}`).emit('delivery_completed', {
        message: '¡Tu pedido ha sido entregado!',
        order: orderData,
        timestamp: new Date()
      });
      console.log(`✅ Entrega completada notificada al usuario ${userId}`);
    },

    // Broadcast general (para mantenimiento, etc.)
    broadcast: (event, data) => {
      io.emit(event, {
        ...data,
        timestamp: new Date()
      });
      console.log(`📢 Broadcast enviado: ${event}`);
    }
  };
};
