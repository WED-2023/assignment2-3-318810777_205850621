var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

router.post("/Register", async (req, res, next) => {
  try {
    // Extract user details from the request body
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      profilePic: req.body.profilePic,
    };
    console.log(user_details);
    // Check if the username already exists
    let users = await DButils.execQuery(
      "SELECT username FROM users WHERE username = ?",
      [user_details.username]
    );
    if (users.length > 0) throw { status: 409, message: "Username taken" };

    // Hash the password
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    // Insert the new user into the database
    await DButils.execQuery(
      `INSERT INTO users (username, firstname, lastname, country, password, email, profilePic) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_details.username,
        user_details.firstname,
        user_details.lastname,
        user_details.country,
        hash_password,
        user_details.email,
        user_details.profilePic,
      ]
    );
    req.session.user_id = user_details.username;
    res.status(201).send({ message: "User created", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    // Check if the username exists
    console.log(req.body);
    const users = await DButils.execQuery(
      "SELECT username, password FROM users WHERE username = ?",
      [req.body.username]
    );
    if (users.length === 0)
      throw { status: 401, message: "Username or Password incorrect" };

    const user = users[0];

    // Check if the password is correct
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set session
    req.session.user_id = user.username;

    // Return success message
    res.status(200).send({ message: "Login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // Reset the session info
  res.send({ success: true, message: "Logout succeeded" });
});

router.get("/users/:username", async (req, res, next) => {
  try {
    const username = req.params.username;
    const user = await DButils.execQuery(
      "SELECT username FROM users WHERE username = ?",
      [username]
    );

    if (user.length === 0) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(user[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
