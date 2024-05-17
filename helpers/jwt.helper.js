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
require('dotenv').config(); // Eğer ana dosyanızda yoksa burada da ekleyebilirsiniz

const createLoginToken = (user, res) => {
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.SECRET || "fallbackSecret", // Eğer env değişkeni yüklenemezse, varsayılan bir secret kullan
        {
            expiresIn: '24h',
        }
    );

    res.header('Authorization', 'Bearer ' + token); // Daha standart bir kullanım
    return token;
};

module.exports = { createLoginToken };
