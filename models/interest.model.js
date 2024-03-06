const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }
    }
)

module.exports = mongoose.model("Interest", interestSchema)