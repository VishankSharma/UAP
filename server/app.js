import express from 'express';
const app = express()
import cors from 'cors';
import  cookieParser from 'cookie-parser'
import {config} from 'dotenv'
import morgan from 'morgan'
import userRoutes from './routes/userRoutes.js'
import errorMiddleware from './middlewares/error.middleware.js';


config()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

app.use(cors({
   origin : [process.env.FRONTEND_URL],
   credentials:true
}))


app.use(morgan('dev'))

app.use('/api/v1/user', userRoutes)


// app.all('*', (req, res) => {
//     res.status(404).send('404 OOPS!! Page Not Found')
// })

app.use(errorMiddleware);

export default app 