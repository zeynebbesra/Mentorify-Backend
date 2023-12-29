const mongoose = require('mongoose')

const mentorSchema = new mongoose.Schema(
    {
        category:{
            type: mongoose.Schema.Types.ObjectId,
            ref: Category,
            required: true
        },
        interest:{
            type: mongoose.Schema.Types.ObjectId,
            ref: Interest,
            required: true
        },
        experience: {
            type: Number,
        },
        price: {
            type: Number,
        },
        rating: {
            type: Number,
            default:0
        },
        reviews: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        }],

    }
)

module.exports = mongoose.model("Mentor", mentorSchema)