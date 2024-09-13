

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
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;