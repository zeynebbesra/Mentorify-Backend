const mongoose = require('mongoose')
const BaseUser = require('../models/base-user.model')

const mentorSchema = new mongoose.Schema(
    {
        category:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },
        interest:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interest',
        }],
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
        image: {
            type: String
        },
    },
    { discriminatorKey: 'kind' }
)

// module.exports = mongoose.model("Mentor", mentorSchema)
module.exports = BaseUser.discriminator('Mentor', mentorSchema)