import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './config/db.js';
import userRouter from './routes/UserRoutes.js'
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes.js';
import { stripeWebhook } from './controller/webhook.js';

const app = express();

app.post('/api/stripe', express.raw({type: 'application/json'}),stripeWebhook)

await connectDB().catch(err => console.log("db error", err))

const allowdOrigins = ["http://localhost:5173", "https://quick-gpt-project-sigma.vercel.app"]

//Middlewere
app.use(cors({ origin: allowdOrigins, credentials: true }))
app.use(express.json())

//Routes
app.get('/', (req, res) => res.send('server is live'))
app.use('/api/user', userRouter)
app.use('/api/chat', chatRouter)
app.use('/api/message', messageRouter)
app.use('/api/credit', creditRouter )


const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server running");
  });
}

export default app;