const express = require("express");
var router = express.Router();
const multer = require("multer");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs');
const moment = require('moment');
//Handle File uploads
var upload = multer({ dest: "./public/images/bio" });
var User = require("../models/user");

/*GET user listing */

// router.get('/', (req, res, next) => {
//     res.send('respond with a resource');
// });

router.get("/register",  ensureAdmin, (req, res, next) => {
    res.render("register", { title: "Register" });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

router.post("/register",   ensureAdmin, (req, res, next) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var bio = req.body.bio;
    var passwordConfirmation = req.body.passwordConfirmation;
    // Form Validation
    req.checkBody("name", "Name field is required.").notEmpty();
    req.checkBody("email", "Email field is required.").notEmpty();
    req.checkBody("email", "Email must be valid.").isEmail();
    req.checkBody("username", "Username field is required.").notEmpty();
    req.checkBody("password", "Password field is required.").notEmpty();
    req.checkBody("passwordConfirmation", "Password do not match.").equals(
        req.body.password
    );

    // Check Errors
    var errors = req.validationErrors();
    if (errors) {
        res.render("register", {
            errors: errors,
        });
    } else {
        var newUser = new User({
            display_name: name,
            email: email,
            username: username,
            password: password,
            txtp: password

        });

        User.createUser(newUser, (err, user) => {
            if (!err) {
                // console.log(user);
                req.flash("success", "Registered Successful");
                res.location("/users/login");
                res.redirect("/users/login");
            } else if (err.code === 11000) {
                req.flash("error", "User Already exists");
                res.location("/user/signup");
                res.redirect("/user/signup");
            } else if (err) {
                console.log(err)
            }
        });
    }
});

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(
    new LocalStrategy(function (username, password, done) {
        User.getUserByUsername(username, (err, user) => {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: "Unknown User" });
            }
            User.comparePassword(password, user.password, (err, isMatch) => {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: "Invalid Password" });
                }
            });
        });
    })
);

router.get("/login", (req, res, next) => {
    res.locals.message = req.flash("message");
    res.render("login", {
        title: "Log in",
        message: req.flash("success"),
        error: req.flash("error")
    });
});

router.post("/login",
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: "Invalid username or password",
    }),
    function (req, res) {
        req.user.logged = moment(new Date()).format()
        req.user.save()
        req.flash("success", "You are now logged in");
        res.redirect("/admin");
    }
);

//change password
router.post('/change-password', ensureAuthenticated, async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const email = req.user.email;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not Found');
      res.redirect('/account');
      return res.status(401);
    }

    // Check if the current password matches
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatches) {
      req.flash('error', 'Incorrect User');
      res.redirect('/account');
      return res.status(401);
    }

    // Check if the new password and confirmation match
    if (newPassword !== confirmPassword) {
      req.flash('error', 'New password and confirmation do not match');
      res.redirect('/account');
      return res.status(400);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedPassword;
    user.txtp = newPassword;
    await user.save();
    
    req.flash('success', 'Password updated successfully'); // Use 'success' instead of 'error' for success messages
    res.redirect('/account');
    return res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// router.get('/reset-passwords', async (req, res) => {
//   try {
//     const updateResult = await User.updateMany({}, { password: '$2a$10$jQkVKPxjBjfRnspTUSbYeury.0rhDqf8wInCKPW2DPJsP42Z452h2' });

//     res.send(`${updateResult.nModified} user passwords updated successfully.`);

//   } catch (error) {
//     console.error('Error updating user passwords:', error);
//     res.status(500).send('Internal Server Error');
//   } 
// });

router.get("/logout", (req, res) => {
    req.logout();
    // req.flash('success', 'Your are now logged out');
    res.redirect("/users/login");
});

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next()
    }
    res.redirect("/users/login")
}

module.exports = router;