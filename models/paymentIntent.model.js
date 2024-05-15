const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentee',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },
    paymentIntentId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
