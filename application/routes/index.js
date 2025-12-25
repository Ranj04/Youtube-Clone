"use strict";

const express = require("express");
const router = express.Router();
const db = require("../helpers/db");

// GET home page
router.get("/", async function (req, res, next) {
  try {
    const [posts] = await db.query(
      `SELECT p.id, p.title, p.video_url, p.created_at, u.username as author
       FROM Posts p
       JOIN Users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT 8`
    );

    res.render("index", {
      title: "YouTube Clone",
      posts,
      username: req.cookies.username,
    });
  } catch (error) {
    // If database is not ready, still render the page
    res.render("index", {
      title: "YouTube Clone",
      posts: [],
      username: req.cookies.username,
    });
  }
});

module.exports = router;
