const express = require('express')
var router = express.Router()
const mongo = require('mongodb')
const url = process.env.MONGODB_URI;
const db = require('monk')(url)
const expressHbs = require('express-handlebars')
var paginate = require('handlebars-paginate')
const moment = require('moment')
const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs');
const path = require('path');
const archiver = require('archiver'); 
const Post = require('../models/post');
const Property = require('../models/property');
const User = require('../models/user');

/*GET home */
router.get("/", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "Nationwide Properties builds Uganda's most premium residential estate Homes. Arrange your viewing today!",
            keywords: ", nationwide properties Uganda",
            Ogimg: "/images/wa.png",
            Ogurl: "",
        };
        res.render("index", {
            title: "Nationwide Properties (NWP)",
            home:'is-active active',
            bodyClass: "home page-template-default page page-id-13 wp-embed-responsive en header-full-width full-width-content genesis-breadcrumbs-hidden safari mobile-device iphone osx frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/gallery", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "Nationwide Properties builds Uganda's most premium residential estate Homes. Arrange your viewing today!",
            keywords: ", nationwide properties Uganda",
            Ogimg: "/images/wa.png",
            Ogurl: "gallery",
        };
        res.render("gallery", {
            title: "Gallery | Nationwide Properties",
            gallery:'is-active active',
            bodyClass: "wp-singular page-template page-template-template-gallery page page-id-2147 wp-embed-responsive wp-theme-nwp lang-en gallery"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/royal-palms", (req, res, next) => {
        res.redirect("/properties")
})

router.get("/blog", async (req, res, next) => {
    try {
      const posts = await Post.find({}).sort({ date: -1 })
        res.locals.metaTags = {
            summary: "Blogs and news about our business and properties",
            keywords: ", nationwide properties Uganda",
            Ogimg: "http://res.cloudinary.com/duywopocg/image/upload/w_600,f_auto/v1712092879/brink-news/enoknxoein4ng1uimdxq.png",
            Ogurl: "/blog",
        };
        res.render("blog", {
            posts: posts,
            blog:'is-active active',
            title: "News and Updates | Nation wide Properties",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/thegardens", async (req, res, next) => {
    try {
        const type = req.query.t
        res.locals.metaTags = {
            summary: "Introducing The GARDENS by THE ROYAL PALMS where Luxury living meets Tranquility. Our 3 and 2 bedroom Apartments offer Spacious, Aesthetically designed homes in a secure Environment with modern Amenities and a Prime Location. It’s the Perfect place to call Home.",
            keywords: ", nationwide properties Uganda",
            Ogimg: "/images/thegardens1.webp",
            Ogurl: "/thegardens",
        };
        if(type){
         const posts = await Property.find({category: type}).sort({ date: -1 })
        
        res.render("properties", {
            posts: posts,
            gardens:'is-active active',
            type: type,
            title: "Available properties for sale and rent  | Nation wide Properties",
            bodyClass: "page-template-default page page-id-33 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device windows frontend"
        });
        }else{
      const posts = await Property.find({}).sort({ date: -1 })
        res.render("properties", {
            posts: posts,
            title: "Available properties for sale and rent  | Nation wide Properties",
            bodyClass: "page-template-default page page-id-33 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device windows frontend"
        });
    }
    } catch (err) {
        next(err);
    }
});
// router.get("/properties", async (req, res, next) => {
//     try {
//         const type = req.query.t
//         if(type){
//          const posts = await Property.find({category: type}).sort({ date: -1 })
//         res.locals.metaTags = {
//             summary: "Nationwide Properties builds Uganda's most premium residential estate Homes. Arrange your viewing today!",
//             keywords: ", nationwide properties Uganda",
//             Ogimg: "/images/wa.png",
//             Ogurl: "properties",
//         };
//         res.render("properties", {
//             posts: posts,
//             type: type,
//             title: "Available properties for sale and rent  | Nation wide Properties",
//             bodyClass: "page-template-default page page-id-33 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device windows frontend"
//         });
//         }else{
//       const posts = await Property.find({}).sort({ date: -1 })
//         res.locals.metaTags = {
//             summary: "Nationwide Properties builds Uganda's most premium residential estate Homes. Arrange your viewing today!",
//             keywords: ", nationwide properties Uganda",
//             Ogimg: "/images/wa.png",
//             Ogurl: "properties",
//         };
//         res.render("properties", {
//             posts: posts,
//             title: "Available properties for sale and rent  | Nation wide Properties",
//             bodyClass: "page-template-default page page-id-33 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device windows frontend"
//         });
//     }
//     } catch (err) {
//         next(err);
//     }
// });
function capitalizeText(inputString) {
  return inputString.replace(/\b\w/g, match => match.toUpperCase());
}

//single category with pagination
router.get('/c/:category', async (req, res, next) => {
     var pageNombre = req.query.p
     let cat = req.params.category
     cat = capitalizeText(cat)
    if (isNaN(pageNombre)) {
        pageNombre = 1
    }
    if (pageNombre === 1) {
        var start = 0
    } else {
        start = parseInt(pageNombre * 9 - 9)
    }
  try {
    const posts = await Post.find({ category: cat }).sort({ date: -1 })
    var end = pageNombre * 9
    let postsF = posts.slice(start, end)

    //metatags
    res.locals.metaTags = {
            summary: `Page ${pageNombre} Articles posted in ${cat}`,
            keywords: `${cat}`,
            Ogimg: "/images/logo.png",
            Ogurl: `/c/${cat}`,
        };

    res.render('cat', {
      title: `${posts.length} Articles in ${cat} | Nation wide properties`,
      posts: postsF,
      cat: cat,
      pagination: { page: pageNombre, pageCount: Math.ceil(posts.length / 9) },
    });

  } catch (err) {
    next(err);
  }
});

//author
router.get('/a/:author', async (req, res, next) => {
  try {
    const pageNombre = parseInt(req.query.p) || 1;
    const pageSize = 9;

    let cat = capitalizeText(req.params.author);
    const regex = new RegExp(cat.replace(/-/g, "\\s*"), "i");

    const skip = (pageNombre - 1) * pageSize;

    const [posts, userx, totalPostsCount] = await Promise.all([
      Post.find({ author: regex }).sort({ date: -1 }).skip(skip).limit(pageSize).lean(),
      User.findOne({ display_name: cat }).lean(),
      Post.countDocuments({ author: regex }),
    ]);

    const pageCount = Math.ceil(totalPostsCount / pageSize);

    // metatags
    res.locals.metaTags = {
      summary: `Articles posted or authored by ${cat}`,
      keywords: `${cat}`,
      Ogimg: `/images/bio/${cat}`,
      Ogurl: `/c/${cat}`,
    };

    res.render('cat', {
      title: `${totalPostsCount} Articles written by ${cat}`,
      posts,
      userx,
      pagination: { page: pageNombre, pageCount },
    });

  } catch (err) {
    next(err);
  }
});





/*GET Search*/
router.get("/search", (req, res, next) => {
    res.render("search", { title: "Search"});
});


//contact
router.get('/contact', (req, res, next) => {
    res.locals.metaTags = {
        summary: "Get in touch with a realtor or property manager to attend to your queries about our properties",
        keywords: "Contact us, address, location, royal palms contacts",
        Ogimg: "/images/contact.jpg",
        Ogurl: "/contact",
    };
    res.render('contact', { title: 'Contact Us', contact:'is-active active', bodyClass: "wp-singular page-template page-template-template-contact page page-id-2155 wp-embed-responsive wp-theme-nwp lang-en contact" })
})

//about
router.get('/about', (req, res, next) => {
    res.locals.metaTags = {
        summary: "For the last 10 years, Nationwide Properties Limited under its brand, The Royal Palms, has been building residential properties across Kampala, Uganda, in both rental and mainly for sale markets.",
        keywords: "About us, address, location",
        Ogimg: "/images/wa.png",
        Ogurl: "/about",
    };
    res.render('about', { title: 'About Us', about:'is-active active', bodyClass: "privacy-policy page-template-default page page-id-3 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
 })
})


//team
router.get('/team', (req, res, next) => {
    res.locals.metaTags = {
        summary: "Welcome to our team page! Meet the dedicated professionals behind our mission to transform real estate in East Africa. Our team is comprised of experienced realtors, innovative architects, and customer-focused support staff, all working together to create meaningful and sustainable spaces for our clients. We pride ourselves on our deep local knowledge, commitment to excellence, and passion for building vibrant communities. Discover the people who are here to guide you every step of the way in finding your perfect property.",
        keywords: "About us, our team, location, property managers",
        Ogimg: "/images/wa.png",
        Ogurl: "/team",
    };
    res.render('team', { title: 'Our Team', contact:'team', bodyClass: "page-template-default page page-id-433 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend" })
})

//privacy
router.get('/privacy-policy', (req, res, next) => {
    res.render('privacy-policy', { 
      title: 'Privacy Policy',             
      bodyClass: "privacy-policy page-template-default page page-id-3 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
    })
})


//articles
router.get('/articles/:p', async (req, res, next) => {
  try {
    const pageNombre = isNaN(req.params.p) ? 1 : parseInt(req.params.p);
    const pageSize = 9;

    const skip = (pageNombre - 1) * pageSize;

    const [posts, totalPostsCount] = await Promise.all([
      Post.find({}).sort({ date: -1 }).skip(skip).limit(pageSize).lean(),
      Post.countDocuments({}),
    ]);

    const pageCount = Math.ceil(totalPostsCount / pageSize);

    // metatags
    res.locals.metaTags = {
      summary: `Page ${pageNombre} Articles posted on Nation wide properties`,
      Ogimg: "/images/logo.png",
      Ogurl: `/articles/${pageNombre}`,
    };

    res.render('blog', {
      title: `Page ${pageNombre} in ${totalPostsCount} Articles | TNationwide Properties`,
      posts,
      blog:'is-active active',
      pagination: { page: pageNombre, pageCount },
    });
  } catch (err) {
    next(err);
  }
});


//admin
router.get('/admin', ensureAuthenticated, async (req, res, next) => {
  try {
    const pageNombre = parseInt(req.query.p) || 1;
    const pageSize = 20;

    const skip = (pageNombre - 1) * pageSize;

    const [posts, totalPostsCount] = await Promise.all([
      Post.find({}).sort({ date: -1 }).skip(skip).limit(pageSize).lean(),
      Post.countDocuments({}),
    ]);

    const pageCount = Math.ceil(totalPostsCount / pageSize);

    res.render('admin/posts', {
      title: 'Admin',
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



router.get("/admin/users", ensureAdmin, (req, res, next) => {
     var users = db.get("users")
        users.find({}, {}, (err, users) => {
        res.render('admin/users', {
            users: users,
            message: req.flash("success"),
            exclude: 'yes',
            error: req.flash("error")
             })
    })    
})

//backups
const collectionsToBackup = ['posts', 'users', 'categories', 'properties'];
router.get('/backup', ensureAdmin, (req, res, next) => {
  var db = req.db;
  var secretxxx = Math.random().toString(36).substring(2, 9)
  const archive = archiver('zip'); // Use archiver to create a zip file

  res.attachment(`backup-${secretxxx}.zip`); // Set the response to indicate a downloadable zip file

  archive.pipe(res); // Pipe the archive to the response stream

  Promise.all(collectionsToBackup.map((collection) => {
    return db.get(collection).find({}, {})
      .then((backupData) => {
        backupData.reverse();
        const jsonData = { [collection]: backupData };
        const jsonString = JSON.stringify(jsonData, null, 2);

        const now = new Date();
        const formattedDateTime = now.toISOString().replace(/:/g, '-');
        const fileName = `${collection}-${formattedDateTime}.json`;

        // Add the file to the archive
        archive.append(jsonString, { name: fileName });

        // You can remove the following lines as they are not needed anymore
        // const filePath = path.join(__dirname, '../public/backup2', fileName);
        // return fs.writeFile(filePath, jsonString, 'utf-8');
      })
      .catch((err) => {
        console.error('Error backing up collection', collection, err);
        return Promise.reject(err);
      });
  }))
  .then(() => {
    archive.finalize(); // Finalize the archive after all files are added
  })
  .catch((err) => {
    console.error('Error during backups:', err);
    res.status(500).json({ error: 'Error during backups' });
  });
});

//account
router.get("/account", ensureAuthenticated, (req, res, next) => {
        res.render("account", {
            title: 'Account',
            exclude: 'yes',
            message: req.flash("success"),
            error: req.flash("error")
         })
})
router.get("/properties", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "Nationwide Properties builds Uganda's most premium residential estate Homes. see our previous projects of the royal palm gardens, apartments, villas and more homes",
            keywords: ", nationwide properties Uganda",
            Ogimg: "/projects/1.webp",
            Ogurl: "/properties",
        };
        res.render("projects", {
            title: "Royal Palms locations and Projects",
            current: 'yes',
            properties:'is-active active',
            bodyClass: "home page-template-default page page-id-13 wp-embed-responsive en header-full-width full-width-content genesis-breadcrumbs-hidden safari mobile-device iphone osx frontend"
        });
    } catch (err) {
        next(err);
    }
});

//projects
// router.get("/royal-palms", async (req, res, next) => {
//     try {
//         res.locals.metaTags = {
//             summary: "Nationwide Properties builds Uganda's most premium residential estate Homes. Arrange your viewing today!",
//             keywords: ", nationwide properties Uganda",
//             Ogimg: "/images/wa.png",
//             Ogurl: "royal-palms",
//         };
//         res.render("projects", {
//             title: "Royal Palms locations and Projects",
//             current: 'yes',
//             bodyClass: "home page-template-default page page-id-13 wp-embed-responsive en header-full-width full-width-content genesis-breadcrumbs-hidden safari mobile-device iphone osx frontend"
//         });
//     } catch (err) {
//         next(err);
//     }
// });

//butabika
router.get("/royal-palms/5villa-virgocourt", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "Virgo Court now forms the 4th phase of homes being brought into the estate, and boasts luxurious contemporary home designs in both 4 and 5 bedroom configurations.",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/1.webp",
            Ogurl: "/royal-palms/5villa-virgocourt",
        };
        res.render("p/butabika/1", {
            title: "Royal Palms Butabika Villas",
            royalpalms:'is-active active',
            current: 'yes',
            bath: "5",
            bed: "5",
            p: "1",
            t:"12",
            desc: `<p>Virgo Court now forms the 4th phase of homes being brought into the estate, and boasts luxurious contemporary home designs in both 4 and 5 bedroom configurations.</p><p>The Virgo Court Villa provides the ultimate living spaces within the Royal Palms Estate. It comprises of 5 Bedrooms, 5 Bathrooms, a large kitchen and both informal and formal living spaces. This is all but a few of the luxuries you can expect from the villas. Situated on a dedicated 8500 square foot plot, the villa boasts 3600 square foot of premium living space, ample parking and its own gardens.</p>`,
            size: "8500",
            disc: "Discovering Butabika",
            discover: `<p>Located a mere 20 minutes from Kampala's business district, Butabika is perfectly located to get out of the bustling city centre of Kampala and enter a beautiful neighbourhood surrounded by lush greenery and quiet streets. The Estate located at the heart of Butabika, consists of 130 acres of overall space, securing the serene environment around it. Other features of the area include Gems Cambridge International School, shops, restaurants and convenience stores walking distance from the homes which are all tucked into the neat and pristine estate. The Royal Palms Estate is expanding continuously and is now home to other features such as a newly opened 2 acre horse riding facility, and finally a state of the art health and fitness centre to open in 2021.</p>`,
            ame: `<li>8500 Square foot plot</li>
<li>3600 Square foot living space</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>4 King Sized  Bedrooms</li>
<li>5 Bathrooms</li>
<li>Maids Room</li>
<li>Informal living space</li>
<li>Formal living space with grand entrance</li>
<li>Space for 8 seater dining table</li>
<li>Large kitchen space</li>
<li>Dedicated laundry area</li>
<li>Ample paved parking</li>
<li>Large grass gardens</li>
<li>Rooftop Terrace & Balcony</li>
<li>Security from estate</li>
<li>Community Living</li>
<li>Serene environment</li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.4781006985713!2d32.65689787109823!3d0.31526794897802213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbecd56666899%3A0xdbbe5f031b79e09b!2sRoyal%20Palms%20Estate%2C%20Kampala!5e1!3m2!1sen!2sug!4v1712506225041!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Royal Palms estate - Butabika",
            type: "Single family home",
            img: "/projects/1.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/royal-palms/5bedroom-virgocourt", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "Virgo Court now forms the 4th phase of homes being brought into the estate, and boasts luxurious contemporary home designs in both 4 and 5 bedroom configurations.",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/2.webp",
            Ogurl: "/royal-palms/5bedroom-virgocourt",
        };
        res.render("p/butabika/1", {
            title: "Royal Palms Butabika 5 Bedroom Detached",
            royalpalms:'is-active active',
            bath: "5",
            bed: "5",
            t:"12",
            p: "2",
            desc:`<p>Virgo Court now forms the 4th phase of homes being brought into the estate, and boasts luxurious contemporary home designs in both 4 and 5 bedroom configurations.</p> 
<p>The Virgo Court 5 bedroom home provides modern premium living space at affordable pricing. It comprises of 5 Bedrooms, 5 Bathrooms, a large kitchen and modern living spaces. The detached home is placed on a 3900 square foot plot & the home spans 2800 square foot of premium living space over three floors, ample parking and its own garden.</p>`,
            size: "3900",
            disc: "Discovering Butabika",
            discover: `<p>Located a mere 20 minutes from Kampala's business district, Butabika is perfectly located to get out of the bustling city centre of Kampala and enter a beautiful neighbourhood surrounded by lush greenery and quiet streets. The Estate located at the heart of Butabika, consists of 130 acres of overall space, securing the serene environment around it. Other features of the area include Gems Cambridge International School, shops, restaurants and convenience stores walking distance from the homes which are all tucked into the neat and pristine estate. The Royal Palms Estate is expanding continuously and is now home to other features such as a newly opened 2 acre horse riding facility, and finally a state of the art health and fitness centre to open in 2021.</p>`,
            ame: `<li>3900 Square foot plot</li>
<li>2800 Square foot living space</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>3 Regular Bedrooms & 1 King Sized Bedroom</li>
<li>5 Bathrooms</li>
<li>Maids Room</li>
<li>Formal living space with grand entrance</li>
<li>Space for 6 seater dining table</li>
<li>Large kitchen space</li>
<li>Dedicated laundry area</li>
<li>Ample paved parking</li>
<li>Large grass gardens</li>
<li>Rooftop Terrace & Balcony</li>
<li>Security from estate</li>
<li>Community Living</li>
<li>Serene environment</li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.4781006985713!2d32.65689787109823!3d0.31526794897802213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbecd56666899%3A0xdbbe5f031b79e09b!2sRoyal%20Palms%20Estate%2C%20Kampala!5e1!3m2!1sen!2sug!4v1712506225041!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Royal Palms estate - Butabika",
            type: "Single family home",
            img: "/projects/2.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});


router.get("/royal-palms/4bedroom-virgocourt", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "The Virgo Court 4 bedroom home provides modern premium living space at affordable pricing. It comprises of 4 Bedrooms, 3 Bathrooms, a large kitchen with storage and ample living spaces. The detached home is placed on a 3700 square foot plot & the home spans 1850 square foot of premium living space, paved parking and its own garden. ",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/3.webp",
            Ogurl: "/royal-palms/4bedroom-virgocourt",
        };
        res.render("p/butabika/1", {
            title: "Royal Palms Butabika 4 Bedroom Detached",
            royalpalms:'is-active active',
            bath: "3",
            t:"9",
            bed: "4",
            p: "3",
            desc:`<p>The Virgo Court 4 bedroom home provides modern premium living space at affordable pricing. It comprises of 4 Bedrooms, 3 Bathrooms, a large kitchen with storage and ample living spaces. The detached home is placed on a 3700 square foot plot & the home spans 1850 square foot of premium living space, paved parking and its own garden. </p>`,
            size: "3700",
            disc: "Discovering Butabika",
            discover: `<p>Located a mere 20 minutes from Kampala's business district, Butabika is perfectly located to get out of the bustling city centre of Kampala and enter a beautiful neighbourhood surrounded by lush greenery and quiet streets. The Estate located at the heart of Butabika, consists of 130 acres of overall space, securing the serene environment around it. Other features of the area include Gems Cambridge International School, shops, restaurants and convenience stores walking distance from the homes which are all tucked into the neat and pristine estate. The Royal Palms Estate is expanding continuously and is now home to other features such as a newly opened 2 acre horse riding facility, and finally a state of the art health and fitness centre to open in 2021.</p>`,
            ame: `<li>3700 Square foot plot</li>
<li>1800 Square foot living space</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>3 Regular Bedrooms </li>
<li>3 Bathrooms</li>
<li>Formal living space</li>
<li>Space for 6 seater dining table</li>
<li>Large kitchen space</li>
<li>Dedicated laundry area</li>
<li>Paved parking</li>
<li>Large grass garden</li>
<li>Security from estate</li>
<li>Community Living</li>
<li>Serene environment</li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.4781006985713!2d32.65689787109823!3d0.31526794897802213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbecd56666899%3A0xdbbe5f031b79e09b!2sRoyal%20Palms%20Estate%2C%20Kampala!5e1!3m2!1sen!2sug!4v1712506225041!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Royal Palms estate - Butabika",
            type: "Single family home",
            img: "/projects/3.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/royal-palms/villa-mbuya", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "The Royal Palms Villas Mbuya are 6 stunning villa properties located at the top of Ismail Road, Mbuya. They comprises of 5 Bedrooms, 5 Bathrooms, a large kitchen and both informal and formal living spaces. This is all but a few of the luxuries you can expect from the villas. Situated on a dedicated 8500 square foot plot, the villa boasts 3600 square foot of premium living space, ample parking and its own gardens. ",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/4.webp",
            Ogurl: "/royal-palms/villa-mbuya",
        };
        res.render("p/butabika/1", {
            title: "Royal Palms Mbuya Villas",
            royalpalms:'is-active active',
            bath: "5",
            t:"12",
            bed: "5",
            p: "4",
            desc:`<p>
The Royal Palms Villas Mbuya are 6 stunning villa properties located at the top of Ismail Road, Mbuya. They comprises of 5 Bedrooms, 5 Bathrooms, a large kitchen and both informal and formal living spaces. This is all but a few of the luxuries you can expect from the villas. Situated on a dedicated 8500 square foot plot, the villa boasts 3600 square foot of premium living space, ample parking and its own gardens. </p>`,
            size: "8500",
            disc: "Discovering Mbuya",
            discover: `<p>Mbuya is the ideal neighbourhood when it comes to living in Uganda. It does not compromise when travelling to and fro the business districts of Kampala, a mere 10 minute drive can take you to either end, as well as being a peaceful and quiet area. Ismael road is also ideally located, giving these villas amazing views of the surrounding areas and landscapes. Mbuya is a more upper class neighbourhood being close to village mall in Bugolobi as well as a variety of other shops and features. Mbuya places itself well with access to the neighbourhoods of Bugolobi, Lugogo and Butabika. It also has easy access to the Kampala-Jinja highway.</p>`,
            ame: `<li>8500 Square foot plot</li>
<li>3600 Square foot living space</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>4 King Sized  Bedrooms</li>
<li>5 Bathrooms</li>
<li>Maids Room</li>
<li>Informal living space</li>
<li>Formal living space with grand entrance</li>
<li>Space for 8 seater dining table</li>
<li>Large kitchen space</li>
<li>Dedicated laundry area</li>
<li>Ample paved parking</li>
<li>Large grass gardens</li>
<li>Rooftop Terrace & Balcony</li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31918.01028087481!2d32.590566453981374!3d0.3321339285341683!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177db9a75e15c541%3A0xbf74aa2dd678eb9b!2sRoyal%20Palms%2C%20Ismael%20Road!5e0!3m2!1sen!2sug!4v1712589434267!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Royal Palms estate - Mbuya",
            type: "Single family home",
            img: "/projects/4.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/royal-palms/apartments-kawalyakaggwa", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "The Royal Palms Kawalya Kaggwa Apartments are the finest living Kampala has to offer. Situated in the heart of Kololo, a premium neighbourhood in Kampala, every apartment boasts breath-taking views, large premium living spaces and are kitted out with contemporary furniture to compliment space. Each apartment has it's own telecom access control, smart entry and are fully kitted with everything you need and more..",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/5.webp",
            Ogurl: "/royal-palms/apartments-kawalyakaggwa",
        };
        res.render("p/apartments/1", {
            title: "Royal Palms Kawalya Kaggwa Apartments",
            royalpalms:'is-active active',
            bath: "3",
            t:"12",
            bed: "2",
            p: "5",
            desc:`<p>The Royal Palms Kawalya Kaggwa Apartments are the finest living Kampala has to offer. Situated in the heart of Kololo, a premium neighbourhood in Kampala, every apartment boasts breath-taking views, large premium living spaces and are kitted out with contemporary furniture to compliment space. Each apartment has it's own telecom access control, smart entry and are fully kitted with everything you need and more...</p>`,
            size: "8500",
            disc: "Discovering Kololo",
            discover: `<p>Kololo is Kampala cities most premium neighbourhood, hosting large homes, luxury apartments, shopping malls and other features alike. It is located right in the city centre and is nestled right next to Uganda Golf Club. The area host a variety of restaurants and nightlife. It does thill all without removing the authentic feel of living within Kampala, and most areas preserve the plantation and environment surrounding it. The area also is home to Kololo airstrip where many famous speeches and events have been hosted.</p>`,
            ame: `<li>Large living spaces</li>
<li>Lift access</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>2 King Sized  Bedrooms</li>
<li>3 Bathrooms</li>
<li>Ample premium living space</li>
<li>Closed fully kitted kitchen</li>
<li>6 seater dining table</li>
<li>Key Card access</li>
<li>aundry area</li>
<li>Parking space provided</li>
<li>Large grass gardens</li>
<li>Terrace & Balcony</li>
<li>Security from estate</li>
<li>Community Living</li>
<li>Amazing views</li>
<li>Gym</li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31917.89923189038!2d32.57113005398235!3d0.3649051264162733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbba3a4099709%3A0xea26d81277049cd!2s15%20Kawalya%20Kaggwa%20Cl%2C%20Kampala!5e0!3m2!1sen!2sug!4v1712596551144!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Kololo",
            type: "Apartment",
            img: "/projects/5.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/royal-palms/apartments-mulago", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "The Royal Palms Mulago Apartments are the finest living Kampala has to offer. Situated in the heart of Mulago, a premium neighbourhood in Kampala, every apartment boasts breath-taking views, large premium living spaces and are kitted out with contemporary furniture to compliment space. Each apartment has it's own dedicated parking, onsite security and hosts premium features. The flats are also situated a short 5 minute walk from Acacia Mall and other major parts of Kololo.",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/6.webp",
            Ogurl: "/royal-palms/apartments-mulago",
        };
        res.render("p/apartments/1", {
            title: "Royal Palms Mulago Apartments",
            royalpalms:'is-active active',
            bath: "2",
            t:"13",
            bed: "3",
            p: "6",
            desc:`<p>The Royal Palms Mulago Apartments are the finest living Kampala has to offer. Situated in the heart of Mulago, a premium neighbourhood in Kampala, every apartment boasts breath-taking views, large premium living spaces and are kitted out with contemporary furniture to compliment space. Each apartment has it's own dedicated parking, onsite security and hosts premium features. The flats are also situated a short 5 minute walk from Acacia Mall and other major parts of Kololo.</p>`,
            size: "8500",
            disc: "Discovering Kololo",
            discover: `<p>Kololo is Kampala cities most premium neighbourhood, hosting large homes, luxury apartments, shopping malls and other features alike. It is located right in the city centre and is nestled right next to Uganda Golf Club. The area host a variety of restaurants and nightlife. It does thill all without removing the authentic feel of living within Kampala, and most areas preserve the plantation and environment surrounding it. The area also is home to Kololo airstrip where many famous speeches and events have been hosted.</p>`,
            ame: `<li>Large living spaces</li>
<li>Lift access</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>3 + King Sized  Bedrooms</li>
<li>2 + Bathrooms</li>
<li>Ample premium living space</li>
<li>Closed fully kitted kitchen</li>
<li>6 seater dining table</li>
<li>Private Laundry area</li>
<li>Parking space provided</li>
<li>Garden Area</li>
<li>Terrace & Balcony</li>
<li>Security from estate</li>
<li>Community Living</li>
<li>Amazing views</li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31917.89923189038!2d32.57113005398235!3d0.3649051264162733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbba3a4099709%3A0xea26d81277049cd!2s15%20Kawalya%20Kaggwa%20Cl%2C%20Kampala!5e0!3m2!1sen!2sug!4v1712596551144!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Kololo",
            type: "Pent House",
            img: "/projects/6.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});

router.get("/royal-palms/apartments-nakasero", async (req, res, next) => {
    try {
        res.locals.metaTags = {
            summary: "The Royal Palms Nakasero Apartments provide ultra modern living in Kampala. Situated in the heart of Nakasero, a premium neighbourhood in Kampala close to major city landmarks and financial institutions, every apartment boasts premium living space kitted out with contemporary furniture to compliment the space. Each apartment has it's own telecom access control and are fully kitted with everything you need and more...",
            keywords: ", nationwide properties Uganda, house for sale, royal palms kampala",
            Ogimg: "/projects/7.webp",
            Ogurl: "/royal-palms/apartments-nakasero",
        };
        res.render("p/apartments/1", {
            title: "Royal Palms Nakasero Apartments",
            royalpalms:'is-active active',
            bath: "2",
            t:"19",
            bed: "3",
            p: "7",
            desc:`<p>The Royal Palms Nakasero Apartments provide ultra modern living in Kampala. Situated in the heart of Nakasero, a premium neighbourhood in Kampala close to major city landmarks and financial institutions, every apartment boasts premium living space kitted out with contemporary furniture to compliment the space. Each apartment has it's own telecom access control and are fully kitted with everything you need and more...</p>`,
            size: "8500",
            disc: "Discovering Nakasero",
            discover: `<p>Nakasero is a hill located in central Kampala, the capital and largest city of Uganda. Nakasero is important to Uganda's economy and politics, as it is home to Kampala's central business district and several government offices, including the Ugandan Parliament Buildings. It is next to Kololo, another premium residential area within Kampala. You can find everything you are looking for and more from Nakasero. The area is walking distance from many shops, restaurants and famous hotels. Nothing is too far.</p>`,
            ame: `<li>Large living spaces</li>
<li>Lift access</li>
<li>Ensuite Master Bedroom with walk-in wardrobe</li>
<li>2 King Sized  Bedrooms</li>
<li>3 Bathrooms</li>
<li>Ample premium living space</li>
<li>Closed fully kitted kitchen</li>
<li>6 seater dining table</li>
<li>Outdoor Seating area</li>
<li>Laundry area</li>
<li>Parking space provided</li>
<li>Large grass gardens</li>
<li>Terrace & Balcony</li>
<li>Security from estate</li>
<li>Community Living</li>
<li>Large Swimming Pool</li>
<li>Gym </li>`,
            map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63835.82474422232!2d32.546958994591996!3d0.36118250662483065!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb81d67317e9%3A0xb1be35fc54f4508a!2sBaker%20Cl%2C%20Kampala!5e0!3m2!1sen!2sug!4v1712598381527!5m2!1sen!2sug" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`,
            location: "Nakasero",
            type: "Apartment",
            img: "/projects/7.webp",
            bodyClass: "page-template-default page page-id-431 wp-embed-responsive en not-home header-full-width full-width-content genesis-breadcrumbs-hidden chrome desktop-device frontend"
        });
    } catch (err) {
        next(err);
    }
});
//single posts and updating views
router.get('/:permalink', async (req, res, next) => {
  let link = '/' + req.params.permalink + '/';
  try {
    // Find the article based on permalink
    const article = await Post.findOne({ permalink: link });

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

    // Fetch the latest posts and similar posts
    const latestPosts = await Post.find({ permalink: { $ne: link } }).sort({ date: -1 }).limit(3).exec();
    const similarPosts = await Post.find({ category: article.category, permalink: { $ne: link } }).sort({ date: -1 }).limit(4).exec();

    // Render the page with the updated article and other data
    res.render('singlepage', {
      similar: similarPosts,
      blog:'is-active active',
      posts: latestPosts,
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


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/users/login')
}

function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next()
    }
    res.redirect("/users/login")
}

module.exports = router