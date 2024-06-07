const mongoose = require('mongoose')
const BaseUser = require('../models/base-user.model')

const menteeSchema = new mongoose.Schema(
    {
        interests:[{
            type: String,
            ref: 'Interest',
        }],
        category:{
            type: String,
            ref: 'Category'
        },
        wishlist: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentor',
        }],
        applications: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentor',
        }],
        approvedMentors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentor',
        }],
        image: {
            type: String
        },
        verificationCode:{
            type: Number,
        },
        verificationCodeExpires:{
            type: Date
        }
    },
    { discriminatorKey: 'kind' }
)

module.exports = BaseUser.discriminator('Mentee', menteeSchema)