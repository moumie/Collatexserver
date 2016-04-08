var mongoose = require("mongoose");
var dbUrl= 'mongodb://localhost:27017/test';
mongoose.connect(dbUrl);
// create instance of Schema
var mongoSchema =   mongoose.Schema;
// create schema
var docSchema  = {
    "name" : String,
    "creator" : String
};
// create model if not exists.
module.exports = mongoose.model('docs',docSchema);