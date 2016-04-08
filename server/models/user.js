var mongoose    =   require("mongoose");
//mongoose.connect('mongodb://localhost:27017/demoDb');
var dbUrl= 'mongodb://localhost:27017/test';
mongoose.createConnection(dbUrl);
// create instance of Schema
var mongoSchema =   mongoose.Schema;
// create schema
var userSchema  = {
    "userEmail" : String,
    "userPassword" : String
};
// create model if not exists.
module.exports = mongoose.model('users',userSchema);