const bcrypt = require('bcrypt')
const passwordToHash = async(basicPassword) => {
    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(basicPassword, salt)

    return hashedPassword
}

module.exports = {
    passwordToHash
}
