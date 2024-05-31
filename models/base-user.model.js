const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            min: 3,
            max: 20
        },
        surname: {
            type: String,
            min: 2,
            max: 20
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        desc: {
            type: String,
            max: 50,
            required: true
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        },
        avatar: {
            type: String
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);
