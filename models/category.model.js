const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        interest: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interest'
        }]
        
    }
)

module.exports = mongoose.model("Category", categorySchema)