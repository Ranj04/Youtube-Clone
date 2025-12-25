"use strict";

const express = require("express");
const router = express.Router();
const db = require("../helpers/db");
const UserError = require("../helpers/error/UserError");

// GET users listing
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// GET registration page
router.get("/register", function (req, res, next) {
  res.render("register", { title: "Register" });
});

// POST registration
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      throw new UserError("All fields are required", "/users/register", 400);
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT id FROM Users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      throw new UserError(
        "Username or email already exists",
        "/users/register",
        400
      );
    }

    // Insert new user (Note: In production, password should be hashed)
    const [result] = await db.query(
      "INSERT INTO Users (username, password, email) VALUES (?, ?, ?)",
      [username, password, email]
    );

    res.redirect("/users/login?registered=true");
  } catch (error) {
    if (error instanceof UserError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else {
      next(error);
    }
  }
});

// GET login page
router.get("/login", function (req, res, next) {
  const registered = req.query.registered === "true";
  res.render("login", { title: "Login", registered });
});

// POST login
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new UserError("Username and password are required", "/users/login", 400);
    }

    const [users] = await db.query(
      "SELECT id, username FROM Users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (users.length === 0) {
      throw new UserError("Invalid username or password", "/users/login", 401);
    }

    // Set user cookie (simple session - in production use proper sessions)
    res.cookie("userId", users[0].id, { httpOnly: true });
    res.cookie("username", users[0].username, { httpOnly: true });

    res.redirect("/");
  } catch (error) {
    if (error instanceof UserError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else {
      next(error);
    }
  }
});

// GET logout
router.get("/logout", function (req, res, next) {
  res.clearCookie("userId");
  res.clearCookie("username");
  res.redirect("/");
});

module.exports = router;
