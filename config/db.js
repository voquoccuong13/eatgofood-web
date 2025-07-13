const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
        // .then(() => console.log("MongoDB connected"));
    }
};
// "mongodb+srv://cuong130602:2002%40@foodcluster.2rnin8d.mongodb.net/Food-web?retryWrites=true&w=majority"
module.exports = { connectDB };
