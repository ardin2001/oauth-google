import express from "express";
const app = express();
const port = 5000;
import User from "./user.model.js";
import { google } from "googleapis";
import "dotenv/config";
import sequelizeConfig from "./config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sequelizeConfig
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:5000/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

app.get("/auth/google", (req, res) => {
  // res.writeHead(301, { "Location": authorizationUrl });
  res.redirect(301, authorizationUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  // Get access and refresh tokens (if access_type is offline)
  let { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  const { data } = await oauth2.userinfo.get();
  if (!data) {
    res.status(400).json({
      message: "Invalid token",
    });
  } else {
    const cekUser = await User.findOne({ where: { email: data.email } });
    if (cekUser) {
      res.status(200).json({
        message: "Account already exists",
      });
    } else {
      const result = await User.create({
        email: data.email,
        verified_email: data.verified_email,
      });
      var secret_key = process.env.JWT_SECRET_KEY;
      var token = jwt.sign({ id:data.id,name:data.name,verified_email:data.verified_email,email: data.email }, secret_key,{ algorithm: 'HS256' }, { expiresIn: "1d" });
      res.status(200).json({
        message: "Success create account",
        data,
        token
      });
    }
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello world!",
  });
});

app.get("/token", (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  res.status(200).json({
    message: "Access Token",
    access_token : token
  });
});

app.get("/users/:id", async (req, res) => {
  const data = await User.findOne({ where: { id: req.params.id } });
  if (data) {
    res.status(200).json({
      message: "Success get data user id :" + req.params.id,
      data,
    });
  } else {
    res.status(400).json({
      message: "User not found",
      data: null,
    });
  }
});

app.get("/redirectid/:id", async (req, res) => {
  const result = await fetch(`http://localhost:5000/users/${req.params.id}`);
  const json = await result.json();
  res.status(200).json({
    message: "success",
    data: json.data,
  });
});

app.post("/users", async (req, res) => {
  const { email, profile, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  const result = await User.create({
    email: email,
    profile: profile,
    password: hashPassword,
    verified_email: false,
  });
  res.status(200).json({
    message: "Hello POST!",
  });
});

app.put("/users", (req, res) => {
  res.status(200).json({
    message: "Hello PUT!",
  });
});

app.delete("/users", (req, res) => {
  res.status(200).json({
    message: "Hello DELETE!",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
