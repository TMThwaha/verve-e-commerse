const express = require('express');
const router = express.Router();
const homecontroller=require('../controller/user/userHomeController');
const middleware = require("../middleware/userMiddleware");
const userProductController = require('../controller/user/userProductController');
const cartController = require('../controller/user/cartController');
const userProfileController = require('../controller/user/userProfileController');
const wishListController = require('../controller/user/wishListController');
const {Authenticated,checkOtpVerfy,  blockedUser,userthere}=  require("../middleware/userMiddleware");
const WishList = require('../model/wishlistModel');
const filterController = require('../controller/user/filterController');
const razorPayController = require('../controller/user/razorPayController');




// home-controller-get 
router.get('/',blockedUser,homecontroller.ShowHomePage)
router.get('/user-login',Authenticated,homecontroller.ShowLoginPage)
router.get("/user-signup" ,Authenticated,homecontroller.ShowSignUpPage)
router.get('/otp',checkOtpVerfy,homecontroller.renderOtpPage)
router.get('/resendOtp',homecontroller.renderResendPage);
router.get('/user-logout',homecontroller.userLogout);




//home-controller-post
router.post('/userRegister',homecontroller.registerUserDb);
router.post('/verifyOtp',homecontroller.verifyOtp);
router.post('/userLogin',homecontroller.userLogin);




//user-product/cart-get
router.get('/productList',blockedUser,userProductController.productList);
router.get('/product-detail/:id',blockedUser,userProductController.productDetail);
router.get('/user-cart',userthere,blockedUser,cartController.userCart);




//user-product/cart-post
router.post("/addtoCart",blockedUser,userthere,cartController.addToCart);
router.post('/increment-quantity/:id',cartController.increment);
router.post('/decrement-quantity/:id',userthere,cartController.decrement);
router.post('/deleteCart/:id',blockedUser,userthere,cartController.deleteCart);



//userProfileController
router.get('/user-profile',userProfileController.userProfile)

router.post('/edit-name',userProfileController.editName)

router.post('/edit-password',userProfileController.editPassword)
router.get('/user-address',userProfileController.userAddress);
router.post('/save-address',userProfileController.saveAddress);
router.post('/edit-address/:id',userProfileController.editAddress);

router.get('/user-orders',userProfileController.userOrder);

router.get('/checkout',cartController.checkout)
router.post('/coupon',cartController.coupons)
router.post('/process-order',cartController.placeOrder);
router.get('/order-confirm',cartController.orderConfirm);



router.get('/wishlist',wishListController.addtoWishlist);
router.post('/added-wishlist',wishListController.addedtoWishlist);

router.post('/wishlist-remove',wishListController.removeWishlist)

router.get('/filterProduct',filterController.filterProducts);


router.get('/searchProduct',filterController.searchProducts);

router.get('/razor-key',razorPayController.razorKey);
router.post('/razor-order',razorPayController.RazorOrder);



module.exports = router;
