/**
 * Order Controller - Handles all CRUD operations for orders.
 * Includes WebSocket emissions for real-time updates to connected clients.
 */

const Order = require('../models/orderModel');
const Sales = require('../models/salesModel');
const Bill = require('../models/billModel');


// Valid order statuses matching the restaurant workflow
const VALID_ORDER_STATUSES = ['pending', 'preparing', 'served', 'cancelled'];

// Default estimated time shown to customers when no specific estimate is provided
const DEFAULT_ESTIMATED_TIME = '15-20 mins';


// ============================================================================
// Order Creation
// ============================================================================

/**
 * Create a new order and broadcast to admin clients.
 * @route POST /api/orders
 */
const createOrder = async (request, response) => {
    try {
        const {
            sessionId,
            orderNumber,
            tableNumber,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            userId,
            items,
            subtotal,
            tax,
            total,
            estimatedTime
        } = request.body;

        // Guard: Ensure minimum required data is present before proceeding
        if (!orderNumber || !tableNumber || !items || items.length === 0) {
            return response.status(400).json({
                success: false,
                message: 'Order number, table number, and at least one item are required'
            });
        }

        // Guard: Ensure sessionId is present for billing
        if (!sessionId) {
            return response.status(400).json({
                success: false,
                message: 'Session ID is required for billing'
            });
        }

        const newOrder = new Order({
            sessionId,
            orderNumber,
            tableNumber,
            customerName: customerName || 'Guest',
            customerPhone: customerPhone || '',
            customerEmail: customerEmail || '',
            customerAddress: customerAddress || '',
            userId: userId || null,
            items,
            subtotal,
            tax,
            total,
            estimatedTime: estimatedTime || DEFAULT_ESTIMATED_TIME,
            status: 'pending'
        });

        const savedOrder = await newOrder.save();

        // Notify all connected admin clients about the new order in real-time
        const socketServer = request.app.get('io');
        if (socketServer) {
            socketServer.emit('order:new', savedOrder);
        }

        response.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: savedOrder
        });

    } catch (error) {
        // MongoDB duplicate key error (order number already exists)
        if (error.code === 11000) {
            return response.status(400).json({
                success: false,
                message: 'Order number already exists'
            });
        }

        console.error('Error creating order:', error);
        console.error('Request body was:', JSON.stringify(request.body, null, 2));
        response.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
            details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`) : null
        });
    }
};


// ============================================================================
// Order Retrieval
// ============================================================================

/**
 * Get all orders with optional status filter.
 * @route GET /api/orders
 * @query status - Filter by order status (pending, preparing, served, cancelled)
 */
const getAllOrders = async (request, response) => {
    try {
        const { status } = request.query;

        const queryFilter = {};
        if (status) {
            queryFilter.status = status;
        }

        // Sort by newest first so admins see the most recent orders at the top
        const orders = await Order.find(queryFilter).sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};


/**
 * Get a single order by ID.
 * @route GET /api/orders/:id
 */
const getOrderById = async (request, response) => {
    try {
        const order = await Order.findById(request.params.id);

        if (!order) {
            return response.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        response.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error.message
        });
    }
};


/**
 * Get orders by table number (for customer view).
 * Allows customers to see their own order history for the current session.
 * @route GET /api/orders/table/:tableNumber
 */
const getOrdersByTable = async (request, response) => {
    try {
        const { tableNumber } = request.params;

        const orders = await Order.find({ tableNumber: parseInt(tableNumber) })
            .sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders by table:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};


// ============================================================================
// Order Updates & Deletion
// ============================================================================

/**
 * Update order status and broadcast the change to all connected clients.
 * When status changes to "served", a Sales record is created for analytics.
 * @route PATCH /api/orders/:id
 */
const updateOrderStatus = async (request, response) => {
    try {
        const { status } = request.body;

        // Guard: Ensure the provided status is one of the valid workflow states
        if (!status || !VALID_ORDER_STATUSES.includes(status)) {
            return response.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
            });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            request.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return response.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // When order is marked as served, create a Sales record for analytics
        if (status === 'served') {
            try {
                const salesRecord = new Sales({
                    orderId: updatedOrder._id,
                    orderNumber: updatedOrder.orderNumber,
                    tableNumber: updatedOrder.tableNumber,
                    customerName: updatedOrder.customerName,
                    userId: updatedOrder.userId || null,
                    customerPhone: updatedOrder.customerPhone || '',
                    customerEmail: updatedOrder.customerEmail || '',
                    customerAddress: updatedOrder.customerAddress || '',
                    items: updatedOrder.items.map(item => ({
                        menuItemId: item.menuItemId || null,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        category: item.category || 'Uncategorized'
                    })),
                    subtotal: updatedOrder.subtotal,
                    tax: updatedOrder.tax,
                    total: updatedOrder.total,
                    servedAt: new Date(),
                    orderCreatedAt: updatedOrder.createdAt
                });

                await salesRecord.save();
                console.log(`Sales record created for order ${updatedOrder.orderNumber} - Customer: ${updatedOrder.customerName}`);

                // Emit analytics update event so dashboard can refresh in real-time
                const socketServer = request.app.get('io');
                if (socketServer) {
                    socketServer.emit('sales:new', salesRecord);
                }

            } catch (salesError) {
                // Log the error but don't fail the order update
                // Sales record creation is important but shouldn't block order flow
                console.error('Error creating sales record:', salesError);
            }
        }

        // Broadcast status change to all clients (admin dashboard and customer order tracking)
        const socketServer = request.app.get('io');
        if (socketServer) {
            socketServer.emit('order:statusUpdate', updatedOrder);
        }

        response.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};


/**
 * Delete an order by ID.
 * Note: Consider using status='cancelled' instead for audit trail purposes.
 * @route DELETE /api/orders/:id
 */
const deleteOrder = async (request, response) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(request.params.id);

        if (!deletedOrder) {
            return response.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Notify connected clients that this order has been removed
        const socketServer = request.app.get('io');
        if (socketServer) {
            socketServer.emit('order:deleted', { id: request.params.id });
        }

        response.status(200).json({
            success: true,
            message: 'Order deleted successfully',
            data: deletedOrder
        });

    } catch (error) {
        console.error('Error deleting order:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
};


// ============================================================================
// Session-Based Billing
// ============================================================================

/**
 * Get all orders for a specific session.
 * Allows customers to see all orders placed during their current visit.
 * @route GET /api/orders/session/:sessionId
 */
const getSessionOrders = async (request, response) => {
    try {
        const { sessionId } = request.params;

        const orders = await Order.find({ sessionId }).sort({ createdAt: 1 });

        response.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching session orders:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch session orders',
            error: error.message
        });
    }
};


/**
 * Get consolidated bill for an entire session.
 * Aggregates all items from all orders in the session into one bill.
 * @route GET /api/orders/session/:sessionId/bill
 */
const getConsolidatedBill = async (request, response) => {
    try {
        const { sessionId } = request.params;

        // Only include non-cancelled orders in the bill
        const orders = await Order.find({
            sessionId,
            status: { $ne: 'cancelled' }
        }).sort({ createdAt: 1 });

        if (orders.length === 0) {
            return response.status(404).json({
                success: false,
                message: 'No orders found for this session'
            });
        }

        // Aggregate all items from all orders
        const allItems = orders.flatMap(order => order.items);
        const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
        const tax = orders.reduce((sum, order) => sum + order.tax, 0);
        const total = orders.reduce((sum, order) => sum + order.total, 0);

        response.status(200).json({
            success: true,
            data: {
                sessionId,
                tableNumber: orders[0].tableNumber,
                customerName: orders[0].customerName,
                items: allItems,
                subtotal,
                tax,
                total,
                orderCount: orders.length,
                orders: orders.map(o => ({
                    orderNumber: o.orderNumber,
                    createdAt: o.createdAt,
                    status: o.status
                }))
            }
        });

    } catch (error) {
        console.error('Error generating consolidated bill:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to generate consolidated bill',
            error: error.message
        });
    }
};


/**
 * Request payment - notifies admin that customer is ready to settle their bill.
 * Creates a Bill record in the database and sends Socket.IO notification.
 * @route POST /api/orders/session/:sessionId/pay-request
 */
const requestPayment = async (request, response) => {
    try {
        const { sessionId } = request.params;

        // Check if a bill already exists for this session
        const existingBill = await Bill.findOne({ sessionId });
        if (existingBill) {
            return response.status(200).json({
                success: true,
                message: 'Bill already exists for this session',
                data: existingBill
            });
        }

        // Get all non-cancelled orders for this session
        const orders = await Order.find({
            sessionId,
            status: { $ne: 'cancelled' }
        });

        if (orders.length === 0) {
            return response.status(404).json({
                success: false,
                message: 'No orders found for this session'
            });
        }

        const tableNumber = orders[0].tableNumber;
        const customerName = orders[0].customerName;
        const customerPhone = orders[0].customerPhone || '';
        const customerEmail = orders[0].customerEmail || '';
        const customerAddress = orders[0].customerAddress || '';
        const userId = orders[0].userId || null;

        // Aggregate all items from all orders, preserving menuItemId and imageLink
        const allItems = orders.flatMap(order => order.items.map(item => ({
            menuItemId: item.menuItemId || null,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            description: item.description || '',
            imageLink: item.imageLink || ''
        })));

        const subtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
        const tax = orders.reduce((sum, order) => sum + order.tax, 0);
        const total = orders.reduce((sum, order) => sum + order.total, 0);

        // Generate unique bill number
        const billNumber = await Bill.generateBillNumber();
        const paymentRequestedAt = new Date();

        // Create the Bill document with full user details
        const newBill = new Bill({
            billNumber,
            sessionId,
            tableNumber,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            userId,
            items: allItems,
            subtotal,
            tax,
            total,
            orderCount: orders.length,
            orders: orders.map(order => ({
                orderId: order._id,
                orderNumber: order.orderNumber
            })),
            billingStatus: 'pending_payment',
            paymentRequestedAt
        });

        const savedBill = await newBill.save();

        // Update billing status on all orders for backwards compatibility
        await Order.updateMany(
            { sessionId },
            {
                $set: {
                    billingStatus: 'pending_payment',
                    paymentRequestedAt
                }
            }
        );

        // Emit instant notification to admin via Socket.IO with full user details
        const socketServer = request.app.get('io');
        if (socketServer) {
            socketServer.emit('payment:request', {
                sessionId,
                billNumber: savedBill.billNumber,
                tableNumber,
                customerName,
                customerPhone,
                customerEmail,
                customerAddress,
                userId,
                total,
                orderCount: orders.length,
                timestamp: paymentRequestedAt
            });
            console.log(`Payment request sent for Table ${tableNumber} - Bill: ${billNumber} - Customer: ${customerName} - Total: ₹${total.toFixed(2)}`);
        }

        response.status(201).json({
            success: true,
            message: 'Bill created and payment request sent to admin',
            data: savedBill
        });

    } catch (error) {
        console.error('Error requesting payment:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to request payment',
            error: error.message
        });
    }
};


/**
 * Update billing status for a session.
 * Admin uses this to mark bills as Paid or Unpaid.
 * Updates both the Bill document and Orders for backwards compatibility.
 * @route PATCH /api/orders/session/:sessionId/billing-status
 */
const updateBillingStatus = async (request, response) => {
    try {
        const { sessionId } = request.params;
        const { billingStatus, paymentMethod } = request.body;

        // Guard: Validate billing status
        const validStatuses = ['unpaid', 'pending_payment', 'paid'];
        if (!billingStatus || !validStatuses.includes(billingStatus)) {
            return response.status(400).json({
                success: false,
                message: `Invalid billing status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Prepare update data
        const updateData = { billingStatus };
        if (billingStatus === 'paid') {
            updateData.paidAt = new Date();
            if (paymentMethod) {
                updateData.paymentMethod = paymentMethod;
            }
        }

        // Update the Bill document
        const updatedBill = await Bill.findOneAndUpdate(
            { sessionId },
            { $set: updateData },
            { new: true }
        );

        // Update all orders in the session for backwards compatibility
        const orderResult = await Order.updateMany(
            { sessionId },
            { $set: { billingStatus, paidAt: updateData.paidAt || null } }
        );

        if (!updatedBill && orderResult.matchedCount === 0) {
            return response.status(404).json({
                success: false,
                message: 'No bill or orders found for this session'
            });
        }

        // Get table number for notification
        const tableNumber = updatedBill?.tableNumber;

        // Broadcast billing status update to all clients (including customers)
        const socketServer = request.app.get('io');
        if (socketServer) {
            socketServer.emit('billing:statusUpdate', {
                sessionId,
                billingStatus,
                billNumber: updatedBill?.billNumber,
                tableNumber,
                paidAt: updateData.paidAt || null,
                paymentMethod: updateData.paymentMethod || null
            });
            console.log(`Billing status updated for session ${sessionId}: ${billingStatus}`);
        }

        response.status(200).json({
            success: true,
            message: `Billing status updated to ${billingStatus}`,
            data: updatedBill || {
                sessionId,
                billingStatus,
                ordersUpdated: orderResult.modifiedCount
            }
        });

    } catch (error) {
        console.error('Error updating billing status:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to update billing status',
            error: error.message
        });
    }
};


/**
 * Get all pending payments from the Bill collection (for admin Payments tab).
 * @route GET /api/orders/payments
 */
const getPendingPayments = async (request, response) => {
    try {
        // Get all bills with pending payment status
        const bills = await Bill.find({
            billingStatus: { $in: ['unpaid', 'pending_payment'] }
        }).sort({ paymentRequestedAt: -1, createdAt: -1 });

        const mappedBills = bills.map(bill => ({
            _id: bill.sessionId,
            billId: bill._id,
            billNumber: bill.billNumber,
            tableNumber: bill.tableNumber,
            customerName: bill.customerName,
            customerPhone: bill.customerPhone,
            total: bill.total,
            orderCount: bill.orderCount,
            billingStatus: bill.billingStatus,
            paymentRequestedAt: bill.paymentRequestedAt,
            createdAt: bill.createdAt
        }));

        console.log('💰 Pending payments response:', {
            count: mappedBills.length,
            sampleTotal: mappedBills[0]?.total,
            sampleBillNumber: mappedBills[0]?.billNumber
        });

        response.status(200).json({
            success: true,
            count: mappedBills.length,
            data: mappedBills
        });

    } catch (error) {
        console.error('Error fetching pending payments:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch pending payments',
            error: error.message
        });
    }
};


/**
 * Get bill record for a specific session.
 * @route GET /api/orders/session/:sessionId/bill-record
 */
const getBillBySession = async (request, response) => {
    try {
        const { sessionId } = request.params;

        const bill = await Bill.findOne({ sessionId });

        if (!bill) {
            return response.status(404).json({
                success: false,
                message: 'No bill found for this session'
            });
        }

        response.status(200).json({
            success: true,
            data: bill
        });

    } catch (error) {
        console.error('Error fetching bill:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch bill',
            error: error.message
        });
    }
};


/**
 * Get all bills with optional status filter (for admin billing history).
 * @route GET /api/orders/bills
 */
const getAllBills = async (request, response) => {
    try {
        const { status, startDate, endDate } = request.query;

        const queryFilter = {};

        if (status) {
            queryFilter.billingStatus = status;
        }

        // Date range filter for bill history
        if (startDate || endDate) {
            queryFilter.createdAt = {};
            if (startDate) {
                queryFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                queryFilter.createdAt.$lte = new Date(endDate);
            }
        }

        const bills = await Bill.find(queryFilter).sort({ createdAt: -1 });

        console.log('📊 Fetched bills count:', bills.length);
        if (bills.length > 0) {
            console.log('📊 Sample bill data:', JSON.stringify(bills[0], null, 2));
        }

        response.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });

    } catch (error) {
        console.error('Error fetching bills:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch bills',
            error: error.message
        });
    }
};


/**
 * Get all orders by customer phone number.
 * Allows customers to view their order history across all sessions.
 * @route GET /api/orders/phone/:phone
 */
const getOrdersByPhone = async (request, response) => {
    try {
        const { phone } = request.params;

        const orders = await Order.find({ customerPhone: phone })
            .sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error fetching orders by phone:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};


/**
 * Get all bills by customer phone number.
 * Allows customers to view their complete billing history.
 * @route GET /api/orders/bills/phone/:phone
 */
const getBillsByPhone = async (request, response) => {
    try {
        const { phone } = request.params;

        const bills = await Bill.find({ customerPhone: phone })
            .sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });

    } catch (error) {
        console.error('Error fetching bills by phone:', error);
        response.status(500).json({
            success: false,
            message: 'Failed to fetch bills',
            error: error.message
        });
    }
};


module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrdersByTable,
    getOrdersByPhone,
    getSessionOrders,
    getConsolidatedBill,
    requestPayment,
    updateBillingStatus,
    getPendingPayments,
    getBillBySession,
    getAllBills,
    getBillsByPhone
};

