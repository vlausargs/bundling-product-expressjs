const mongoose = require('mongoose');

const BundleSchema = mongoose.Schema({
    SKU: {
        type:String,
        required:true,
        unique: true,
    },
    qty: {
        type:String,
        required:true,
    },
    price: {
        type:String,
        required:true,
    }, 

})

module.exports = mongoose.model('bundles',BundleSchema);