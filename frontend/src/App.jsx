import './index.css'
import { Route, Routes } from 'react-router-dom'

// Layouts
import ClientLayout from '@/layouts/ClientLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Client Pages
import Home from '@/pages/client/Home'
import Menu from '@/pages/client/Menu'
import MyCart from '@/pages/client/MyCart'
import MyOrder from '@/pages/client/MyOrder'
import MyBill from '@/pages/client/MyBill'
import PreviousOrders from '@/pages/client/PreviousOrders'
import UserProfile from '@/pages/client/UserProfile'

// Admin Pages
import Analytics from '@/pages/admin/Analytics'
import OrderManagement from '@/pages/admin/OrderManagement'
import MenuManagement from '@/pages/admin/MenuManagement'
import InventoryManagement from '@/pages/admin/InventoryManagement'
import EmployeeManagement from '@/pages/admin/EmployeeManagement'
import AddItem from '@/pages/admin/AddItem'
import AddNewEmployee from '@/pages/admin/AddNewEmployee'
import AddNewInventory from '@/pages/admin/AddNewInventory'
import EditInventory from '@/pages/admin/EditInventory'
import Profile from '@/pages/admin/Profile'
import EditMenu from './pages/admin/EditMenu'
import EditEmployee from './pages/admin/EditEmployee'
import AllAttendance from '@/pages/admin/AllAttendance'
import PaymentsManagement from '@/pages/admin/PaymentsManagement'
import BillsManagement from '@/pages/admin/BillsManagement'
import Login from './pages/admin/Login'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Client Routes */}
      <Route element={<ClientLayout />}>
        <Route path='/' element={<Home />} />
        <Route path='menu' element={<Menu />} />
        <Route path='mycart' element={<MyCart />} />
        <Route path='myorder' element={<MyOrder />} />
        <Route path='mybill' element={<MyBill />} />
        <Route path='previous-orders' element={<PreviousOrders />} />
        <Route path='profile' element={<UserProfile />} />
      </Route>

      <Route path='/admin/login' element={<Login />} />
      <Route element={<ProtectedRoute />}>
        {/* Admin Routes */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Analytics />} />
          <Route path='orders' element={<OrderManagement />} />
          <Route path='payments' element={<PaymentsManagement />} />
          <Route path='bills' element={<BillsManagement />} />
          <Route path='menu' element={<MenuManagement />} />
          <Route path='menu/add' element={<AddItem />} />
          <Route path='/admin/menu/edit/:id' element={<EditMenu />} />
          <Route path='inventory' element={<InventoryManagement />} />
          <Route path='inventory/add' element={<AddNewInventory />} />
          <Route path='inventory/edit/:id' element={<EditInventory />} />
          <Route path='employees' element={<EmployeeManagement />} />
          <Route path='employees/add' element={<AddNewEmployee />} />
          <Route path='/admin/employees/edit/:id' element={<EditEmployee />} />
          <Route path='attendance/all' element={<AllAttendance />} />
          <Route path='profile' element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
