/**
 * Employee Model - Defines the schema for employees in the database.
 * Handles employee information, roles, shifts, and current attendance status.
 */

const mongoose = require('mongoose');

const employeeSchema = mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Please add an employee ID'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please add employee name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email address'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Please select a position'],
        enum: ['Head Chef', 'Sous Chef', 'Line Cook', 'Cashier', 'Manager', 'Inventory Manager', 'Server', 'Cleaner'],
        default: 'Server'
    },
    // Category for filtering (derived from position)
    positionCategory: {
        type: String,
        enum: ['chefs', 'cashiers', 'managers', 'staff'],
        default: 'staff'
    },
    shift: {
        type: String,
        required: [true, 'Please add a shift time'],
        trim: true,
        default: '09:00 AM - 05:00 PM'
    },
    todayStatus: {
        type: String,
        enum: ['present', 'absent', 'half-day'],
        default: 'absent'
    },
    avatar: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Additional fields for complete employee profile
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    emergencyContactName: {
        type: String,
        trim: true,
        default: ''
    },
    emergencyContactPhone: {
        type: String,
        trim: true,
        default: ''
    },
    permissionLevel: {
        type: String,
        enum: ['standard', 'admin', 'viewer'],
        default: 'standard'
    }
}, {
    timestamps: true
});

// Pre-save middleware to set positionCategory based on position
employeeSchema.pre('save', function (next) {
    const chefPositions = ['Head Chef', 'Sous Chef', 'Line Cook'];
    const cashierPositions = ['Cashier'];
    const managerPositions = ['Manager', 'Inventory Manager'];

    if (chefPositions.includes(this.position)) {
        this.positionCategory = 'chefs';
    } else if (cashierPositions.includes(this.position)) {
        this.positionCategory = 'cashiers';
    } else if (managerPositions.includes(this.position)) {
        this.positionCategory = 'managers';
    } else {
        this.positionCategory = 'staff';
    }

    next();
});

// Also handle updates
employeeSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.position) {
        const chefPositions = ['Head Chef', 'Sous Chef', 'Line Cook'];
        const cashierPositions = ['Cashier'];
        const managerPositions = ['Manager', 'Inventory Manager'];

        if (chefPositions.includes(update.position)) {
            update.positionCategory = 'chefs';
        } else if (cashierPositions.includes(update.position)) {
            update.positionCategory = 'cashiers';
        } else if (managerPositions.includes(update.position)) {
            update.positionCategory = 'managers';
        } else {
            update.positionCategory = 'staff';
        }
    }
    next();
});

// Virtual to get role color based on position
employeeSchema.virtual('roleColor').get(function () {
    const colorMap = {
        'Head Chef': 'bg-purple-100 text-purple-700',
        'Sous Chef': 'bg-blue-100 text-blue-700',
        'Line Cook': 'bg-indigo-100 text-indigo-700',
        'Cashier': 'bg-yellow-100 text-yellow-700',
        'Manager': 'bg-green-100 text-green-700',
        'Inventory Manager': 'bg-green-100 text-green-700',
        'Server': 'bg-orange-100 text-orange-700',
        'Cleaner': 'bg-gray-100 text-gray-700'
    };
    return colorMap[this.position] || 'bg-gray-100 text-gray-700';
});

// Ensure virtuals are included when converting to JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
