const mongoose = require('mongoose')
const BaseUser = require('../models/base-user.model')

const menteeSchema = new mongoose.Schema(
    {
        goal:{
            type: String
        },
        interest:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interest',
        }],
        // reviews: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Review',
        // }],
        costInterval: {
            
        }
    },
    { discriminatorKey: 'kind' }
)

// module.exports = mongoose.model("Mentee", menteeSchema)
module.exports = BaseUser.discriminator('Mentee', menteeSchema)