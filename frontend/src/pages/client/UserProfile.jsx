/**
 * UserProfile - Displays authenticated user's profile information and current order status.
 * Shows name, phone, email, and active orders if any.
 */

import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerAuthContext from '@/context/CustomerAuthContext';
import { useCart } from '@/context/CartContext';
import { User, Phone, Mail, Package, LogOut, ChevronRight } from 'lucide-react';

const UserProfile = () => {
    const navigate = useNavigate();
    const { customer, isAuthenticated, logout } = useContext(CustomerAuthContext);
    const { orderHistory, sessionId } = useCart();
    const [activeOrders, setActiveOrders] = useState([]);

    // Redirect to home if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    // Filter active orders (not served or cancelled)
    useEffect(() => {
        const active = orderHistory.filter(
            order => order.status !== 'SERVED' && order.status !== 'CANCELLED'
        );
        setActiveOrders(active);
    }, [orderHistory]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/myorder');
    };

    if (!isAuthenticated || !customer) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Your account information and order status</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                    {/* Profile Header with Avatar */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold">
                                {customer.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{customer.name}</h2>
                                <p className="text-orange-100">Customer</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="p-6 space-y-4">
                        {/* Name */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="text-lg font-semibold text-gray-900">{customer.phone}</p>
                            </div>
                        </div>

                        {/* Email */}
                        {customer.email && (
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="text-lg font-semibold text-gray-900">{customer.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Orders Section */}
                {sessionId && activeOrders.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Active Orders</h3>
                            </div>

                            <div className="space-y-3">
                                {activeOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                Order #{order.orderNumber}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Table {order.tableNumber} • {order.status}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">₹{order.total.toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">{order.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleViewOrders}
                                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                            >
                                View All Orders
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* No Active Orders */}
                {!sessionId || activeOrders.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Orders</h3>
                            <p className="text-gray-600 mb-4">You don't have any orders in progress</p>
                            <button
                                onClick={() => navigate('/menu')}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                            >
                                Browse Menu
                            </button>
                        </div>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white text-red-600 font-semibold rounded-xl shadow-lg hover:bg-red-50 transition-all duration-200 border-2 border-red-200"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
