const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    added: {type: Date, default: Date.now},
    uri: String 
});

const propertySchema = new Schema({
    title: String,
    pType: String,
    location: String,
    map: String,
    category: String,
    agent: String,
    description: String,
    
    price: String,
    size: String,
    floors: String,
    year: String,
    bath: String,
    bed: String,

    mainimage: String,
    images: {type: [imageSchema]},

    updated: String,
    date: String,
    permalink: String,
    views: Number,
    available: {type: String, default: 'on' }
});
var Property = module.exports = mongoose.model('Property', propertySchema);