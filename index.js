const express = require("express")
const PORT = process.env.PORT ?? 8800
const app = express()
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session")
const connection = require('./utils/db-connection')
const errorHandler = require("./middlewares/error-handler")
const dotenv = require("dotenv")
const helmet = require("helmet")
const morgan = require("morgan")


dotenv.config()

app.use(
	cookieSession({
		name: "session",
		keys: ["zeybes"],
		maxAge: 24 * 60 * 60 * 100,
	})
);

// app.use(
//     cookieSession({
//         name: process.env.SESSION_NAME || "session",
//         keys: [process.env.SESSION_KEYS || "zeybes"],
//         maxAge: parseInt(process.env.SESSION_MAX_AGE, 10) || 24 * 60 * 60 * 100,
//     })
// );

app.use(passport.initialize());
app.use(passport.session());

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

//middleware
app.use(express.json()) //when we make post request it's gonna parse it.
app.use(helmet())
app.use(morgan("common"))
app.use(errorHandler)

app.get("/", (req,res)=>{
    res.send("Welcome to Mentorify!")
})

//Routers
const mentorRouter = require('./routes/mentor.routes')
const menteeRouter = require('./routes/mentee.routes')
const categoryRouter = require('./routes/category.routes')

const api = process.env.API_URL

app.use(`${api}/mentors`, mentorRouter)
app.use(`${api}/mentees`, menteeRouter)
app.use(`${api}/categories`, categoryRouter)

//db connection
connection()

app.listen(PORT, ()=>{
    console.log("Backend server is running!")
})