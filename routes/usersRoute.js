const express = require('express');
const router = express.Router();
const homecontroller=require('../controller/user/userHomeController');
const middleware = require("../middleware/userMiddleware");
const userProductController = require('../controller/user/userProductController');
const cartController = require('../controller/user/cartController');




//home-controller-get 
router.get('/',middleware.blockedUser,homecontroller.ShowHomePage)
router.get('/user-login',middleware.Authenticated,homecontroller.ShowLoginPage)
router.get("/user-signup" ,middleware.Authenticated,homecontroller.ShowSignUpPage)
router.get('/otp',middleware.checkOtpVerfy,homecontroller.renderOtpPage)
router.get('/resendOtp',homecontroller.renderResendPage);
router.get('/user-logout',homecontroller.userLogout);




//home-controller-post
router.post('/userRegister',homecontroller.registerUserDb);
router.post('/verifyOtp',homecontroller.verifyOtp);
router.post('/userLogin',middleware.Authenticated,homecontroller.userLogin);




//user-product/cart-get
router.get('/productList',userProductController.productList);
router.get('/product-detail/:id',userProductController.productDetail);
router.get('/user-cart',middleware.userthere,cartController.userCart);




//user-product/cart-post
router.post("/addtoCart",middleware.userthere,cartController.addToCart);
router.post('/increment-quantity/:id',middleware.userthere,cartController.increment);
router.post('/decrement-quantity/:id',middleware.userthere,cartController.decrement);
router.post('/deleteCart/:id',middleware.userthere,cartController.deleteCart);







module.exports = router;
