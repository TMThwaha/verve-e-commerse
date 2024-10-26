const Category = require('../../model/CategoryModel');
const User = require('../../model/UserModel');
const Product = require('../../model/productModel');
const WishList = require('../../model/wishlistModel');
const Brand = require('../../model/brandModel');


module.exports = {

    addtoWishlist: async (req, res) => {
        try {
            const userInfo = req.session.user;
            const products = await Product.find();
            const wishList = await WishList.findOne({ user: userInfo._id })
            .populate({
                path: 'items.product', 
                populate: { path: 'category' }
            })
            .populate({
                path: 'items.product', 
                populate: { path: 'brand'}
            });

        console.log(wishList, 'Fetched Wishlist');
            

            res.render('user/wishlist', {
                userInfo,
                products,
                wishList: wishList ? wishList.items : [],
            });
        } catch (error) {
            console.log(error);

        }
    },
    addedtoWishlist: async (req, res) => {
        try {
            // Get user info from session and productId from request body
            const userInfo = req.session.user;
            console.log(req.body, 'Wishlist Request Data');

            const { productId } = req.body;

            // Check if the user exists in the database (Optional if required)
            const user = await User.findById(userInfo._id);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Find the user's wishlist
            let wishList = await WishList.findOne({ user: userInfo._id });

            // If the wishlist doesn't exist, create a new one
            if (!wishList) {
                wishList = await WishList.create({
                    user: userInfo._id,
                    items: [
                        {
                            product: productId
                        }
                    ]
                });
            } else {
                // If wishlist exists, check if the product is already in the wishlist
                const isProductInWishlist = wishList.items.some(item => item.product.toString() === productId);

                if (!isProductInWishlist) {
                    // Add product to the wishlist if it's not already present
                    wishList.items.push({ product: productId });
                }
            }

            // Save the wishlist after modification
            await wishList.save();

            // Respond with success
            res.json({ success: true });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },

    removeWishlist: async (req, res) => {
        try {
            const userInfo = req.session.user;
            const { productId } = req.body;

            // Find the user's wishlist
            let wishList = await WishList.findOne({ user: userInfo._id });

            if (wishList) {
                // Filter out the product to remove it
                wishList.items = wishList.items.filter(item => item.product.toString() !== productId);

                // Save the updated wishlist
                console.log('saveeeeeeeeeeeeeeeeee');
                
                await wishList.save();
                return res.json({ success: true });
            }

           
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }

}