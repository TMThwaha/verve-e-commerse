const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
       ref: "Category"
    },
    brand:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"brandModel"
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    image:{
        type:[String],
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }

},{timestamps:true})


const productModel = new mongoose.model('productModel',productSchema)

module.exports = productModel