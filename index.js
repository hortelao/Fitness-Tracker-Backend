import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
import cors from "cors";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3001',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));
app.use(bodyParser.json());
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

//API Routes

/*
Route to create a user on DB
*/
app.post("/create-user", async (req, res) => {

  const fName = req.body.fName;
  const lName = req.body.lName;
  const email = req.body.email;
  const password = req.body.password;


  db.query("INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)", [fName, lName, email, password], (err, result) => {
    if (err) {
      res.sendStatus(400);
    } else {
      res.sendStatus(200);
    }
  });
});


/*
Route to get a user from DB
*/
app.post("/auth-user", async (req, res) => {
  const { email, token } = req.body;

  try {
    const result = await db.query("SELECT id, password FROM users WHERE email=$1", [email]);
    if (result.rowCount > 0 && token) {
      await db.query("UPDATE users SET token = $1 WHERE id = $2", [token, result.rows[0].id]);
      res.json(result.rows);
    } else {
      res.sendStatus(400);
    }
  } catch (err) {
    res.sendStatus(400);
  }
});

/*
Route to get all activities from a specific user from DB
*/
app.get("/activities/:user_id", async (req, res) => {
  let userId = parseInt(req.params.user_id);
  const result = await db.query("SELECT * FROM activity WHERE id_user=$1", [userId]);

  res.json(result.rows);
});


/*
Route to create an activity on DB
*/
app.post("/activity/create-activity", async (req, res) => {

  const idUser = req.body.idUser;
  const date = req.body.date;
  const exercise = req.body.exercise;


  const result = await db.query("INSERT INTO activity (id_user, date, exercise) VALUES ($1, $2, $3) RETURNING id", [idUser, date, exercise]);
  res.json(result.rows);
});

/*
Route to get a specific series from a specific activity from DB
*/
app.get("/activity/series/:id", async (req, res) => {
  let searchId = parseInt(req.params.id);
  const result = await db.query("SELECT * FROM series WHERE id_activity=$1", [searchId]);

  res.json(result.rows);
});

/*
Route to create a serie on DB
*/
app.post("/activity/series/create-serie", async (req, res) => {

  const idActivity = req.body.idActivity;
  const reps = req.body.reps;
  const weight = req.body.weight;


  const result = await db.query("INSERT INTO series (id_activity, reps, weight) VALUES ($1, $2, $3)", [idActivity, reps, weight]);
  res.sendStatus(200);
});


app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});