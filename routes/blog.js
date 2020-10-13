const express = require("express");

const blogController = require("../controllers/blog");

const router = express.Router();

router.get("/", blogController.home);

router.get("/feed", blogController.feed);

router.get("/feed/:category", blogController.categoryFeed);

router.get("/post/:postId", blogController.getPost);

module.exports = router;