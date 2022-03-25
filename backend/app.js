// Imports
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const app = express();
const helmet = require("helmet");

const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
const likeRoute = require("./routes/likeRoute");
const commentRoute = require("./routes/commentRoute");
const commentLikeRoute = require("./routes/commentLikeRoute");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use("/", userRoute);
app.use("/", messageRoute);
app.use("/", likeRoute);
app.use("/", commentRoute);
app.use("/", commentLikeRoute);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("*", (req, res) => {
  res.json({ error: 404 });
});

module.exports = app;
