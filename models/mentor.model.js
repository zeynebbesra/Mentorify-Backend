const mongoose = require('mongoose')
const BaseUser = require('../models/base-user.model')

const mentorSchema = new mongoose.Schema(
    {
        category:{
            type: String,
            ref: 'Category',
            required: true
        },
        interests:[{
            type: String,
            ref: 'Interest',
            required: true
        }],
        jobTitle: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
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
            type: String,
            required: true
        },
        github:{
            type: String,
            required: true
        },
        linkedin:{
            type: String,
            required: true
        },
        applicants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentee',
        }],
        approvedMentees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mentee'
        }],
        verificationCode:{
            type: Number,
        },
        verificationCodeExpires:{
            type: Date
        }
    },
    { discriminatorKey: 'kind' }
)

module.exports = BaseUser.discriminator('Mentor', mentorSchema)