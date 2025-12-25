"use strict";

const express = require("express");
const router = express.Router();
const db = require("../helpers/db");
const PostError = require("../helpers/error/PostError");

// GET all posts (videos)
router.get("/", async function (req, res, next) {
  try {
    const [posts] = await db.query(
      `SELECT p.id, p.title, p.video_url, p.description, p.created_at,
              u.username as author
       FROM Posts p
       JOIN Users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    res.render("posts", {
      title: "Videos",
      posts,
      username: req.cookies.username,
    });
  } catch (error) {
    next(error);
  }
});

// GET create post page
router.get("/create", function (req, res, next) {
  if (!req.cookies.userId) {
    return res.redirect("/users/login");
  }
  res.render("create-post", {
    title: "Post Video",
    username: req.cookies.username,
  });
});

// POST create new post
router.post("/create", async function (req, res, next) {
  try {
    if (!req.cookies.userId) {
      throw new PostError("You must be logged in to post", "/users/login", 401);
    }

    const { title, video_url, description } = req.body;

    if (!title || !video_url) {
      throw new PostError("Title and video URL are required", "/posts/create", 400);
    }

    const [result] = await db.query(
      "INSERT INTO Posts (user_id, title, video_url, description) VALUES (?, ?, ?, ?)",
      [req.cookies.userId, title, video_url, description || ""]
    );

    res.redirect(`/posts/${result.insertId}`);
  } catch (error) {
    if (error instanceof PostError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else {
      next(error);
    }
  }
});

// GET single post with comments
router.get("/:id", async function (req, res, next) {
  try {
    const postId = req.params.id;

    const [posts] = await db.query(
      `SELECT p.id, p.title, p.video_url, p.description, p.created_at,
              u.username as author
       FROM Posts p
       JOIN Users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [postId]
    );

    if (posts.length === 0) {
      throw new PostError("Video not found", "/posts", 404);
    }

    const [comments] = await db.query(
      `SELECT c.id, c.comment_text, c.created_at, u.username
       FROM Comments c
       JOIN Users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at DESC`,
      [postId]
    );

    res.render("view-post", {
      title: posts[0].title,
      post: posts[0],
      comments,
      username: req.cookies.username,
      userId: req.cookies.userId,
    });
  } catch (error) {
    if (error instanceof PostError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else {
      next(error);
    }
  }
});

// POST add comment to post
router.post("/:id/comments", async function (req, res, next) {
  try {
    if (!req.cookies.userId) {
      throw new PostError("You must be logged in to comment", "/users/login", 401);
    }

    const postId = req.params.id;
    const { comment_text } = req.body;

    if (!comment_text || comment_text.trim() === "") {
      throw new PostError("Comment cannot be empty", `/posts/${postId}`, 400);
    }

    await db.query(
      "INSERT INTO Comments (user_id, post_id, comment_text) VALUES (?, ?, ?)",
      [req.cookies.userId, postId, comment_text.trim()]
    );

    res.redirect(`/posts/${postId}`);
  } catch (error) {
    if (error instanceof PostError) {
      res.status(error.getStatus()).render("error", {
        title: "Error",
        message: error.getMessage(),
      });
    } else {
      next(error);
    }
  }
});

module.exports = router;
