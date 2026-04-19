const express = require('express');
var router = express.Router();
const mongo = require('mongodb');
const moment = require('moment');
const url = process.env.MONGODB_URI;
const db = require('monk')(url);


router.get('/show/:category', (req, res, next) => {
    var posts = db.get('posts');
    var categories = db.get('categories');
    posts.find({ category: req.params.category }, {}, function(err, posts) {
        categories.find({}, {}, function(err, categories) {
            posts.reverse();
            res.render('cat', {
                'title': req.params.category,
                "posts": posts,
                "categories": categories
            });
        })
    });
});

router.get('/', (req, res, next) => {
    var categories = db.get('categories');
    categories.find({}, {}, function(err, category) {
        res.render('index', {
            "categories": category
        });
    })
});


router.get("/delete/:id", ensureAuthenticated, (req, res) => {
    var categories = db.get('categories');
    categories.remove(req.params.id, function (err, category) {
        if (err) {
            res.send(err);
        } else {
            req.flash("success", "Deleted");
            res.redirect("/categories/add");
        }
    });
});


router.get('/add', ensureAuthenticated, (req, res, next) => {
    var categories = db.get('categories');
    categories.find({}, {}, function(err, categories) {
        if(categories){
            categories.reverse()
        }
        res.render('addcategory', {
            'title': 'Add Category',
            categories: categories,
            message: req.flash("success"),
            error: req.flash("error")

        });
    });

});



router.post('/add', ensureAuthenticated, (req, res, next) => {
    var name = req.body.name;
    // Form Validation
    req.checkBody('name', 'Category Name field is required.').notEmpty();

    //Check Errors
    var errors = req.validationErrors();
    if (errors) {
        res.render('addcategory', {
            errors: errors
        });
        //res.redirect('/categories/add');
    } else {
        var categories = db.get('categories');
        categories.insert({
            "name": name,

        }, function(err, post) {
            if (err) {
                res.send(err);
            } else {
                req.flash('success', 'Category Added!!!')
                res.location('/categories/add');
                res.redirect('/categories/add');
            }
        });
        console.log('posting to db');

    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
}


module.exports = router;