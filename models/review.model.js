const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
    {
        mentee:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentee',
            required: true,
        },
        mentor:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentee',
            required: true,
        },
        rating:{
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
)

module.exports = mongoose.model("Review", reviewSchema)