const express = require("express");

const adminController = require("../controllers/admin");

const Post = require("../models/Post");

const router = express.Router();

const {check, body} = require("express-validator");

const isAuth = require("../middleware/is-auth");

router.get("/admin/add-post", isAuth, adminController.getAddPost);

router.post("/admin/add-post", isAuth,
[
    check('title')
    .isLength({min: 5})
    .withMessage("Title must be at least 5 characters long")
    .isString()
    .withMessage("Title must contain only letters and numbers.")
    .custom((value, { req }) => {
        return Post.findOne({title: value})
        .then(postDoc => {
            if(postDoc){
                Promise.reject(
                    'There is another post with this title already, choose a different title.'
                )
            }
        })
    })
    .trim(),
    check('content')
    .isString()
    .isLength({min: 5, max: 400})
    .withMessage("The content must be between 5 to 400 characters long.")
    .trim()
]
,adminController.postAddPost)

router.get("/admin/dashboard", isAuth, adminController.dashboard);

router.post("/delete-post/:postId", isAuth, adminController.deletePost);

router.get("/admin/edit-post/:postId", isAuth, adminController.getEditPost);

router.post("/admin/edit-post/:postId", isAuth,
[
    check('title')
    .isLength({min: 5})
    .withMessage("Title must be at least 5 characters long")
    .isString()
    .withMessage("Title must contain only letters and numbers.")
    .custom((value, { req }) => {
        return Post.findOne({title: value})
        .then(postDoc => {
            if(postDoc){
                Promise.reject(
                    'There is another post with this title already, choose a different title.'
                )
            }
        })
    })
    .trim(),
    check('content')
    .isString()
    .isLength({min: 5, max: 400})
    .withMessage("The content must be between 5 to 400 characters long.")
    .trim()
]
,adminController.updatePost);

router.get("/admin/user-posts", isAuth, adminController.getUserPosts);

router.get("/admin/user-post/:postId", isAuth, adminController.getUserPost);

module.exports = router;