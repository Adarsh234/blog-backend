import mongoose from 'mongoose'

const connnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO)
    console.log('MongoDB is connected')
  } catch (err) {
    console.log(err)
  }
}

export default connnectDB
