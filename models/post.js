const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const postSchema = new Schema({
    title: String,
    category: String,
    body: String,
    updated: String,
    date: String,
    summary: String,
    permalink: String,
    credit: String,
    code: String,
    author: String,
    mainimage: String,
    views: Number,
    headline: {type: String, default: 'off' }
});
var Post = module.exports = mongoose.model('Post', postSchema);