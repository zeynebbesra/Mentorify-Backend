const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required: true,
            min: 3,
            max:20
        },
        surname:{
            type: String,
            required: true,
            min:2,
            max:20
        },
        email:{
            type: String,
            required: true,
            max: 50,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        desc:{
            type: String,
            max: 50,
            required: true
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model("User", userSchema)