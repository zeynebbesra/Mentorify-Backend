// const JWT_SECRET = process.env.JWT_SECRET
// const jwt = require('jsonwebtoken');
// const Mentee = require('../models/mentee.model');
// const Mentor = require('../models/mentor.model');

// const dotenv = require("dotenv");
// dotenv.config();

// const authenticateUser = async (req, res, next) => {
//     const token = req.header('Authorization').replace('Bearer ', '');

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET);
//         let user;

//         user = await Mentee.findOne({ _id: decoded._id });
//         if (!user) {
            
//             user = await Mentor.findOne({ _id: decoded._id });
//         }
//         if (!user) {
//             throw new Error();
//         }

//         req.user = user;
//         req.userType = user instanceof Mentee ? 'mentee' : 'mentor';
//         next();
//     } catch (error) {
//         res.status(401).send({ error: 'Please authenticate.' });
//     }
// };

// module.exports = authenticateUser;


const jwt = require('jsonwebtoken');
const Mentee = require('../models/mentee.model');
const Mentor = require('../models/mentor.model');

const dotenv = require("dotenv");
dotenv.config();


// const Mentee = require('../models/mentee.model');
// const Mentor = require('../models/mentor.model');

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log("Authorization Header:", token);

        if (!token) {
            console.error('Token not found');
            return res.status(401).send({ error: 'Token not found' });
        }

        const strippedToken = token.replace('Bearer ', '');
        console.log("Stripped Token:", strippedToken);

        const decoded = jwt.verify(strippedToken, process.env.SECRET);  // .env dosyasındaki SECRET değerini kullanıyoruz
        console.log("Decoded Token:", decoded);

        let user = await Mentee.findOne({ _id: decoded.id });
        if (!user) {
            user = await Mentor.findOne({ _id: decoded.id });
        }
        if (!user) {
            console.error('User not found');
            return res.status(401).send({ error: 'User not found' });
        }

        console.log("Authenticated User:", user);

        req.user = user;
        req.userType = user instanceof Mentee ? 'mentee' : 'mentor';
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = authenticateUser;



module.exports = authenticateUser

