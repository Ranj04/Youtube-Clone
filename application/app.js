"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const exphbs = require("express-handlebars");
const createError = require("http-errors");

// Import routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

// Import middleware
const { requireAuth } = require("./middleware/auth");

const app = express();

// Trust Railway's proxy (required for secure cookies and correct IP detection)
app.set("trust proxy", 1);

// View engine setup
const hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: "layout",
  layoutsDir: path.join(__dirname, "views/layouts"),
});
app.engine("hbs", hbs.engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// CSRF Protection using Double Submit Cookie pattern
const CSRF_COOKIE_NAME = "_csrf";
const CSRF_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// Generate CSRF token and set cookie
app.use((req, res, next) => {
  // Generate token if not exists
  let token = req.cookies[CSRF_COOKIE_NAME];
  if (!token) {
    token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS);
  }

  // Attach token getter to request
  req.csrfToken = () => token;
  next();
});

// CSRF validation middleware for POST requests
const validateCsrf = (req, res, next) => {
  if (req.method === "POST") {
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];
    const bodyToken = req.body._csrf;

    if (!cookieToken || !bodyToken || cookieToken !== bodyToken) {
      return res.status(403).render("error", {
        title: "Error",
        message: "Invalid CSRF token. Please refresh the page and try again.",
      });
    }
  }
  next();
};

// Apply CSRF validation to state-changing routes
app.use("/users/register", validateCsrf);
app.use("/users/login", validateCsrf);
app.use("/posts/create", validateCsrf);
app.use("/posts/:id/comments", validateCsrf);

// Make auth middleware available
app.set("requireAuth", requireAuth);

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Only expose error details in development
  const isDev = req.app.get("env") === "development";

  res.locals.message = err.message;
  res.locals.error = isDev ? err : {};
  res.locals.showStack = isDev;

  res.status(err.status || 500);
  res.render("error", { title: "Error" });
});

module.exports = app;
