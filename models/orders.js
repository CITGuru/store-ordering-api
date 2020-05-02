const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Orders = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    customer_email: {
        type: String,
        required: true,
        trim: true,
    },
    customer_name: {
        type: String,
        trim: true,
        required: true,
    },
    quantity: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        default: "pending"
    },
    customer_address: {
        type: String,
        trim: true,
        required: false,
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }

});

module.exports = mongoose.model('orders', Orders);