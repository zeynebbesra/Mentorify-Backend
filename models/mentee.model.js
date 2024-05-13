const mongoose = require('mongoose')
const BaseUser = require('../models/base-user.model')

const menteeSchema = new mongoose.Schema(
    {
        interests:[{
            type: String,
            ref: 'Interest',
        }],
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentor',
        }],
        image: {
            type: String
        },
    },
    { discriminatorKey: 'kind' }
)

module.exports = BaseUser.discriminator('Mentee', menteeSchema)