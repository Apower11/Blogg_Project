const Post = require("../models/Post");
const { validationResult } = require("express-validator");

const ITEMS_PER_PAGE = 3;

exports.getAddPost = (req, res, next) => {
    res.render("admin/add-post", {
        pageTitle: "Blogg - Add Post",
        path: "admin/add-post",
        validationErrors: [],
        errorMessage: req.flash("error")
    })
};

exports.postAddPost = (req, res, next) => {
    const postTitle = req.body.title;
    const postContent = req.body.content;
    const image = req.file;
    const postedAtExact = Date.now();
    const postedAtRough = new Date().toDateString();
    const author = req.session.user.username;
    const errors = validationResult(req);
    const category = req.body.category;

    if(!image) {
        return res.status(422).render("admin/add-post", {
            pageTitle: "Blogg - Add Post",
            errorMessage: 'Attached file is not an image.',
            oldInput: {
                title: postTitle,
                content: postContent
            },
            validationErrors: []
        })
    }

    const imageUrl = image.path;

    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("admin/add-post", {
            pageTitle: "Blogg - Add Post",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                title: postTitle,
                content: postContent
            },
            validationErrors: errors.array()
        })
    }

    const post = new Post({
        title: postTitle,
        content: postContent,
        imageUrl: imageUrl,
        category: category,
        postedAtExact: postedAtExact,
        postedAtRough: postedAtRough,
        userId: req.session.user,
        author: author
    });

    post.save().then(
        res.redirect("/feed")
    ).catch(err => {
        // res.redirect("500");
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getEditPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        const editablePost = post;
        res.render("admin/edit-post", {
            pageTitle: "Blogg - Edit Post",
            path: "admin/edit-post",
            post: editablePost,
            validationErrors: [],
            errorMessage: req.flash("error")
        })
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.updatePost = (req, res, next) => {
    const newTitle = req.body.title;
    const newContent = req.body.content;
    const newImage = req.file;
    const postId = req.params.postId;
    const errors = validationResult(req);

    console.log(postId);

    

    if(!newImage){
        return res.status(422).render("admin/edit-post", {
            pageTitle: "Blogg - Edit Post",
            errorMessage: "Attached file is not an image.",
            post: {
                title: newTitle,
                content: newContent,
                _id: postId
            },
            validationErrors: []
        })
    }

    

    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("admin/edit-post", {
            pageTitle: "Blogg - Edit Post",
            errorMessage: errors.array()[0].msg,
            post: {
                title: newTitle,
                content: newContent,
                _id: postId
            },
            validationErrors: errors.array()
        })
    }

    const newImageUrl = newImage.path;

    console.log(newImageUrl);

    Post.findById(postId).then(post => {
        console.log(post);
        if(post.userId.toString() !== req.session.user._id.toString()) {
            return res.redirect("/");
        }
        post.title = newTitle;
        post.content = newContent;
        if(newImage) {
            post.imageUrl = newImageUrl;
        }
        post.save().then(result => {
            res.redirect("/feed")
        }).catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        })
    }).catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
    
}

exports.dashboard = (req, res, next) => {
    const user = req.session.user;
    return Post.find({userId: req.session.user._id})
    .limit(3).then(posts => {
        const length = posts.length;
        let className = "post col s4 m4";
        if(length === 2){
            className = "post col s8 m6";
        } else if(length === 1){
            className = "post col s12 m12";
        }
        res.render("admin/dashboard", {
            pageTitle: "Blogg - Dashboard",
            user: user,
            posts: posts,
            className: className
        })
    }).catch(err => {
        console.log(err);
        
    })    
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.deleteOne({_id: postId, userId: req.session.user._id}).then(result => {
        res.redirect("/feed").catch(err => {
            const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
        })
    })
}

exports.getUserPosts = (req, res, next) => {
    const page = +req.query.page || 1;
    return Post.find({userId: req.session.user._id})
    .countDocuments()
    .then(numPosts => {
        totalItems = numPosts;
        return Post.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(posts => {
        res.render("admin/user-posts", {
            pageTitle: "Blogg - Your Posts",
            posts: posts,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        })
    }).catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
}

exports.getUserPost =(req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId).then(post => {
        res.render("admin/user-post", {
            pageTitle: "Blogg - Your Posts- " + post.title,
            post: post
        })
    })
}

