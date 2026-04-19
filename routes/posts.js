const express = require("express");
const hbs = require("hbs");
var router = express.Router();
const multer = require("multer");
var upload = multer({ dest: "./public/images" });
const mongo = require("mongodb");
const moment = require("moment");
const url = process.env.MONGODB_URI;
const db = require("monk")(url);
const mongoose = require("mongoose");
var helpers = require("handlebars-helpers")();
var paginate = require("handlebars-paginate");
const Post = require('../models/post');

//Render Edit post
router.get("/:id/edit", ensureAuthenticated, (req, res, next) => {
    var posts = db.get("posts");
    var users = db.get("users");
    var categories = db.get("categories");
    posts.findOne(req.params.id, function (err, post) {
        users.find({}, {}, (err, users) => {
            categories.find({}, {}, (err, categories) => {
            res.render("add/editpost", {
                title: post.title,
                article: post,
                users: users,
                categories: categories,
                exclude: 'yes',
                message: req.flash("success"),
                error: req.flash("error")
                });
                // res.json({post})
            });
        });
    });
});


//update article
router.post("/:id/update", ensureAuthenticated, (req, res, next) => {
        var title = req.body.title;
        var category = req.body.category;
        var body = req.body.body;
        var author = req.body.author;
        var mainimage = req.body.mainimage;
        var permalink = req.body.permalink;
        var summary = req.body.summary;
        var credit = req.body.credit;
        var date =  moment(new Date()).format()

        // Form Validation
        req.checkBody("title", "Title field is required.").notEmpty();
        req.checkBody("category", "Category field is required.").notEmpty();
        req.checkBody("body", "Body field is required.").notEmpty();
        req.checkBody("mainimage", "Main Image field is required.").notEmpty();
        req.checkBody("author", "Author name is required.").notEmpty();

        //Check Errors
        var errors = req.validationErrors();
        if (errors) {
            res.render("add/editpost", {
                errors: errors,
            });
            //res.redirect('/posts/add');
            console.log(errors);
        } else {
            var post = new Post();
            Post.findOne({ _id: req.params.id }, function(err, post) {
                if (!post) {
                    res.send(err);
                } else {
                    post.title = title;
                    post.category = category;
                    post.body = body;
                    post.updated = date;
                    post.summary = summary;
                    post.credit = credit;
                    post.author = author;
                    post.mainimage = mainimage;
                    post.save()
                        req.flash("success", "Post Updated");
                        res.location(`/posts/${post._id}/edit`);
                        res.redirect(`/posts/${post._id}/edit`);
                    }
                }
            );
        }
    });
//back Date article
router.post("/:id/date", ensureAuthenticated, (req, res, next) => {
        var dated = req.body.date;
        var date =  moment(dated).format()

        // Form Validation
        req.checkBody("date", "date is required.").notEmpty();


        //Check Errors
        var errors = req.validationErrors();
        if (errors) {
            res.render("add/editpost", {
                errors: errors,
            });
        } else {
            var post = new Post();
            Post.findOne({ _id: req.params.id }, function(err, post) {
                if (!post) {
                    res.send(err);
                } else {
                    post.date = date;
                    post.updated = date;
                    post.save()
                        req.flash("success", "Updated");
                        res.location(`/posts/${post._id}/edit`);
                        res.redirect(`/posts/${post._id}/edit`);
                    }
                }
            );
        }
    });

//headlines
router.post("/headline/:id", (req, res, next) => {
        var headlin = req.body.headlin;
        if(headlin === undefined){
        headlin = 'off'
    }
        // Form Validation
        req.checkBody("headlin", "Invalid Post.").notEmpty();

        //Check Errors
        var errors = req.validationErrors();
        if (headlin) {
            var post = new Post();
            Post.findOne({ _id: req.params.id }, function(err, post) {
                if (!post) {
                    res.send(err);
                } else {
                    post.headline = headlin;
                    post.save()
                        req.flash("success", "Updated");
                        res.location("/admin");
                        res.redirect("/admin");
                    }
                }
            );

        }else{
            res.json({ error: 'Failed' })
        }
    });

//Delete Posts
router.get("/delete/:id", ensureAuthenticated, (req, res) => {
    var posts = db.get("posts");
    posts.remove(req.params.id, function (err, post) {
        if (err) {
            res.send(err);
        } else {
            req.flash("success", "Article Deleted");
            res.redirect("/admin");
        }
    });
});

router.get("/add", ensureAuthenticated, (req, res, next) => {
    var categories = db.get("categories");
    var users = db.get("users");
    categories.find({}, {}, function (err, categories) {
        users.find({}, {}, (err, users) => {
            res.render("add/addpost", {
                title: "New post",
                categories: categories,
                users: users,
            });
        });
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/users/login");
}

router.post("/add",  ensureAuthenticated, (req, res, next) => {
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var permalink = req.body.permalink;
    var mainimage = req.body.mainimage;
    var summary = req.body.summary;
    var credit = req.body.credit;
    var date =  moment(new Date()).format()

    // Form Validation
    req.checkBody("title", "Title field is required.").notEmpty();
    req.checkBody("category", "Category field is required.").notEmpty();
    req.checkBody("body", "Body field is required.").notEmpty();
    req.checkBody("mainimage", "Main Image field is required.").notEmpty();
    req.checkBody("author", "Author name is required.").notEmpty();
    //Check Errors
    var errors = req.validationErrors();
    if (errors) {
        res.render("add/addpost", {
            errors: errors
        });
    } else {
        var post = new Post()
                post.title = title
                post.category = category
                post.permalink = '/'+permalink+'/'
                post.body = body
                post.date = date
                post.author = author
                post.summary = summary
                post.credit = credit
                post.mainimage = mainimage
   
            post.save(function (err, post) {
                if (err) {
                    res.send(err);
                } else {
                    req.flash("success", "Article was Added");
                    res.location("/admin");
                    res.redirect("/admin");
            }
        });
    }
});
module.exports = router;