"use strict";

const createError = require("http-errors");

/**
 * Middleware to require authentication
 * Redirects to login page if user is not authenticated
 */
function requireAuth(req, res, next) {
  if (!req.cookies.userId) {
    return res.redirect("/users/login");
  }
  next();
}

/**
 * Middleware to require authentication for API routes
 * Returns 401 error if user is not authenticated
 */
function requireAuthAPI(req, res, next) {
  if (!req.cookies.userId) {
    return next(createError(401, "Authentication required"));
  }
  next();
}

/**
 * Middleware to optionally load user info
 * Adds user info to res.locals if authenticated
 */
function loadUser(req, res, next) {
  res.locals.userId = req.cookies.userId || null;
  res.locals.username = req.cookies.username || null;
  res.locals.isAuthenticated = !!req.cookies.userId;
  next();
}

module.exports = {
  requireAuth,
  requireAuthAPI,
  loadUser,
};
