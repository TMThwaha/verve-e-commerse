const userDb = require('../../model/UserModel');
const productModel = require('../../model/productModel');
const cartModel = require('../../model/cartModel');

module.exports = {
    addToCart: async (req, res) => {

        const productId = req.body.productId;
        
        try {
            // Check if the user is logged in
            if (!req.session.user) {
                return res.status(401).json({ success: false, msg: 'User not logged in' });
            }

            // Fetch the user's cart and the product
            const [cart, product] = await Promise.all([
                cartModel.findOne({ userId: req.session.user._id }),
                productModel.findById(productId)
            ]);

            // Check if product exists and stock is available
            if (!product) {
                return res.status(404).json({ success: false, msg: 'Product not found' });
            }

            if (product.stock <= 0) {
                return res.json({ success: false, msg: 'Stock Out' });
            }

            // If the user has an existing cart
            if (cart) {
                // Check if the product is already in the cart
                const productInCart = cart.cartProducts.find(item => item.productId.toString() == productId);

                if (productInCart) {
                    return res.json({ success: false, msg: 'Product already in cart' });
                }

                // Add the product to the cart
                cart.cartProducts.push({
                    productId: product._id,
                    quantity: 1,
                    price: product.price,
                    subtotal: product.price,
                });

                await cart.save();
                return res.json({ success: true, msg: 'Product added to cart' });

            } else {
                // If the user doesn't have a cart, create a new cart
                const newCart = new cartModel({
                    userId: req.session.user._id,
                    cartProducts: [{
                        productId: product._id,
                        quantity: 1,
                        price: product.price,
                        subtotal: product.price,
                    }]
                });

                await newCart.save();
                return res.json({ success: true, msg: 'Cart created and product added' });
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, msg: 'Server error' });
        }
    },
    userCart: async (req, res) => {

        try {
          
            
            var userInfo = req.session.user;
            // console.log(userInfo, "bccc");

            var cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId')
           
            console.log('cartill onnullaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', cart);
           

            if (cart==null) {

                 console.log('cartill onnullaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',cart);
                                  const carlen=0
                return res.render('user/userCart', { cart,userInfo ,subTotal:0,carlen});
            } else {
                var carlen = cart.cartProducts.length
                const eachProTotal = cart.cartProducts.map(value => {
                    console.log('price', value.price);
                    return value.price * value.quantity

                })

                const subTotal = eachProTotal.reduce((accu, curr) => accu + curr)



                console.log("/////?/////////////", subTotal);


                res.render('user/userCart', { userInfo, cart, carlen, subTotal });
           

            }



        } catch (error) {
            console.error("error while renderin the cart", error);
            res.status(500).json({ message: "internal err" })
        }
    },
    increment: async (req, res) => {
        // console.log(req.params)
        // console.log("ksjdhfkjsh", req.body);
        const { id } = req.params;
        const { quantity } = req.body;
        // console.log('p  arams id', id);

        try {
            const cart = await cartModel.findOne()




            const matchingProduct = cart.cartProducts.find(product => product.productId.toString() == id.toString());
            // console.log('jhjjjjjjjjjjjjjjjj', matchingProduct);
            if (matchingProduct) {
                // console.log('befor updation',matchingProduct.quantity);

                matchingProduct.quantity += quantity

                // console.log("after",matchingProduct.quantity);

                await cart.save()
                res.json({ success: true })
            }


        } catch (error) {
            console.log(error);

        }

    },
    decrement: async (req, res) => {
        console.log(req.params)
        console.log("ksjdhfkjsh", req.body);
        const { id } = req.params;
        const { quantity } = req.body;
        console.log('p  arams id', id);

        try {
            const cart = await cartModel.findOne()




            const matchingProduct = cart.cartProducts.find(product => product.productId.toString() == id.toString());
            console.log('jhjjjjjjjjjjjjjjjj', matchingProduct);
            if (matchingProduct) {
                console.log('befor updation', matchingProduct.quantity);

                matchingProduct.quantity -= quantity

                console.log("after", matchingProduct.quantity);

                await cart.save()
                res.json({ success: true })
            }


        } catch (error) {
            console.log(error);

        }

    },






    deleteCart: async (req, res) => {
        const { id } = req.params;
        console.log("delete cart id", id);
        const userInfo = req.session.user;
        console.log("hiii", userInfo);
        try {
            const findUserIncart = await cartModel.findOne({ userId: userInfo._id });
            if (findUserIncart) {
                const productIndex = await findUserIncart.cartProducts.findIndex(
                    (p) => p.productId.toString() == id
                );
                console.log("index kittyo", productIndex);
                if (productIndex !== -1) {
                    findUserIncart.cartProducts.splice(productIndex, 1);
                    await findUserIncart.save();
                }
                res.json({
                    success: true,
                    msg: "Product removed from cart successfully",
                });
            }
        } catch (error) {
            console.error("Error deleting product from cart:", error);
            res.json({
                success: false,
                msg: "An error occurred while deleting the product from the cart",
            });
        }
    },

}