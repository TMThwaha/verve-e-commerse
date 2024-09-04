// const mongoose = require('mongoose');
// const categorySchema = mongoose.Schema({
//     name: {
        
//         required: true,
//         type: String,
      
//     },
//     status: {
//         type: Boolean,
//         default: true
//     },
    
// },{
//     timestamps:true
// })

// const categoryModel = new mongoose.model('categoryModel',categorySchema)

// module.exports = categoryModel







const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;