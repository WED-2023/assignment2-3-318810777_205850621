require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
const DButils = require("./routes/utils/DButils");
var cors = require("cors");

var app = express();
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(
  session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 24 hours
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
    cookie: {
      httpOnly: false,
    },
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files
app.use(express.static(path.join(__dirname, "dist")));

const corsConfig = {
  origin: "http://localhost:8080", // Replace with your actual frontend domain
  credentials: true,
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

var port = process.env.PORT || "80"; //local=3000 remote=80

const auth = require("./routes/auth");
const user = require("./routes/user");
const recipes = require("./routes/recipes");

// Public routes
app.use("/auth", auth); // Routes that do not require authentication

// Middleware to protect private routes
// app.use((req, res, next) => {
//   if (!req.session.user_id) {
//     console.log("no user id");
//     return res.status(401).send("hello");
//   }
//   next();
// });

// Private routes
app.use("/users", auth); // Routes that require authentication
app.use("/recipes", recipes);

app.get("/alive", (req, res) => res.send("I'm alive"));

app.get("/test", async (req, res) => {
  try {
    console.log(req.query.username);
    const users = await DButils.execQuery(
      `SELECT username FROM users WHERE username='${req.query.username}'`
    );
    if (users.length === 0) {
      res.send("No such user");
    }
    res.send(users);
  } catch (err) {
    console.error("Error in /test endpoint:", err);
    res.status(500).send("An error occurred");
  }
});

// Default error handler
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).send({ message: err.message, success: false });
});

const server = app.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});

process.on("SIGINT", function () {
  if (server) {
    server.close(() => console.log("server closed"));
  }
  process.exit();
});
