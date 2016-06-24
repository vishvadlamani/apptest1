var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var sanitizer = require('sanitizer'); // data santize
 
// set up a mongoose model
var OrdersSchema = new Schema({  
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zip: {
        type: Number,
        required: true
    },
    cc_number: {
        type: Number,
        required: true
    },
    cvv: {
        type: Number,
        required: true
    },
    exp_month: {
        type: Number,
        required: true
    },
    exp_year: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});
 

module.exports = mongoose.model('Orders', OrdersSchema);
