const express = require("express");
const PORT = process.env.PORT ?? 8800;
const cors = require("cors");
const path = require('path');
const passport = require("passport");
const cookieSession = require("cookie-session");
const connection = require("./utils/db-connection");
const errorHandler = require("./middlewares/error-handler");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const authenticateUser = require('./middlewares/authMiddleware.js');

const app = require("./socket/socket.js").app;
const server = require("./socket/socket.js").server;

dotenv.config();

app.use(
  cookieSession({
    name: "session",
    keys: ["zeybes"],
    maxAge: 24 * 60 * 60 * 100,
    sameSite: 'lax' // sameSite ayarını lax olarak belirleyin
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: 'http://localhost:3000', 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Middleware
app.use(express.json()); // POST isteklerini parse etmek için
// Static dosyaları sunma
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());
app.use(morgan("common"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

app.get("/", (req, res) => {
  res.send("Welcome to Mentorify!");
});

// Routers
const mentorRouter = require("./routes/mentor.routes");
const menteeRouter = require("./routes/mentee.routes");
const categoryRouter = require("./routes/category.routes");
const messageRouter = require("./routes/message.routes");
const paymentRouter = require("./routes/payment.routes.js");

const api = process.env.API_URL;

app.use(`${api}/mentors`, mentorRouter);
app.use(`${api}/mentees`, menteeRouter);
app.use(`${api}/categories`, categoryRouter);
app.use(`${api}/messages`, messageRouter);
app.use(`${api}/payments`, paymentRouter);

app.get('/test-auth', authenticateUser, (req, res) => {
  res.status(200).json({ user: req.user });
});

// Hata işleyici middleware'i en sona ekleyin
app.use(errorHandler);

// Veritabanı bağlantısı
connection();

server.listen(PORT, () => {
  console.log("Backend server is running!");
});
