const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId

const paymentSchema = new mongoose.Schema({
    amount: {type: Number, default: 0},
    amount_paid: {type: Number, default: 0},
    amount_due: {type: Number, default: 0},
    orderId: {type: objectId, ref: "Order"},
    receipt: String,
    status: {type: String, default: "pending"},
    currency: {type: String, default: "INR"},
    notes:mongoose.Schema.Types.Mixed

}, {timestamps: true})

module.exports = mongoose.model('Payment', paymentSchema)