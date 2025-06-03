import mongoose from 'mongoose';

mongoose.set('strictQuery',false)

const connectionToDB = async (req,res) =>{
  try {
    const {connection} = await mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

  if(connection){
    console.log(`Connected to MongoDB: ${connection.host}`)

  }

  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }

}

export default connectionToDB