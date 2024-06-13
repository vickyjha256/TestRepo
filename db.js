const mongoose = require('mongoose');

const mongoURI = "mongodb://127.0.0.1:27017/testproject";

// mongoose.set('strictQuery', true);
const mongoConnection = () => {
    mongoose.connect(mongoURI, () => {
        console.log("MongoDB connected successfully.");
    })
}

module.exports = mongoConnection;