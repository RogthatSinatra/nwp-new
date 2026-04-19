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
const Property = require('../models/property');




//single posts and updating views
// router.get('/:permalink', async (req, res, next) => {
//   let link =  req.params.permalink 
//   try {

//     const article = await Property.findOne({ permalink: link });

// if(article){
//     // Convert article.views to a number and check if it's NaN
//     if (isNaN(article.views)) {
//       // If it's NaN, set it to 1
//       article.views = 1;
//     } else {
//       // If it's a number, increment it by 1
//       article.views = Number(article.views) + 1;
//     }

//     // Save the updated article
//     await article.save();

//     res.render('singleproperty', {
//       article: article,
//       bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
//     });
//   }else{
//     res.render('error', { title: 'Sorry we found nothing', msg: 'Not Found' });
//   }
//   } catch (err) {
//     next(err);
//   }
// });

//properties
router.get('/2/view', ensureAuthenticated, async (req, res, next) => {
    try {
        const pageNombre = parseInt(req.query.p) || 1;
        const pageSize = 20;

        const skip = (pageNombre - 1) * pageSize;

        const [posts, totalPostsCount] = await Promise.all([
            Property.find({}).sort({ date: -1 }).skip(skip).limit(pageSize).lean(),
            Property.countDocuments({}),
        ]);

        const pageCount = Math.ceil(totalPostsCount / pageSize);

        res.render('admin/properties', {
            title: 'Properties',
            posts,
            all: totalPostsCount,
            exclude: 'yes',
            pagination: { page: pageNombre, pageCount },
            bodyClass: "home page-template-default page page-id-13 wp-embed-responsive en header-full-width full-width-content genesis-breadcrumbs-hidden safari mobile-device iphone osx frontend",
            message: req.flash("success"),
            error: req.flash("error")
        });

    } catch (err) {
        next(err);
    }
});

//Render Edit property
router.get("/:id/edit", ensureAuthenticated, (req, res, next) => {
    var properties = db.get("properties");
    properties.findOne(req.params.id, function(err, property) {
        res.render("add/editproperty", {
            title: property.title,
            property: property,
            exclude: 'yes',
            message: req.flash("success"),
            error: req.flash("error")
        });
    });
});


//back Date article
router.post("/:id/date", ensureAuthenticated, (req, res, next) => {
    var dated = req.body.date;
    var date = moment(dated).format()

    // Form Validation
    req.checkBody("date", "date is required.").notEmpty();


    //Check Errors
    var errors = req.validationErrors();
    if (errors) {
        res.render("add/editproperty", {
            errors: errors,
        });
    } else {
        var property = new Property();
        Property.findOne({ _id: req.params.id }, function(err, property) {
            if (!property) {
                res.send(err);
            } else {
                property.date = date;
                property.updated = date;
                property.save()
                req.flash("success", "Updated");
                res.location(`/properties/${property._id}/edit`);
                res.redirect(`/properties/${property._id}/edit`);
            }
        });
    }
});

//sold out
router.post("/available/:id", (req, res, next) => {
    var headlin = req.body.headlin;
    if (headlin === undefined) {
        headlin = 'off'
    }
    // Form Validation
    req.checkBody("headlin", "Invalid Property.").notEmpty();

    //Check Errors
    var errors = req.validationErrors();
    if (headlin) {
        var property = new Property();
        Property.findOne({ _id: req.params.id }, function(err, property) {
            if (!property) {
                res.send(err);
            } else {
                property.available = headlin;
                property.save()
                req.flash("success", "Updated");
                res.location("/properties/2/view");
                res.redirect("/properties/2/view");
            }
        });

    } else {
        res.json({ error: 'Failed' })
    }
});

//Delete Properties
router.get("/delete/:id", ensureAuthenticated, (req, res) => {
    var properties = db.get("properties");
    properties.remove(req.params.id, function(err, property) {
        if (err) {
            res.send(err);
        } else {
            req.flash("success", "Deleted");
            res.redirect("/properties/2/view");
        }
    });
});

router.get("/l/add", ensureAuthenticated, (req, res, next) => {
    var categories = db.get("categories");
    var users = db.get("users");
    categories.find({}, {}, function(err, categories) {
        users.find({}, {}, (err, users) => {
            res.render("add/addproperty", {
                title: "New Property",
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

//adding images 
router.post('/images/:id', ensureAuthenticated, (req, res, next) => {
    var idi = req.params.id
    var uri = req.body.uri

    if (idi && uri) {
        Property.findOne({ _id: idi }, function(err, property) {
            if (!property) {
                res.json('Invalid request')
            } else {
                property.images.push({
                    uri: uri,
                    added: moment(new Date()).format()
                })
                property.save()
                res.json('Added')
            }
        })
    } else {
        res.json({ error: 'Failed' })
    }
})

//removing images
router.post('/images/remove/:id', ensureAuthenticated, (req, res, next) => {
    var idi = req.params.id
    var id = req.body.id
    if (idi && id) {
        Property.findOne({ _id: idi }, function(err, property) {
            if (!property) {
                res.json('invalid request')
            } else {
                property.images.id(id).remove()
                property.save()
                res.json('removed')
            }
        })
    } else {
        res.json({ error: 'Failed' })
    }
})


router.post("/add", ensureAuthenticated, (req, res, next) => {
    var title = req.body.title
    var pType = req.body.pType
    var location = req.body.location
    var map = req.body.map
    var category = req.body.category
    var agent = req.body.agent
    var description = req.body.description
    var price = req.body.price
    var size = req.body.size
    var floors = req.body.floors
    var year = req.body.year
    var bath = req.body.bath
    var bed = req.body.bed
    var mainimage = req.body.mainimage
    var permalink = req.body.permalink


    // Form Validation
    req.checkBody("title", "Title field is required.").notEmpty();
    req.checkBody("category", "Category field is required.").notEmpty();
    req.checkBody("location", "location field is required.").notEmpty();
    req.checkBody("mainimage", "Main Image field is required.").notEmpty();
    req.checkBody("agent", "Agent name is required.").notEmpty();
    //Check Errors
    var errors = req.validationErrors();
    if (errors) {
        res.render("add/addproperty", {
            errors: errors
        });
    } else {
        var property = new Property()
        property.title = title
        property.pType = pType
        property.location = location
        property.map = map
        property.category = category
        property.agent = agent
        property.description = description
        property.price = price
        property.size = size
        property.floors = floors
        property.year = year
        property.bath = bath
        property.bed = bed
        property.mainimage = mainimage
        property.permalink = permalink
        property.date = moment(new Date()).format()
        property.available = "on"

        property.save(function(err, property) {
            if (err) {
                res.send(err);
            } else {
                req.flash("success", "Added");
                res.location(`/properties/${property._id}/edit`);
                res.redirect(`/properties/${property._id}/edit`);
            }
        });
    }
});

//update article
router.post("/:id/update", ensureAuthenticated, (req, res, next) => {
    var title = req.body.title
    var pType = req.body.pType
    var location = req.body.location
    var map = req.body.map
    var category = req.body.category
    var agent = req.body.agent
    var description = req.body.description
    var price = req.body.price
    var size = req.body.size
    var floors = req.body.floors
    var year = req.body.year
    var bath = req.body.bath
    var bed = req.body.bed
    var mainimage = req.body.mainimage
    var id = req.params.id;
    // Form Validation
    req.checkBody("title", "Title field is required.").notEmpty();
    req.checkBody("category", "Category field is required.").notEmpty();
    req.checkBody("mainimage", "Main Image field is required.").notEmpty();
    req.checkBody("agent", "Agent is required.").notEmpty();

    //Check Errors
    var errors = req.validationErrors();
    if (errors) {
        req.flash("error", errors);
        res.location(`/properties/${id}/edit`);
        res.redirect(`/properties/${id}/edit`);

    } else {
        var property = new Property();
        Property.findOne({ _id: id }, function(err, property) {
            if (!property) {
                res.send(err);
            } else {
                property.title = title
                property.pType = pType
                property.location = location
                property.map = map
                property.category = category
                property.agent = agent
                property.description = description
                property.price = price
                property.size = size
                property.floors = floors
                property.year = year
                property.bath = bath
                property.bed = bed
                property.mainimage = mainimage
                property.save()
                req.flash("success", "Updated");
                res.location(`/properties/${property._id}/edit`);
                res.redirect(`/properties/${property._id}/edit`);
            }
        });
    }
});
//single posts and updating views
router.get('/:permalink', async (req, res, next) => {
  let link =  req.params.permalink 
  try {

    const article = await Property.findOne({ permalink: link });

if(article){
    // Convert article.views to a number and check if it's NaN
    if (isNaN(article.views)) {
      // If it's NaN, set it to 1
      article.views = 1;
    } else {
      // If it's a number, increment it by 1
      article.views = Number(article.views) + 1;
    }

    // Save the updated article
    await article.save();

    res.render('singleproperty', {
      article: article,
      bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
    });
  }else{
    res.render('error', { title: 'Sorry we found nothing', msg: 'Not Found' });
  }
  } catch (err) {
    next(err);
  }
});


module.exports = router;