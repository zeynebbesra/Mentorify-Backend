const mongoose = require('mongoose')

const menteeSchema = new mongoose.Schema(
    {
        goal:{
            type: String
        },
        interest:{
            type: mongoose.Schema.Types.ObjectId,
            ref: Interest,
            required: true
        },
        reviews: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        }],
    }
)

module.exports = mongoose.model("Mentee", menteeSchema)