require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth')
const postRouter = require('./routes/post')

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mern-learnit.e1ii9.mongodb.net/mern-learnit?retryWrites=true&w=majority`, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log("mongoDB connected")
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}
connectDB();

const app = express()
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/post', postRouter)

const PORT = 5000
app.listen(PORT, () => console.log(`server started on port ${PORT}`))
