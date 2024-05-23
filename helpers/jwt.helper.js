// const jwt = require('jsonwebtoken')

// const createLoginToken = (user, res) => {
//     const token = jwt.sign(
//         {
//             id: user.id,
//             email: user.email
//         },
//         process.env.SECRET,{
//             expiresIn: '24h',
//         }
//     )

//     res.header('token', token)
//     return token
// }

// module.exports = {createLoginToken}

const jwt = require('jsonwebtoken');

const createLoginToken = (user, expiresIn = '24h') => {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.SECRET,
        {
            expiresIn: expiresIn,
        }
    );
    return token;
};

module.exports = { createLoginToken };
