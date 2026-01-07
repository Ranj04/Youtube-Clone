"use strict";

const express = require("express");
const router = express.Router();
const validator = require("validator");
const db = require("../helpers/db");
const PostError = require("../helpers/error/PostError");

// Allowed video embed domains for security
const ALLOWED_VIDEO_DOMAINS = [
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "player.vimeo.com",
  "www.dailymotion.com",
];

// Validate video URL is from allowed domains
function isValidVideoUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ALLOWED_VIDEO_DOMAINS.includes(parsedUrl.hostname);
  } catch {
    return false;
  }
}

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
    // If database is not ready, still render the page with empty posts
    console.error("Database error:", error.message);
    res.render("posts", {
      title: "Videos",
      posts: [],
      username: req.cookies.username,
      dbError: true,
    });
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
    csrfToken: req.csrfToken ? req.csrfToken() : "",
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

    // Sanitize inputs
    const sanitizedTitle = validator.trim(validator.escape(title));
    const sanitizedDescription = description ? validator.trim(validator.escape(description)) : "";

    // Validate title length
    if (!validator.isLength(sanitizedTitle, { min: 1, max: 255 })) {
      throw new PostError("Title must be between 1 and 255 characters", "/posts/create", 400);
    }

    // Validate description length
    if (sanitizedDescription && !validator.isLength(sanitizedDescription, { max: 5000 })) {
      throw new PostError("Description must be less than 5000 characters", "/posts/create", 400);
    }

    // Validate video URL
    if (!validator.isURL(video_url, { protocols: ["https"], require_protocol: true })) {
      throw new PostError("Please enter a valid HTTPS video URL", "/posts/create", 400);
    }

    if (!isValidVideoUrl(video_url)) {
      throw new PostError("Video URL must be from YouTube, Vimeo, or Dailymotion", "/posts/create", 400);
    }

    const [result] = await db.query(
      "INSERT INTO Posts (user_id, title, video_url, description) VALUES (?, ?, ?, ?)",
      [req.cookies.userId, sanitizedTitle, video_url, sanitizedDescription]
    );

    res.redirect(`/posts/${result.insertId}`);
  } catch (error) {
    if (error instanceof PostError) {
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
      console.error("Post creation error:", error.message);
      res.status(500).render("error", {
        title: "Error",
        message: "An error occurred while creating the video. Please try again.",
      });
    }
  }
});

// GET single post with comments
router.get("/:id", async function (req, res, next) {
  try {
    const postId = req.params.id;

    // Validate post ID is a number
    if (!validator.isInt(postId, { min: 1 })) {
      throw new PostError("Invalid video ID", "/posts", 400);
    }

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
      csrfToken: req.csrfToken ? req.csrfToken() : "",
    });
  } catch (error) {
    if (error instanceof PostError) {
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
      console.error("View post error:", error.message);
      res.status(500).render("error", {
        title: "Error",
        message: "An error occurred while loading the video. Please try again.",
      });
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

    // Validate post ID
    if (!validator.isInt(postId, { min: 1 })) {
      throw new PostError("Invalid video ID", "/posts", 400);
    }

    if (!comment_text || comment_text.trim() === "") {
      throw new PostError("Comment cannot be empty", `/posts/${postId}`, 400);
    }

    // Sanitize and validate comment
    const sanitizedComment = validator.trim(comment_text);

    if (!validator.isLength(sanitizedComment, { min: 1, max: 5000 })) {
      throw new PostError("Comment must be between 1 and 5000 characters", `/posts/${postId}`, 400);
    }

    // Verify post exists
    const [posts] = await db.query("SELECT id FROM Posts WHERE id = ?", [postId]);
    if (posts.length === 0) {
      throw new PostError("Video not found", "/posts", 404);
    }

    await db.query(
      "INSERT INTO Comments (user_id, post_id, comment_text) VALUES (?, ?, ?)",
      [req.cookies.userId, postId, sanitizedComment]
    );

    res.redirect(`/posts/${postId}`);
  } catch (error) {
    if (error instanceof PostError) {
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
      console.error("Comment error:", error.message);
      res.status(500).render("error", {
        title: "Error",
        message: "An error occurred while posting your comment. Please try again.",
      });
    }
  }
});

module.exports = router;
