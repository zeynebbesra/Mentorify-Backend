const express = require("express")
const PORT = process.env.PORT ?? 8800
const app = express()
const connection = require('./utils/db-connection')
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")
const errorHandler = require("./middlewares/error-handler")

dotenv.config()

//middleware
app.use(express.json()) //when we make post request it's gonna parse it.
app.use(helmet())
app.use(morgan("common"))
app.use(errorHandler)

app.get("/", (req,res)=>{
    res.send("Welcome to Mentorify!")
})

//Routers
const mentorRouter =  require('./routes/mentor.routes')

const api = process.env.API_URL

app.use(`${api}/mentors`, mentorRouter)


//db connection
connection()

app.listen(PORT, ()=>{
    console.log("Backend server is running!")
})