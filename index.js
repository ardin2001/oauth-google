import express from "express";
const app = express();
const port = 5000;
import User from "./user.model.js";
import { google } from "googleapis";
import 'dotenv/config'
import sequelizeConfig from "./config.js";

app.use(express.static("public"));

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
  "https://www.googleapis.com/auth/userinfo.profile"
]

const authorizationUrl = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',
  scope: scopes,
  include_granted_scopes: true
});

app.get("/auth/google", (req, res) => {
  // res.writeHead(301, { "Location": authorizationUrl });
  res.redirect(301,authorizationUrl)
})

app.get("/auth/google/callback", (req, res) => {
  const {code} = req.query;
  res.status(200).json({
    message: code,})
})

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World!",
  });
});

app.post("/users", (req, res) => {
  (async () => {
    const data = await User.create({
      email: "nugraha@gmail.com",
      profile: "nugraha",
      password: "nugraha123",
    });
    console.log(data);
  })();
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
