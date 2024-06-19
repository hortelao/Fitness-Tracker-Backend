import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(bodyParser.urlencoded({ extended: true }));

const API = process.env.API_URL;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.post("/create-user", async (req, res) => {
  // Send a POST request
      const fName = req.body.fName;
      const lName = req.body.lName;
      const email = req.body.email;
      const password = req.body.password;
    
  
    db.query("INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)", [fName, lName, email, password], (err, result) => {
      if(err) {
        res.sendStatus(400);
      } else {
        res.sendStatus(200);
      }
});

  
});


app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});