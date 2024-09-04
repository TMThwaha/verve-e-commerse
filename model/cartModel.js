const mongoose = require('mongoose');
const Product = require('./productModel')

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    cartProducts: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Product
            },

            price: {
                type: Number
            },
            total: {
                type: Number
            },
            quantity: {
                type: Number
            }
        }

    ],
    Grandtotal: {
        type: Number,
        default: 0
    },
});

const cartModel = mongoose.model("cart", cartSchema);

module.exports = cartModel