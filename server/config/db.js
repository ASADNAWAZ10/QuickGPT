import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', ()=> console.log('database connected'));
        await mongoose.connect(`${process.env.MONGO_URI}/quickGPT`)
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB;
