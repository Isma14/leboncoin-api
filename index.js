const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

mongoose.connect("mongodb://localhost:27017/leboncoin-api", {
  useNewUrlParser: true
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

const User = mongoose.model("User", {
  email: String,
  hash: String,
  salt: String,
  token: String
});

app.post("/sign_up", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const token = uid2(16);
    const salt = uid2(16);

    const saltedPassword = password + salt;

    const hash = SHA256(saltedPassword).toString(encBase64);

    const newUser = await new User({
      email: email,
      hash: hash,
      salt: salt,
      token: token
    });
    await newUser.save();
    res.json({
      token: token,
      id: newUser._id,
      email: newUser.email
    });
  } catch (error) {
    res.status(400).json({ message: "error" });
  }
});

app.post("/log_in", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userFound = await User.findOne({ email: email });
  if (userFound) {
    const hash = SHA256(password + userFound.salt).toString(encBase64);
    if (userFound.hash === hash) {
      return res.json({
        token: userFound.token,
        id: userFound.token
      });
    }
  }

  return res.status(400).json({ message: "Unauthorized" });
});

app.get("/");

app.get("/profile", (req, res) => {
  console.log(req.headers.authorization);

  res.json("hello");
});

app.listen(3100, () => {
  console.log("Server started");
});
