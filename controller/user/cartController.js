const userDb = require('../../model/UserModel');
const productModel = require('../../model/productModel');
const cartModel = require('../../model/cartModel');
const Address = require('../../model/userAddressModel')
const Order = require('../../model/orderModel');
const coupon = require('../../model/couponModel');
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
                    cartquantity: 1,
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
                        cartquantity: 1,
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

            //  console.log('cartill onnullaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', cart);


            if (cart.cartProducts.length <= 0) {

                console.log('cartill onnullaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', cart);
                const carlen = 0
                return res.render('user/userCart', { cart, userInfo, subTotal: 0, carlen });
            } else {
                var carlen = cart.cartProducts.length
                const eachProTotal = cart.cartProducts.map(value => {
                    console.log('price', value.price);
                    return value.price * value.cartquantity

                })

                const subTotal = eachProTotal.reduce((accu, curr) => accu + curr)



                // console.log("/////?/////////////", subTotal);


                res.render('user/userCart', { userInfo, cart, carlen, subTotal });


            }



        } catch (error) {
            console.error("error while renderin the cart", error);
            res.status(500).json({ message: "internal err" })
        }
    },
    increment: async (req, res) => {
        console.log(req.params)
        console.log("ksjdhfkjsh", req.body);
        const { id } = req.params;
        const { quantity } = req.body;
        var userInfo = req.session.user;

        // console.log('p  arams id', id);

        try {
            const cart = await cartModel.findOne({ userId: userInfo._id });

            const matchingProduct = cart.cartProducts.find(product => product.productId.toString() == id.toString());
            console.log('check match or not and car or not====', matchingProduct);
            if (matchingProduct) {
                // console.log('befor updation',matchingProduct.quantity);

                matchingProduct.cartquantity += quantity

                console.log("after", matchingProduct.cartquantity);

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
        const { quantity, cartQty } = req.body;
        console.log('p  arams id', id);
        var userInfo = req.session.user;


        try {

            const cart = await cartModel.findOne({ userId: userInfo._id })




            const matchingProduct = cart.cartProducts.find(product => product.productId.toString() == id.toString());
            console.log('jhjjjjjjjjjjjjjjjj', matchingProduct);
            if (matchingProduct) {
                console.log('befor updation', matchingProduct.cartquantity);

                matchingProduct.cartquantity -= quantity

                console.log("after", matchingProduct.cartquantity);

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
    checkout: async (req, res) => {
        try {
            const userInfo = req.session.user;
            const userId = userInfo._id
            const coupons = await coupon.find()
            const userAddress = await Address.findOne({ userId })
            var cart = await cartModel.findOne({ userId: userInfo._id }).populate('cartProducts.productId')
            const eachProTotal = cart.cartProducts.map(value => {
                console.log('price', value.price);
                return value.price * value.cartquantity

            })

            const subTotal = eachProTotal.reduce((accu, curr) => accu + curr)
            const address = userAddress ? userAddress.addresses : [];
            res.render('user/checkout', { userInfo, address, subTotal, coupons })
        } catch (error) {
            console.log(error);

        }

    },

    coupons: async(req,res)=>{
        const{discountAmount, minPurchaseAmount, total}=req.body;
        
        if (total < minPurchaseAmount) {
            // Send an error message if the total is less than the minimum
            return res.status(400).json({
                success: false,
                message: `You need to spend at least ${minPurchaseAmount} to use this coupon.`,
            });
        } else {
            // Send a success message if the coupon is valid
            return res.status(200).json({
                success: true,
                message: `Discount of ${discountAmount} has been applied successfully!`,
            });
        }
    },
    placeOrder: async (req, res) => {
        try {
            const { addressId, paymentMethod } = req.body;
            const userId = req.session.user._id;

            console.log(req.body, 'sdgsdgs', userId);


            // Validate if both address and payment method are provided
            if (!addressId || !paymentMethod) {
                return res.status(400).send({ message: 'Address and payment method are required' });
            }

            // Fetch the cart and populate the product details
            const cart = await cartModel.findOne({ userId }).populate('cartProducts.productId');

            console.log(cart, "ggggggggggggggg");


            // If cart is empty or doesn't exist, return an error
            if (!cart || cart.cartProducts.length === 0) {
                return res.status(400).send({ message: 'Your cart is empty' });
            }

            // Calculate order total from cart products
            const eachProTotal = cart.cartProducts.map(item => item.productId.price * item.cartquantity);
            const subTotal = eachProTotal.reduce((accu, curr) => accu + curr, 0);


            // Fetch the selected address from the user's address list
            const userAddress = await Address.findOne({ userId });
            const selectedAddress = userAddress ? userAddress.addresses.find(addr => addr._id.toString() === addressId) : null;

            console.log(cart.cartProducts, "gggaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaagggggggggggg");
            // If no valid address found, return an error
            if (!selectedAddress) {
                return res.status(400).send({ message: 'Invalid address selected' });
            }



            // Create the order object to save to the database
            const newOrder = new Order({
                userId: userId,
                address: selectedAddress,  // Save the selected address
                paymentMethod: paymentMethod,
                products: cart.cartProducts,  // Save the cart products
                totalAmount: subTotal,  // Total price for the order
                status: 'Pending',  // Set default status as 'Pending'
                paymentStatus: 'Pending',  // Payment status (could vary based on method)
                placedAt: new Date()  // Current timestamp
            });

            console.log(newOrder, "uuuuu");


            // Save the order to the database



            //** After placing the order, clear the cart


            if (paymentMethod == 'Razor Pay') {
                console.log("jjjjjjjjjjjjjuuuuu");
                const savedOrder = await newOrder.save();
                for (const item of cart.cartProducts) {
                    await productModel.findByIdAndUpdate(
                        item.productId,
                        { $inc: { stock: -item.cartquantity } },
                        { new: true }
                    )
                }
                await cartModel.findOneAndUpdate({ userId }, { cartProducts: [] });

                return res.status(200).send({ success: true, message: 'Order placed successfully', order: savedOrder });

            } else {
                const savedOrder = await newOrder.save();
                for (const item of cart.cartProducts) {
                    await productModel.findByIdAndUpdate(
                        item.productId,
                        { $inc: { stock: -item.cartquantity } },
                        { new: true }
                    )
                }
                await cartModel.findOneAndUpdate({ userId }, { cartProducts: [] });

                return res.status(200).send({ message: 'Order placed successfully', order: savedOrder });

            }




            // Send a success response back to the frontend
            // return res.status(200).send({ message: 'Order placed successfully', order: savedOrder });

        } catch (error) {
            console.error('Order placement error:', error);
            res.status(500).send({ message: 'Something went wrong while placing the order' });
        }
    },
    orderConfirm: (req, res) => {
        console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");

        res.render('user/orderConfirm',)
    }


}







