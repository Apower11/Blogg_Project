const express = require("express");

const router = express.Router();
const User = require("../models/User");

const authController = require("../controllers/auth");
const {check, body} = require("express-validator");

router.get("/login", authController.getLogin);

router.post("/login",
[check('email')
.isEmail()
.withMessage("Please enter a valid email")
.custom((value, { req }) => {
    return User.findOne({email: value}).then(userDoc => {
        if(!userDoc) {
            return Promise.reject("No user with this email.")
        }
    })
})
.normalizeEmail(),
body("password", "Password must be at least 5 characters and contain only letters and numbers")
.isAlphanumeric()
.isLength({min: 5})
.trim()],
authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/register", authController.getRegister);

router.post("/register", 
check('email')
.isEmail()
.withMessage("Please enter a valid email.")
.custom((value, {req}) => {
    return User.findOne({email: value})
    .then(userDoc => {
        if(userDoc){
            return Promise.reject(
                'E-mail exists already, please pick a different one.'
            );
        }
    })
})
.normalizeEmail(),
body("password", "Please enter a password that is at least 5 characters long and contains only letters and numbers")
.isLength({min: 5})
.isAlphanumeric()
.trim(),
body('confirmPassword')
.custom((value, {req}) => {
    if(value !== req.body.password) {
        throw new Error('Passwords have to match!');
    }
    return true;
})
.trim() 
, authController.postRegister);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;