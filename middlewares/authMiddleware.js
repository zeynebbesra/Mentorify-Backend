const SECRET = process.env.SECRET
const jwt = require('jsonwebtoken');
const Mentee = require('../models/mentee.model');
const Mentor = require('../models/mentor.model');

const dotenv = require("dotenv");
dotenv.config();

const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, SECRET);
        let user;

        user = await Mentee.findOne({ _id: decoded._id });
        if (!user) {
            
            user = await Mentor.findOne({ _id: decoded._id });
        }
        if (!user) {
            throw new Error();
        }

        console.log("User:",user)
        req.user = user;
        req.userType = user.__t;
        next();
    } catch (error) {
        console.log("error",error.message),
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = authenticateUser;