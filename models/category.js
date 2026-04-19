const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    name: String
});
var Category = module.exports = mongoose.model('Category', categorySchema);