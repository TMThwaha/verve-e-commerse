const mongoose = require('mongoose');
const brandSchema = mongoose.Schema({
    name: {
        
        required: true,
        type: String,
      
    },
    status: {
        type: Boolean,
        default: true
    },
    
},{
    timestamps:true
})

const brandModel = new mongoose.model('brandModel', brandSchema)

module.exports = brandModel