# Momo Magic - Backend

A robust Node.js/Express backend API for restaurant management, featuring real-time order tracking, inventory management, employee attendance, sales analytics, and integrated image upload to Cloudflare R2.

## 🚀 Tech Stack

### Core Technologies

- **Node.js** - JavaScript runtime environment
- **Express 4.19.2** - Fast, minimalist web framework
- **MongoDB** (via Mongoose 8.3.1) - NoSQL database for data persistence
- **Socket.IO 4.7.5** - Real-time bidirectional event-based communication

### Authentication & Security

- **bcryptjs 3.0.3** - Password hashing
- **jsonwebtoken 9.0.3** - JWT token generation and validation
- **cors 2.8.5** - Cross-Origin Resource Sharing middleware

### File Handling & Cloud Storage

- **Multer 2.0.2** - Multipart/form-data file upload middleware
- **@aws-sdk/client-s3 3.958.0** - AWS SDK for Cloudflare R2 integration
- **csv-parser 3.2.0** - CSV file parsing for bulk imports
- **json2csv 6.0.0** - Export data to CSV format

### Additional Utilities

- **dotenv 16.4.5** - Environment variable management
- **axios 1.13.2** - HTTP client for external API calls
- **nodemon 3.1.0** (dev) - Auto-restart server on file changes

---

## 📂 Project Structure

```
backend/
├── config/
│   ├── db.js                  # MongoDB connection configuration
│   └── r2Config.js            # Cloudflare R2 (S3) configuration
├── controllers/
│   ├── adminController.js     # Admin authentication & management
│   ├── customerController.js  # Customer profile operations
│   ├── employeeController.js  # Employee CRUD & attendance
│   ├── inventoryController.js # Inventory management
│   ├── menuController.js      # Menu CRUD, CSV import, categories
│   ├── orderController.js     # Order management, payments, bills
│   ├── salesController.js     # Sales analytics & reporting
│   └── uploadController.js    # Image upload to R2
├── middleware/
│   └── authMiddleware.js      # JWT authentication middleware
├── models/
│   ├── adminModel.js          # Admin schema
│   ├── attendanceModel.js     # Employee attendance schema
│   ├── billModel.js           # Bill/invoice schema
│   ├── customerModel.js       # Customer profile schema
│   ├── employeeModel.js       # Employee schema
│   ├── inventoryModel.js      # Inventory item schema
│   ├── menuModel.js           # Menu item schema
│   ├── orderModel.js          # Order schema with status tracking
│   ├── otpLogModel.js         # OTP verification logs
│   └── salesModel.js          # Sales analytics schema
├── routes/
│   ├── adminRoutes.js         # /api/admin routes
│   ├── employeeRoutes.js      # /api/employees routes
│   ├── inventoryRoutes.js     # /api/inventory routes
│   ├── menuRoutes.js          # /api/menu routes
│   ├── orderRoutes.js         # /api/orders routes
│   ├── salesRoutes.js         # /api/sales routes
│   ├── uploadRoutes.js        # /api/upload routes
│   └── userRoutes.js          # /api/users routes (customers)
├── services/
│   ├── otpService.js          # OTP generation & verification
│   └── imageUploadService.js  # R2 image upload logic
├── socket/
│   └── socketHandler.js       # Socket.IO event handlers
├── utils/
│   └── csvParser.js           # CSV parsing utilities
├── .env                       # Environment variables (not tracked)
├── .gitignore
├── server.js                  # Application entry point
├── seedAdmin.js               # Script to seed admin users
├── seedFullMenu.js            # Script to seed menu items
├── menu.md                    # Menu categories and items reference
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/momo_magic_v2
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/momo_magic_v2

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Cloudflare R2 Configuration (S3-Compatible)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# OTP Service Configuration (Optional - for SMS/Email)
OTP_SERVICE_API_KEY=your_otp_service_api_key
OTP_EXPIRY_MINUTES=10
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `R2_ACCOUNT_ID` | Cloudflare account ID | Yes (for image uploads) |
| `R2_ACCESS_KEY_ID` | R2 access key ID | Yes (for image uploads) |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | Yes (for image uploads) |
| `R2_BUCKET_NAME` | R2 bucket name | Yes (for image uploads) |
| `R2_PUBLIC_URL` | Public URL for uploaded images | Yes (for image uploads) |
| `OTP_SERVICE_API_KEY` | Third-party OTP service API key | No (for password reset) |

> **Security Warning:** Never commit the `.env` file to version control. Keep secrets secure!

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** package manager
- **Cloudflare R2** account (for image uploads)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd momo_magic_Version_2/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the backend directory and add all required environment variables (see [Environment Variables](#⚙️-environment-variables) section).

### Step 4: Start MongoDB

**Local MongoDB:**

```bash
mongod
```

**MongoDB Atlas:**
Ensure your connection string is correctly set in the `.env` file.

### Step 5: Seed Initial Data (Optional)

```bash
# Seed admin user
node seedAdmin.js

# Seed menu items
node seedFullMenu.js
```

### Step 6: Start the Server

**Development Mode (with auto-restart):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The server will start at `http://localhost:5000`.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the server in production mode |
| `npm run dev` | Run the server with nodemon (auto-restart on changes) |
| `node seedAdmin.js` | Seed initial admin user to the database |
| `node seedFullMenu.js` | Seed menu items to the database |

---

## 🌐 API Endpoints

### Base URL

```
http://localhost:5000/api
```

---

### 🔐 Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/login` | Admin login with credentials | No |
| `POST` | `/register` | Register a new admin | No |
| `POST` | `/forgot-password` | Request OTP for password reset | No |
| `POST` | `/verify-otp` | Verify OTP and reset password | No |
| `GET` | `/profile` | Get admin profile details | Yes |
| `PUT` | `/profile` | Update admin profile | Yes |

**Example Request:**

```bash
# Admin Login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890", "password": "admin123"}'
```

**Example Response:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Admin User",
    "phone": "1234567890",
    "email": "admin@momomagic.com"
  }
}
```

---

### 👥 Customer Routes (`/api/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/register` | Create a customer profile | No |
| `GET` | `/:id` | Get customer by ID | No |
| `PUT` | `/:id` | Update customer profile | No |
| `DELETE` | `/:id` | Delete customer profile | No |

---

### 🍽️ Menu Routes (`/api/menu`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all menu items | No |
| `GET` | `/:id` | Get menu item by ID | No |
| `GET` | `/categories` | Get available categories with items | No |
| `POST` | `/` | Add new menu item | Yes |
| `PUT` | `/:id` | Update menu item | Yes |
| `DELETE` | `/:id` | Delete menu item | Yes |
| `POST` | `/import-csv` | Bulk import menu from CSV | Yes |

**Menu Categories:**

- Momos
- Fried Momos
- Tandoori Momos
- Peri Peri Momos
- Fries
- Burgers
- Chopsuey
- Chinese
- Rolls
- Fried Rice
- Noodles
- Beverages

**Example Request:**

```bash
# Get all menu items
curl http://localhost:5000/api/menu
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Veg Steamed Momos",
      "category": "Momos",
      "description": "Delicious vegetable dumplings",
      "price": 50,
      "isAvailable": true,
      "imageLink": "https://images.r2.dev/veg-momos.jpg",
      "preparationTime": 15
    }
  ]
}
```

---

### 📦 Inventory Routes (`/api/inventory`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all inventory items | Yes |
| `GET` | `/:id` | Get inventory item by ID | Yes |
| `POST` | `/` | Add new inventory item | Yes |
| `PUT` | `/:id` | Update inventory item | Yes |
| `DELETE` | `/:id` | Delete inventory item | Yes |
| `PUT` | `/:id/stock` | Update stock quantity | Yes |

---

### 📋 Order Routes (`/api/orders`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/` | Place a new order | No |
| `GET` | `/` | Get all orders | Yes |
| `GET` | `/:id` | Get order by ID | No |
| `GET` | `/session/:sessionId` | Get orders by session ID | No |
| `PUT` | `/:id/status` | Update order status | Yes |
| `DELETE` | `/:id` | Cancel/delete order | Yes |
| `POST` | `/request-payment` | Request payment/bill | No |
| `GET` | `/payments` | Get all payment requests | Yes |
| `PUT` | `/billing-status/:id` | Update billing status | Yes |
| `GET` | `/bills` | Get all bills | Yes |

**Order Status Flow:**

1. `Pending` - Order received, awaiting confirmation
2. `Preparing` - Order is being prepared in the kitchen
3. `Ready` - Order is ready for pickup/delivery
4. `Delivered` - Order has been delivered to the customer
5. `Cancelled` - Order was cancelled

**Billing Status:**

- `Unpaid` - Bill generated, payment not received
- `Pending Payment` - Customer requested payment
- `Paid` - Payment completed

**Example Request:**

```bash
# Place a new order
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_123456",
    "items": [
      {
        "menuItem": "64f1a2b3c4d5e6f7g8h9i0j1",
        "name": "Veg Steamed Momos",
        "quantity": 2,
        "price": 50,
        "subtotal": 100
      }
    ],
    "totalAmount": 100,
    "customerName": "John Doe",
    "tableNumber": "5"
  }'
```

---

### 👤 Employee Routes (`/api/employees`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all employees | Yes |
| `GET` | `/:id` | Get employee by ID | Yes |
| `POST` | `/` | Add new employee | Yes |
| `PUT` | `/:id` | Update employee details | Yes |
| `DELETE` | `/:id` | Delete employee | Yes |
| `POST` | `/attendance` | Mark attendance | Yes |
| `GET` | `/attendance/:employeeId` | Get attendance records | Yes |

---

### 📊 Sales Routes (`/api/sales`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/stats` | Get aggregated stats (revenue, orders, customers) | Yes |
| `GET` | `/top-items` | Get top selling menu items | Yes |
| `GET` | `/least-items` | Get least selling menu items | Yes |
| `GET` | `/peak-hours` | Get peak order hours (avg for week/month) | Yes |
| `GET` | `/revenue` | Get revenue data by day | Yes |
| `GET` | `/recent` | Get recent sales activity | Yes |
| `GET` | `/revenue-by-hour` | Get hourly/daily revenue breakdown | Yes |
| `GET` | `/new-customers` | Get new customer acquisition by day | Yes |
| `GET` | `/popular-combos` | Get popular food item combinations | Yes |
| `GET` | `/growth-metrics` | Get growth % for KPIs vs previous period | Yes |

**Query Parameters:**

All endpoints accept a `period` query parameter:

- `today` - Current day data
- `week` - Last 7 days (with daily breakdown and averages)
- `month` - Current month (with daily breakdown and averages)

**Example Request:**

```bash
# Get revenue by hour for today
curl "http://localhost:5000/api/sales/revenue-by-hour?period=today" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get weekly peak hours (averaged)
curl "http://localhost:5000/api/sales/peak-hours?period=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response (Revenue by Hour - Today):**

```json
{
  "success": true,
  "data": [
    { "hour": 9, "revenue": 0, "orderCount": 0 },
    { "hour": 10, "revenue": 1250.50, "orderCount": 8 },
    { "hour": 11, "revenue": 890.00, "orderCount": 5 },
    ...
  ],
  "type": "hourly"
}
```

**Example Response (Revenue by Hour - Week/Month):**

```json
{
  "success": true,
  "data": [
    { "year": 2024, "month": 12, "day": 20, "dayOfWeek": 6, "revenue": 4500.00, "orderCount": 28, "date": "2024-12-20" },
    { "year": 2024, "month": 12, "day": 21, "dayOfWeek": 7, "revenue": 5200.00, "orderCount": 35, "date": "2024-12-21" },
    ...
  ],
  "type": "daily",
  "period": "week"
}
```

**Timezone Handling:**

All time-based aggregations use **IST (India Standard Time, UTC+5:30)**. Timestamps stored in UTC are automatically converted to IST for:

- Hourly revenue breakdown
- Peak order hours
- New customer aggregation by day

---

### 📤 Upload Routes (`/api/upload`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/image` | Upload image to Cloudflare R2 | Yes |
| `DELETE` | `/image/:filename` | Delete image from R2 | Yes |

**Example Request:**

```bash
# Upload image (multipart/form-data)
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Example Response:**

```json
{
  "success": true,
  "imageUrl": "https://your-bucket.r2.dev/uploads/1640995200000-image.jpg"
}
```

---

## 🔌 Socket.IO Events

### Server → Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `new-order` | New order placed | `{ orderId, sessionId, items, totalAmount, tableNumber }` |
| `order-status-update` | Order status changed | `{ orderId, status, updatedAt }` |
| `payment-request` | Customer requested payment | `{ orderId, sessionId, amount, customerName }` |
| `billing-status-update` | Billing status changed | `{ orderId, billingStatus, paidAt }` |

### Client → Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join-admin` | Admin joins admin room | `{ adminId }` |
| `join-session` | Customer joins session room | `{ sessionId }` |
| `leave-session` | Customer leaves session room | `{ sessionId }` |

**Example Socket.IO Client (Admin):**

```javascript
const socket = io('http://localhost:5000');

// Join admin room to receive order notifications
socket.emit('join-admin', { adminId: 'admin123' });

// Listen for new orders
socket.on('new-order', (orderData) => {
  console.log('New order received:', orderData);
  // Update admin panel UI
});
```

**Example Socket.IO Client (Customer):**

```javascript
const socket = io('http://localhost:5000');

// Join session room to receive order updates
socket.emit('join-session', { sessionId: 'session_123456' });

// Listen for order status updates
socket.on('order-status-update', (update) => {
  console.log('Order status:', update.status);
  // Update customer UI
});
```

---

## 📊 Database Models

### Admin Model

- `name` - Admin full name
- `email` - Admin email address
- `phone` - Admin phone number (unique)
- `password` - Hashed password (bcrypt)
- `role` - Admin role (default: "admin")

### Menu Model

- `name` - Menu item name
- `category` - Category (Momos, Burgers, etc.)
- `description` - Item description
- `price` - Item price (₹)
- `isAvailable` - Availability status
- `imageLink` - Image URL from R2
- `preparationTime` - Estimated prep time (minutes)

### Order Model

- `sessionId` - Customer session identifier
- `items` - Array of ordered items with quantity and subtotal
- `totalAmount` - Total order amount
- `status` - Order status (Pending, Preparing, Ready, Delivered, Cancelled)
- `billingStatus` - Payment status (Unpaid, Pending Payment, Paid)
- `customerName` - Customer name
- `customerPhone` - Customer contact number
- `tableNumber` - Table number
- `orderDate` - Order timestamp
- `paidAt` - Payment timestamp

### Inventory Model

- `ingredientName` - Inventory item name
- `category` - Inventory category
- `quantity` - Current stock quantity
- `unit` - Measurement unit (kg, liters, pieces)
- `reorderLevel` - Minimum stock threshold
- `lastRestocked` - Last restock date

### Employee Model

- `name` - Employee full name
- `phone` - Contact number
- `email` - Email address
- `position` - Job role (Chef, Waiter, Manager)
- `salary` - Monthly salary
- `dateOfJoining` - Joining date
- `isActive` - Employment status

### Bill Model

- `orderId` - Reference to Order
- `sessionId` - Customer session
- `items` - Itemized bill details
- `subtotal` - Amount before taxes
- `tax` - Tax amount
- `totalAmount` - Final amount
- `billingStatus` - Payment status
- `createdAt` - Bill generation timestamp
- `paidAt` - Payment timestamp

---

## 🔒 Authentication Middleware

All protected routes use JWT authentication:

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Usage in Routes:**

```javascript
router.get('/orders', authMiddleware, orderController.getAllOrders);
```

**Frontend Request:**

```javascript
axios.get('/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

## 🖼️ Image Upload (Cloudflare R2)

### Setup

1. Create a Cloudflare R2 bucket
2. Generate API keys (Access Key ID and Secret Access Key)
3. Configure `.env` with R2 credentials
4. Set bucket to public or configure custom domain

### Upload Flow

1. Frontend sends image via `multipart/form-data`
2. Multer middleware processes the file
3. Backend uploads to R2 using AWS SDK v3
4. Public URL is returned and saved to the database

### Example Upload Code

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const uploadToR2 = async (file) => {
  const fileName = `${Date.now()}-${file.originalname}`;
  
  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `uploads/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  return `${process.env.R2_PUBLIC_URL}/uploads/${fileName}`;
};
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Test server health
curl http://localhost:5000/

# Get all menu items
curl http://localhost:5000/api/menu

# Admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "1234567890", "password": "admin123"}'
```

### Using Postman

1. Import the API collection (if available)
2. Set base URL to `http://localhost:5000/api`
3. Configure authorization headers for protected routes

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **MongoDB Connection Failed**

- **Error:** `MongooseServerSelectionError: connect ECONNREFUSED`
- **Solution:** Ensure MongoDB is running (`mongod`) or check your `MONGO_URI` connection string

#### 2. **JWT Authentication Error**

- **Error:** `JsonWebTokenError: invalid token`
- **Solution:** Verify `JWT_SECRET` in `.env` matches the token generation secret

#### 3. **R2 Upload Error**

- **Error:** `CredentialsProviderError`
- **Solution:** Double-check R2 credentials in `.env` (Account ID, Access Key, Secret Key)

#### 4. **Socket.IO Connection Refused**

- **Error:** `WebSocket connection failed`
- **Solution:** Ensure backend server is running and CORS is configured properly

#### 5. **Port Already in Use**

- **Error:** `Error: listen EADDRINUSE: address already in use :::5000`
- **Solution:** Kill the process using port 5000 or change the `PORT` in `.env`

```bash
# Find process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Find process on port 5000 (Linux/Mac)
lsof -i :5000
kill -9 <PID>
```

---

## 📝 Development Guidelines

### Code Style

- Follow the **Senior Software Engineer** rules:
  - Use descriptive variable names (no abbreviations)
  - Boolean variables: prefix with `is`, `has`, `can`, `should`
  - Function names: start with verbs (e.g., `getUserById`, `updateOrderStatus`)
  - Comments explain **why**, not **what**
  - Use early returns to avoid deep nesting

### Error Handling

```javascript
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find({ isAvailable: true });
    
    // Early return if no items found
    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No menu items available' 
      });
    }

    res.status(200).json({ success: true, data: menuItems });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching menu' 
    });
  }
};
```

### Constants and Magic Numbers

```javascript
// Bad - Magic numbers
if (stockLevel < 10) { /* ... */ }

// Good - Named constants
const MINIMUM_STOCK_THRESHOLD = 10;
if (stockLevel < MINIMUM_STOCK_THRESHOLD) { /* ... */ }
```

---

## 🚀 Deployment

### Deploying to Production

#### 1. **Environment Configuration**

- Set `NODE_ENV=production` in `.env`
- Update `MONGO_URI` to production database
- Use strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
- Configure production R2 credentials

#### 2. **Build & Run**

```bash
# Install production dependencies only
npm install --production

# Start the server
npm start
```

#### 3. **Process Management (PM2)**

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server.js --name "momo-magic-backend"

# Automatically restart on reboot
pm2 startup
pm2 save
```

#### 4. **Reverse Proxy (Nginx)**

```nginx
server {
    listen 80;
    server_name api.momomagic.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📦 Dependencies Overview

### Production Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework for Node.js |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT token management |
| `socket.io` | Real-time communication |
| `@aws-sdk/client-s3` | Cloudflare R2 integration |
| `multer` | File upload handling |
| `cors` | Cross-origin resource sharing |
| `csv-parser` | CSV file parsing |
| `json2csv` | CSV export |

---

## 🔗 Related Documentation

- [Frontend README](../frontend/README.md) - Frontend application documentation
- [Menu Categories](./menu.md) - Complete menu structure and items
- [Seed Scripts](#seed-scripts) - Database seeding documentation

---
