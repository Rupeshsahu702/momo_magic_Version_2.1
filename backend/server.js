require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve public folder if exists (optional)
app.use('/images', express.static('images')); // Serve images from backend/images

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (includes ngrok and dev tunnels)
        methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
        credentials: true,
        allowedHeaders: ["*"]
    },
    // Prioritize polling for ngrok free tier (blocks WebSockets)
    transports: ['polling', 'websocket'],
    allowEIO3: true // Support older Engine.IO clients
});

// Attach io to app so controllers can access it for WebSocket emissions
app.set('io', io);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Initialize Socket Handler
socketHandler(io);

// Basic Route
app.get('/', (req, res) => {
    res.send('Momo Magic Backend is Running');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
