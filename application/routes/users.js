"use strict";

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const db = require("../helpers/db");
const UserError = require("../helpers/error/UserError");

const SALT_ROUNDS = 12;

// Cookie options for security
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// GET users listing
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// GET registration page
router.get("/register", function (req, res, next) {
  res.render("register", { title: "Register", csrfToken: req.csrfToken ? req.csrfToken() : "" });
});

// POST registration
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, email } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      throw new UserError("All fields are required", "/users/register", 400);
    }

    // Sanitize and validate inputs
    const sanitizedUsername = validator.trim(validator.escape(username));
    const sanitizedEmail = validator.normalizeEmail(email);

    if (!validator.isLength(sanitizedUsername, { min: 3, max: 50 })) {
      throw new UserError("Username must be between 3 and 50 characters", "/users/register", 400);
    }

    if (!validator.isAlphanumeric(sanitizedUsername.replace(/_/g, ""))) {
      throw new UserError("Username can only contain letters, numbers, and underscores", "/users/register", 400);
    }

    if (!validator.isEmail(email)) {
      throw new UserError("Please enter a valid email address", "/users/register", 400);
    }

    // Password strength validation
    if (!validator.isLength(password, { min: 8 })) {
      throw new UserError("Password must be at least 8 characters long", "/users/register", 400);
    }

    if (!validator.isStrongPassword(password, { minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 0 })) {
      throw new UserError("Password must contain at least one uppercase letter, one lowercase letter, and one number", "/users/register", 400);
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT id FROM Users WHERE username = ? OR email = ?",
      [sanitizedUsername, sanitizedEmail]
    );

    if (existingUsers.length > 0) {
      throw new UserError(
        "Username or email already exists",
        "/users/register",
        400
      );
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user with hashed password
    const [result] = await db.query(
      "INSERT INTO Users (username, password, email) VALUES (?, ?, ?)",
      [sanitizedUsername, hashedPassword, sanitizedEmail]
    );

    res.redirect("/users/login?registered=true");
  } catch (error) {
    if (error instanceof UserError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR" || error.code === "ENOTFOUND") {
      console.error("Database connection error:", error.message);
      res.status(503).render("error", {
        title: "Error",
        message: "Unable to connect to the database. Please try again later.",
      });
    } else {
      console.error("Registration error:", error.message);
      res.status(500).render("error", {
        title: "Error",
        message: "An error occurred during registration. Please try again.",
      });
    }
  }
});

// GET login page
router.get("/login", function (req, res, next) {
  const registered = req.query.registered === "true";
  res.render("login", { title: "Login", registered, csrfToken: req.csrfToken ? req.csrfToken() : "" });
});

// POST login
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new UserError("Username and password are required", "/users/login", 400);
    }

    // Sanitize username
    const sanitizedUsername = validator.trim(validator.escape(username));

    // Get user with hashed password
    const [users] = await db.query(
      "SELECT id, username, password FROM Users WHERE username = ?",
      [sanitizedUsername]
    );

    if (users.length === 0) {
      throw new UserError("Invalid username or password", "/users/login", 401);
    }

    // Compare password with hash
    const isValidPassword = await bcrypt.compare(password, users[0].password);

    if (!isValidPassword) {
      throw new UserError("Invalid username or password", "/users/login", 401);
    }

    // Set secure cookies
    res.cookie("userId", users[0].id, cookieOptions);
    res.cookie("username", users[0].username, cookieOptions);

    res.redirect("/");
  } catch (error) {
    if (error instanceof UserError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else if (error.code === "ECONNREFUSED" || error.code === "ER_ACCESS_DENIED_ERROR" || error.code === "ENOTFOUND") {
      console.error("Database connection error:", error.message);
      res.status(503).render("error", {
        title: "Error",
        message: "Unable to connect to the database. Please try again later.",
      });
    } else {
      console.error("Login error:", error.message);
      res.status(500).render("error", {
        title: "Error",
        message: "An error occurred during login. Please try again.",
      });
    }
  }
});

// GET logout
router.get("/logout", function (req, res, next) {
  res.clearCookie("userId", cookieOptions);
  res.clearCookie("username", cookieOptions);
  res.redirect("/");
});

module.exports = router;
