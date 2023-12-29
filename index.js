const express = require("express")
const PORT = process.env.PORT ?? 8800
const app = express()
const connection = require('./utils/db-connection')
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")

dotenv.config()

//middleware
app.use(express.json()) //when we make post request it's gonna parse it.
app.use(helmet())
app.use(morgan("common"))


app.get("/", (req,res)=>{
    res.send("Welcome to Mentorify!")
})

//db connection
connection()

app.listen(PORT, ()=>{
    console.log("Backend server is running!")
})