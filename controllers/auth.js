const crypto = require("crypto");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}))

exports.getLogin = (req, res, next) => {

    res.render("auth/login", {
        pageTitle: "Blogg - Login",
        errorMessage: req.flash('error'),
        validationErrors: []
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/login", {
            pageTitle: "Blogg - Login",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        })
    }

    User.findOne({email: email})
    .then(user => {
        if(!user) {
            req.flash('error', 'User with this email not found');
            return res.redirect("/login");
        } 
        bcrypt.compare(password, user.password)
        .then(doMatch => {
            if(!doMatch){
                req.flash("error", "Email and Password do not match");
                return res.redirect("/login");
            }
            if(doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect("/");
                })
            }
            res.redirect("/login");
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    })
};



exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/")
    })
};

exports.getRegister = (req, res, next) => {
    res.render("auth/register", {
        pageTitle: "Blogg - Register",
        errorMessage: req.flash("error"),
        oldInput: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
};

exports.postRegister = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/register", {
            pageTitle: "Blogg - Register",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                username: username,
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword
            },
            validationErrors: errors.array()
        })
    }

    if(req.body.confirmPassword !== password) {
        req.flash('error', 'Passwords have to match');
        res.redirect("/register");
    }

    if(req.body.confirmPassword === password){
        bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({
                username: username,
                email: email,
                password: hashedPassword
            })
            return user.save();
          })
            .then(result => {
                console.log("User created")
                    res.redirect("/login")
                return transporter.sendMail({
                    to: email,
                    from: "adampower45@hotmail.com",
                    subject: "Signup succeeded",
                    html: "<h1>You successfully signed up!</h1>"
                }).catch(err => {
                    console.log(err);
                })
            })
         
    } else{
        res.redirect("/register");
    }
}

exports.getReset = (req, res, next) => {
    res.render("auth/reset", {
        pageTitle: "Blogg - Reset Password",
        errorMessage: req.flash("error")
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString('hex');
        const email = req.body.email;
        User.findOne({email: req.body.email})
        .then(user => {
            if(!user) {
                req.flash('error', 'No account with that email found');
                return res.redirect("/reset");
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            return transporter.sendMail({
                to: email,
                from: "adampower45@hotmail.com",
                subject: "Password reset",
                html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new pasword.</p>`
            })
        })
        .catch(err => {
            console.log(err);
        })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({resetToken: token, resetTokenExpiration: { $gt: Date.now() }})
    .then(user => {
        res.render("auth/new-password", {
            pageTitle: "Blogg - New Password",
            errorMessage: req.flash("error"),
            userId: user._id.toString(),
            passwordToken: token
        })
    })
    .catch(err => {
        console.log(err);
    })
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
    .then(user => {
        console.log("Hello 1")
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        console.log("Hello 2")
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect("/login");
    })
    .catch(err => {
        console.log(err);
    })
}