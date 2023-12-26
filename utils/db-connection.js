const mongoose = require("mongoose")

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log('DB Connected Successfully!')
    } catch (error) {
        console.error(`Unable to connect to the database: ${error}`);
    }
}

module.exports = connect