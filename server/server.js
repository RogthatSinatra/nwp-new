const express = require('express');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
var helpers = require('template-helpers')();
const multer = require('multer');
//Handle File uploads
var upload = multer({ dest: './public/images' });
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const { PORT, MONGODB_URI} = require('../routes/config');
const moment = require('moment');
const url = process.env.MONGODB_URI;
const db = require('monk')(url);
var helpers = require('handlebars-helpers')();
var paginate = require('handlebars-paginate');

//var db = mongoose.connection;
var cors = require('cors')
var routes = require('../routes/index');
var users = require('../routes/users');
var posts = require('../routes/posts');
var properties = require('../routes/properties');
var categories = require('../routes/categories');

var app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

//include partials
hbs.registerPartials(path.join(__dirname, "../", "/views/partials"));
app.use(express.static(path.join(__dirname, '../public')));
// app.engine('.hbs', expressHbs({ defaultLayout: 'layout', extname: '.hbs' }));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Make our db accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    next();
});

// Handle Sessions
// app.use(cookieSession({
//     secret: 'secret',
//     saveUninitialized: true,
//     resave: true
// }));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
// Passport 
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

// Express messages for flash notification rendering
app.use(flash());
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.get('*', function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

// Routes for our app
app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);
app.use('/properties', properties);
app.use('/categories', categories);


//handle bars helpers


//reverse
hbs.registerHelper('reverse', function(arr) {
    arr.reverse();
});

hbs.registerHelper('createPhotos', function(n, block) {
    let accum = '';
    for (let i = 0; i < n; ++i) {
        // Set the index (starting at 0 or 1 depending on your preference)
        // Here we use i for the data-index and i + 1 for the image filename
        accum += block.fn({
            index: i,
            imageNumber: i + 1
        });
    }
    return accum;
});

//ifCond
hbs.registerHelper('ifCond', function(v1, operator, v2, opts) {
    var isTrue = false;
    switch (operator) {
        case '===':
            isTrue = v1 === v2;
            break;
        case '!==':
            isTrue = v1 !== v2;
            break;
        case '<':
            isTrue = v1 < v2;
            break;
        case '<=':
            isTrue = v1 <= v2;
            break;
        case '>':
            isTrue = v1 > v2;
            break;
        case '>=':
            isTrue = v1 >= v2;
            break;
        case '||':
            isTrue = v1 || v2;
            break;
        case '&&':
            isTrue = v1 && v2;
            break;
    }
    return isTrue ? opts.fn(this) : opts.inverse(this);
});

//length
hbs.registerHelper('length', function(value) {
    if (util.isObject(value) && !util.isOptions(value)) {
        value = Object.keys(value);
    }
    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length;
    }
    return 0;
});

hbs.registerHelper('eachNum', function(num, options) {
  let ret = '';
  for (let i = 1; i <= num; i++) {
    ret += options.fn({ num: i });
  }
  return ret;
});

//Commas
hbs.registerHelper('addCommas', function(num) {
    if(num){
    return num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}else{
    return num;
}
});

//remove hypen
hbs.registerHelper('hyphen', function(str) {
    if(str){
    return str.replace(/[-\s]+$/, '');
}
});
hbs.registerHelper('slugify', function(str) {
    if(str){
    var trimmed = str.trim(str);
    str = trimmed.replace(/[^a-z0-9-æøå]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/æ/gi, 'ae')
    .replace(/ø/gi, 'oe')
    .replace(/å/gi, 'a');
    return str.toLowerCase();
}
});
//T17:23:30+03:00
hbs.registerHelper('trimDate', function(passedString, startstring, endstring) {
  var theString = passedString.substring(startstring, 10);
  return new hbs.SafeString(theString);
});
//withbefore
hbs.registerHelper('withBefore', function(array, idx, options) {
    if (!Array.isArray(array)) return '';
    array = array.slice(0, -idx);
    var result = '';

    for (var i = 0; i < array.length; i++) {
        result += options.fn(array[i]);
    }
    return result;
});

//withAfter
hbs.registerHelper('withAfter', function(array, idx, options) {
    if (!Array.isArray(array)) return '';
    array = array.slice(idx);
    var result = '';

    for (var i = 0; i < array.length; i++) {
        result += options.fn(array[i]);
    }
    return result;
});

hbs.registerHelper('withBetween', function(array, start, end, options) {
   if (!Array.isArray(array)) return '';

    // Get the range of items in the array based on start and end positions
    const arrayRange = array.slice(start, end);

    var result = '';

    for (var i = 0; i < arrayRange.length; i++) {
      result += options.fn(arrayRange[i]);
    }
    return result;
  });


//each random
hbs.registerHelper('eachRandom', function(items, options) {
    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    var newArray = shuffle(items);
    var total = newArray.length;
    var buffer = "";
    var i = 0;
    var j = total;
    while (i < j) {
        // stick an index property onto the item, starting
        // with 1, may make configurable later
        var item = newArray[i];
        item['index'] = i + 1;
        item['_total'] = total;
        item['isFirst'] = i === 0;
        item['isLast'] = i === (total - 1);
        // show the inside of the block
        buffer += options.fn(item);
        i++;
    }
    // return the finished buffer
    return buffer;

});

// Random one
hbs.registerHelper('randomOne', function(items, options){
    function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
   var newArray = shuffle(items);
    var total = newArray.length;
    var buffer = "";
    var i = 0;
    var j = 1;
    while (i < j) {
      // stick an index property onto the item, starting
      // with 1, may make configurable later
      var item = newArray[i];
      item['index'] = i + 1;
      item['_total'] = total;
      item['isFirst'] = i === 0;
      item['isLast'] = i === (total - 1);
      // show the inside of the block
      buffer += options.fn(item);
      i++;
    }
    // return the finished buffer
    return buffer;

});
//add one
hbs.registerHelper('addOne', function(index) {
    return index + 1
});

// Stringify
hbs.registerHelper('json', function(content) {
    return JSON.stringify(content);
});

//trim
hbs.registerHelper('trimString', function(passedString, startstring, endstring) {
    if(passedString && startstring && endstring) {
    var theString = passedString.substring(startstring, endstring);
    return new hbs.SafeString(theString);
}
});

//active page
hbs.registerHelper('active', function(cat) {
    if(cat === 'News'){
     return 'active1'
    }else if(cat === 'Business'){
     return 'active2'
    }else if(cat === 'Interviews'){
     return 'active3'   
    }else if(cat === 'Health And Fitness'){
     return 'active4'   
    }else if(cat === 'Technology'){
     return 'active5'   
    }else if(cat === 'Entertainment'){
     return 'active6'   
    }else if(cat === 'Travel'){
     return 'active7'   
    }else if(cat === 'Sports'){
     return 'active8'   
    }

    });
//pagination
hbs.registerHelper('paginate', paginate);

//format ks
hbs.registerHelper('knum', function(n){
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
});

hbs.registerHelper('dateFormat', function(date) {
    if(date){
    return moment(date).format('DD MMM YYYY')
}
});

//date difference
hbs.registerHelper('dated', function (date) {
    if(date){
  return moment(date).fromNow()
}
});
hbs.registerHelper('fulldate', function(date) {
    if(date){
    return moment().format('Do MMM YYYY, h:mm:ss a');
}
});
const port = process.env.PORT || 3000;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.metaTags = {body: 'error404 page-has-loaded'};
    res.locals.error = req.app.get('env') === 'production' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { title: 'Sorry we found nothing' });

});


app.listen(port, () => {
    console.log(`Started on port: ${port}`);
});

module.exports = { app };