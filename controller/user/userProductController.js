const userDb = require('../../model/UserModel');
const productModel = require("../../model/productModel");
const categoryModel = require("../../model/CategoryModel");
const cartModel = require('../../model/cartModel');
const brandModel = require('../../model/brandModel');
const Wishlist = require('../../model/wishlistModel');
const { render } = require('ejs');


module.exports = {

    productList: async (req, res) => {
        try {
            const productsPerPage = 16; 
            const userInfo = req.session.user;
            const page = parseInt(req.query.page) || 1; // Get the page number from query params

            // Count total products for pagination
            const totalProducts = await productModel.countDocuments({ status: true, stock: { $gt: 0 } });
            const totalPages = Math.ceil(totalProducts / productsPerPage);

            const products = await productModel.find({ status: true, stock: { $gt: 0 } })
                .skip((page - 1) * productsPerPage)
                .limit(productsPerPage);

            const category = await categoryModel.find({ status: true });
            const brand = await brandModel.find({ status: true });

            let cart = { cartProducts: [] };

            if (userInfo) {
                cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId');
                if (!cart) {
                    cart = { cartProducts: [] };
                }
            }

            res.render("user/productList", {
                userInfo,
                products,
                brand,
                category,
                cart,
                subTotal: 0,
                currentPage: page,
                totalPages: totalPages
            });

        } catch (error) {
            console.log(error);
            res.status(500).send("An error occurred");
        }
    },

    productDetail: async (req, res) => {
        try {
            console.log(req.params.id, "jkkkk");

            const id = req.params.id
            const userInfo = req.session.user;
            let cart = { cartProducts: [] };
            const product = await productModel.findById(id)
                .populate("category")
                .populate("brand");

            console.log("Product:", product);
            if (userInfo) {
                cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId');

                if (!cart) {
                    cart = { cartProducts: [] };
                }
                res.render('user/product-detail', { userInfo, product, cart, subTotal: 0 });
            } else {
                res.render('user/product-detail', { userInfo, product, subTotal: 0 });

            }




        } catch (error) {
            console.error('Error in productDetail:', error);
            res.status(500).send('Internal Server Error');
        }
    },



}




