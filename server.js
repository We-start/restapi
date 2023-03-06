const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();
let routes = null;

app.use(cors());
app.use(express.json());
dotenv.config();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, token, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use((req, res, next) => {
  if (req.path === "/heathcheck")
    return res.status(200).send({
      success: true,
      message: "Everything is OK",
    });
  else if (req.path !== "/app/login" && req.path !== "/app/register" && req.path !== "") {
    let token = req.headers["authorization"];
    if (!token)
      return res.status(401).send({
        success: false,
        message: "Unauthorized",
      });
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(400).send({
        success: false,
        message: "Invalid token",
      });
    }
  } else next();
});

const initialize = async () => {
  let mongoConnect = mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  mongoConnect
    .then(async (db) => {
      console.log("MongoDB connected....");
      db = mongoose.connection;
      db.on("error", console.error.bind(console, "MongoDB connection error:"));
      let PORT = process.env.PORT || 8081;
      app.listen(PORT);
      routes = require("./routes");
      routes(app);
      console.log("Server started on: " + PORT);
    })
    .catch((err) => {
      console.log(err);
    });
};

initialize();