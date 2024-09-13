const userDb = require('../../model/UserModel');
const productModel = require("../../model/productModel");
const categoryModel = require("../../model/CategoryModel");
const cartModel = require('../../model/cartModel')
const { render } = require('ejs');


module.exports = {
    productList: async (req, res) => {


        try {

            const userInfo = req.session.user;
            console.log('/////////////',userInfo)
            const products = await productModel.find({ status: true });
            const category = await categoryModel.find({status: true});
            
            let cart = { cartProducts: [] };

            console.log('status ony trueeeeeeeeeeeeeee', cart.cartProducts);
            if (userInfo) {
                console.log('user indddddddddddddd');
                cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId');
               
                if (!cart) {
                    cart = { cartProducts: [] };
                }
                res.render("user/productList", { userInfo, products, category,cart,subTotal:0});
            } else {
                console.log('ilaaaaaaaaaaaaaaaaaaaaaaaaa');
                res.render("user/productList", { userInfo, products, category ,cart,subTotal:0});
            }


        } catch (error) {
            console.log(error);

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
            if(userInfo){
                cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId');
                // If cart is not found, ensure cart is still an empty object to prevent errors in the view
                if (!cart) {
                    cart = { cartProducts: [] };
                }
                res.render('user/product-detail', { userInfo, product ,cart,subTotal:0});
            }else{
                res.render('user/product-detail', { userInfo, product ,subTotal:0});

            }

            


        } catch (error) {
            console.error('Error in productDetail:', error);
            res.status(500).send('Internal Server Error');
        }
    },



}




