const mongoose = require('mongoose')

const conectDB = async (uriMongoDB, dbName) => {
    try {
        await mongoose.connect(uriMongoDB, {
                                                dbName: dbName
                                            })
        console.log(`Database ${dbName} connected`)
    } catch (error) {
        console.error("Error connecting to database: ", error.message)
    }
}
module.exports = {conectDB}