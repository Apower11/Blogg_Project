const Post = require("../models/Post");

exports.home = (req, res, next) => {
    res.render("blog/home", {
        pageTitle: "Blogg - Home",
        path: "/"
    })
}

const ITEMS_PER_PAGE = 3;

exports.feed = (req, res, next) => {
    const page = +req.query.page || 1;
    return Post.find()
    .countDocuments().then(numPosts => {
        totalItems = numPosts
        return Post.find()
        .skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    }).then(posts => {
        res.render("blog/feed", {
            pageTitle: "Blogg - Feed",
            posts: posts,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            path: "/feed"
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.categoryFeed = (req, res, next) => {
    const category = req.params.category;
    const page = +req.query.page || 1;
    const path = "/feed/" + category;
    console.log(path);
    return Post.find({category: category})
    .countDocuments().then(numPosts => {
        totalItems = numPosts
        return Post.find({category: category})
        .skip((page-1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    }).then(posts => {
        res.render("blog/feed", {
            pageTitle: "Blogg - Feed",
            posts: posts,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        })
    }).catch(err => {
        console.log(err);
    })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        res.render("blog/post", {
            pageTitle: "Blogg - Posts- " + post.title,
            post: post,
            path: "/post/" + postId
        })
    })
}