/**
 * Socket Handler - Manages all WebSocket connections and events.
 * Handles room management for admin notifications and real-time order updates.
 */

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log(`User Connected: ${socket.id}`);

        // Join a specific room (for table-specific or role-specific updates)
        socket.on('join_room', (data) => {
            socket.join(data);
            console.log(`User with ID: ${socket.id} joined room: ${data}`);
        });

        // Admin joins the admin room to receive new order notifications
        socket.on('admin:join', () => {
            socket.join('admin_room');
            console.log(`Admin joined admin_room: ${socket.id}`);
        });

        // Customer joins their table room for order updates
        socket.on('customer:join', (tableNumber) => {
            const tableRoom = `table_${tableNumber}`;
            socket.join(tableRoom);
            console.log(`Customer joined ${tableRoom}: ${socket.id}`);
        });

        // Handle manual order status update from client (backup for REST API)
        socket.on('order:updateStatus', (data) => {
            const { orderId, status } = data;
            // Broadcast to all clients that order status has changed
            io.emit('order:statusUpdate', { orderId, status });
            console.log(`Order ${orderId} status updated to ${status}`);
        });

        // Legacy message handling
        socket.on('send_message', (data) => {
            socket.to(data.room).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('User Disconnected', socket.id);
        });
    });
};

module.exports = socketHandler;
