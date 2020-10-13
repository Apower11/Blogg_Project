const express = require("express");
const app = express();
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const path = require("path");

const MONGODB_URI = "mongodb+srv://apower11:stomedy69@cluster1-5mpwi.mongodb.net/Blog?retryWrites=true&w=majority";


const store = new mongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions"
});

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toDateString() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg'){
        cb(null, true)
    } else{
        cb(null, false)
    }
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

app.use(session({
    secret: "st james",
    resave: false,
    saveUninitialized: false,
    store: store
}));

app.use(csrfProtection);
app.use(flash());

app.set("view engine", "ejs");



const blogRoutes = require("./routes/blog");

const authRoutes = require("./routes/auth");

const adminRoutes = require("./routes/admin");

const errorController = require("./controllers/error");

const Post = require("./models/Post");

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.session.user;
    res.locals.csrfToken = req.csrfToken();
    next()
});

app.use(express.static("public"));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(authRoutes);

app.use(adminRoutes);

app.use(blogRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
    res.status(500).render("errors/500", {
        pageTitle: "Error!"
    })
})

mongoose.connect(MONGODB_URI)

app.listen(3000);