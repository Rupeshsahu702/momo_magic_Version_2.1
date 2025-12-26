# Momo Magic - Frontend

A modern, responsive React-based restaurant management system frontend built with Vite, featuring real-time order tracking, customer ordering interface, and comprehensive admin dashboard.

## 🚀 Tech Stack

### Core Technologies

- **React 19.2.0** - Latest version for building the user interface
- **Vite 7.2.4** - Fast build tool and development server
- **React Router DOM 7.11.0** - Client-side routing
- **Axios 1.13.2** - HTTP client for API requests
- **Socket.IO Client 4.8.2** - Real-time bidirectional communication

### UI & Styling

- **TailwindCSS 4.1.18** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
  - Dialog, Dropdown Menu, Select, Checkbox, Switch, Tabs, Tooltip, Avatar, Label, Radio Group
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark mode support
- **Sonner** - Toast notifications

### Data Visualization

- **Chart.js 4.5.1** - Flexible charting library
- **react-chartjs-2** - React wrapper for Chart.js
- **Recharts 3.6.0** - Composable charting library

### Additional Libraries

- **react-barcode** - Barcode generation for orders/bills
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional className utilities

---

## 📂 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, and other media files
│   ├── components/        # Reusable UI components
│   │   ├── admin/         # Admin-specific components
│   │   ├── client/        # Customer-facing components
│   │   └── ui/            # Generic UI components (buttons, cards, etc.)
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx        # Admin authentication state
│   │   ├── CartContext.jsx        # Shopping cart state
│   │   ├── CustomerContext.jsx    # Customer profile state
│   │   └── OrderContext.jsx       # Order management state
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Layout components
│   │   ├── AdminLayout.jsx        # Admin panel wrapper
│   │   └── ClientLayout.jsx       # Customer interface wrapper
│   ├── lib/               # Utility functions
│   ├── pages/             # Route components
│   │   ├── admin/         # Admin panel pages
│   │   │   ├── Analytics.jsx
│   │   │   ├── OrderManagement.jsx
│   │   │   ├── MenuManagement.jsx
│   │   │   ├── InventoryManagement.jsx
│   │   │   ├── EmployeeManagement.jsx
│   │   │   ├── PaymentsManagement.jsx
│   │   │   ├── BillsManagement.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   └── client/        # Customer pages
│   │       ├── Home.jsx
│   │       ├── Menu.jsx
│   │       ├── MyCart.jsx
│   │       ├── MyOrder.jsx
│   │       ├── MyBill.jsx
│   │       ├── PreviousOrders.jsx
│   │       └── UserProfile.jsx
│   ├── services/          # API service modules
│   │   ├── adminService.js
│   │   ├── customerService.js
│   │   ├── employeeService.js
│   │   ├── inventoryService.js
│   │   ├── menuService.js
│   │   ├── orderService.js
│   │   ├── salesService.js
│   │   └── uploadService.js
│   ├── App.jsx            # Root component with routing
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── .gitignore
├── components.json        # shadcn/ui configuration
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── jsconfig.json          # JavaScript configuration
├── package.json
├── vite.config.js         # Vite configuration
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the frontend root directory:

```env
# Backend API Configuration
# Change this URL when deploying to production or switching servers
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Environment Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for REST API endpoints | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Socket.IO server URL for real-time updates | `http://localhost:5000` |

> **Note:** When deploying to production or using ngrok for tunneling, update these URLs accordingly.

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm** package manager
- Running backend server at `http://localhost:5000`

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd momo_magic_Version_2/frontend
```

### Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the frontend directory and add the required environment variables (see [Environment Variables](#⚙️-environment-variables) section).

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🎯 Key Features

### Customer Interface

- **🏠 Home Page** - Welcome page with restaurant branding and featured items
- **🍽️ Menu Browsing** - Browse menu items by category with search and filtering
- **🛒 Shopping Cart** - Add, remove, and modify items in the cart
- **📦 Order Tracking** - Real-time order status updates (Pending, Preparing, Ready, Delivered)
- **🧾 Billing** - View itemized bills with session-based organization
- **📱 User Profile** - Manage customer profile and preferences
- **📜 Order History** - View previous orders and reorder functionality

### Admin Dashboard

- **📊 Analytics** - Comprehensive real-time analytics dashboard
  - **Stats Cards**: Total Revenue, Total Orders, Avg. Order Value, Customer Repeat Rate with growth % indicators
  - **Enhanced Revenue Chart**: Hourly breakdown (Today) or Daily breakdown (Week/Month)
  - **Peak Order Times**: Bar chart showing average orders per hour (7-day average for weekly view)
  - **New Customers per Day**: Track customer acquisition over time
  - **Top & Least Selling Items**: Identify best and worst performers
  - **Popular Food Combos**: Analytics on frequently ordered item combinations
  - **Time Period Filters**: Today, This Week, This Month views
  - **Refresh Button**: Manual data refresh
  - **IST Timezone Support**: All times displayed in India Standard Time
- **📋 Order Management** - View, update, and manage customer orders with real-time notifications
- **💰 Payment Management** - Track payment requests, billing status (Paid/Unpaid/Pending)
- **🧾 Bill Management** - Generate, view, and manage customer bills
- **🍴 Menu Management**
  - Add, edit, delete menu items
  - CSV/Excel import for bulk menu updates
  - Image upload integration (Cloudflare R2)
  - Category and availability management
- **📦 Inventory Management** - Track stock levels, add/edit inventory items
- **👥 Employee Management**
  - Add, edit, remove employees
  - Track employee attendance with CSV import
  - Manage salaries and roles
- **👤 Admin Profile** - View and update admin account details
- **🔐 Authentication** - Secure login with JWT tokens and password reset via OTP

### Real-Time Features (Socket.IO)

- **🔔 Live Order Notifications** - Instant alerts for new orders in the admin panel
- **🔄 Order Status Updates** - Real-time status changes broadcast to customers
- **💳 Payment Request Notifications** - Admins receive payment requests immediately
- **📊 Live Dashboard Updates** - Order counts and metrics update automatically

---

## 🔐 Authentication & Authorization

### Admin Authentication

- **Login Flow**: Admin logs in via `/admin/login` with credentials stored in the database
- **JWT Tokens**: Access tokens stored in `localStorage` for session persistence
- **Protected Routes**: `ProtectedRoute` component guards all `/admin/*` routes
- **Password Reset**: OTP-based password recovery via registered phone number

### Customer Sessions

- **Session Management**: Unique session IDs for tracking orders and bills
- **Guest Checkout**: Customers can place orders without creating an account
- **Optional Profiles**: Customers can save their profile for faster checkout

---

## 🌐 API Integration

All API calls are centralized in the `src/services/` directory:

### Service Files

- **`adminService.js`** - Admin authentication (login, password reset)
- **`customerService.js`** - Customer profile management
- **`employeeService.js`** - Employee CRUD operations, attendance tracking
- **`inventoryService.js`** - Inventory management
- **`menuService.js`** - Menu item CRUD, category fetching, CSV import
- **`orderService.js`** - Order placement, status updates, payment requests
- **`salesService.js`** - Sales analytics and reporting
- **`uploadService.js`** - Image upload to Cloudflare R2

### Example API Call

```javascript
import { getMenuItems } from '@/services/menuService';

const fetchMenu = async () => {
  try {
    const response = await getMenuItems();
    console.log(response.data);
  } catch (error) {
    console.error('Failed to fetch menu:', error);
  }
};
```

---

## 🎨 Styling & Theming

### TailwindCSS Configuration

The project uses **TailwindCSS v4** with custom utility classes and responsive design patterns.

### Dark Mode Support

- Powered by `next-themes` package
- Toggle between light and dark modes
- Persistent theme selection stored in `localStorage`

### Component Library

- Built on **Radix UI** primitives for accessibility
- Custom styled components in `src/components/ui/`
- Consistent design tokens defined in `index.css`

---

## 🔔 Real-Time Updates (Socket.IO)

### Client-Side Socket Connection

The application establishes a Socket.IO connection on initialization:

```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);

// Listen for new order notifications (Admin)
socket.on('new-order', (orderData) => {
  console.log('New order received:', orderData);
});

// Listen for order status updates (Customer)
socket.on('order-status-update', (update) => {
  console.log('Order status changed:', update);
});
```

### Event List

| Event | Direction | Description |
|-------|-----------|-------------|
| `new-order` | Server → Admin | New order placed by customer |
| `order-status-update` | Server → Client | Order status changed |
| `payment-request` | Client → Admin | Customer requests payment/bill |
| `billing-status-update` | Server → Client | Payment status changed |

---

## 🧪 Development Guidelines

### Code Style

- Follow the **Senior Software Engineer** rules defined in user preferences
- Use descriptive variable names (no abbreviations like `ctx`, `res`, `val`)
- Boolean variables must be prefixed with `is`, `has`, `can`, or `should`
- Function names must start with a verb describing the effect
- Add comments explaining **why**, not **what**
- Use early returns to avoid deep nesting

### Component Structure

```jsx
/**
 * Brief description of what this component does
 */
const MyComponent = ({ prop1, prop2 }) => {
  // State declarations
  const [isLoading, setIsLoading] = useState(false);

  // Early returns for edge cases
  if (!prop1) {
    return <div>Loading...</div>;
  }

  // Main render logic
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default MyComponent;
```

### ESLint Configuration

Run linting before committing:

```bash
npm run lint
```

---

## 🚀 Building for Production

### Step 1: Build the Application

```bash
npm run build
```

This will create an optimized production build in the `dist/` directory.

### Step 2: Preview the Build

```bash
npm run preview
```

### Step 3: Deploy

Upload the contents of the `dist/` folder to your hosting provider (Vercel, Netlify, AWS S3, etc.).

### Production Environment Variables

Ensure the `.env` file points to the production backend URL:

```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_SOCKET_URL=https://your-backend-domain.com
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **API Connection Refused**

- **Cause**: Backend server is not running
- **Solution**: Start the backend server at `http://localhost:5000`

#### 2. **Socket.IO CORS Error**

- **Cause**: Backend CORS configuration doesn't allow frontend origin
- **Solution**: Update backend CORS settings or use matching URLs (localhost/ngrok)

#### 3. **Environment Variables Not Loading**

- **Cause**: `.env` file missing or incorrect variable names
- **Solution**: Ensure all variables are prefixed with `VITE_` and restart dev server

#### 4. **Build Fails**

- **Cause**: ESLint errors or missing dependencies
- **Solution**: Run `npm run lint` to identify issues, then `npm install`

---

## 📦 Dependencies Overview

### Production Dependencies

| Package | Purpose |
|---------|---------|
| `react` & `react-dom` | Core React library |
| `react-router-dom` | Client-side routing |
| `axios` | HTTP requests to backend API |
| `socket.io-client` | Real-time communication |
| `tailwindcss` | Utility-first CSS framework |
| `@radix-ui/*` | Accessible UI components |
| `lucide-react` | Icon library |
| `chart.js` & `recharts` | Data visualization |
| `react-barcode` | Barcode generation |
| `sonner` | Toast notifications |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | Vite plugin for React |
| `eslint` | Code linting |
| `tailwindcss` | CSS processing |
| `nodemon` | Auto-restart dev server |

## 🔗 Related Documentation

- [Backend README](../backend/README.md) - Backend API documentation
- [API Endpoints](../backend/README.md#-api-endpoints) - Complete API reference
- [Socket.IO Events](../backend/README.md#-socketio-events) - Real-time event documentation
