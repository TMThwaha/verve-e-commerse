const express = require('express');
const adminController = require('../controller/admin/adminController');
const productMngController = require('../controller/admin/productMngController');
const middleware = require('../middleware/userMiddleware')
const upload = require('../config/multerconfig');
const orderController = require('../controller/admin/orderController');
const adminRoute = express.Router();
const couponController = require('../controller/admin/couponConroller');




//admin-controller-get

adminRoute.get('/admin',middleware.adminAuth,adminController.adminLogin)
adminRoute.get("/adminHome",middleware.adminthere,adminController.renderHome)
adminRoute.get('/userManagement',middleware.adminthere, adminController.userManagement);
adminRoute.get('/category',middleware.adminthere, adminController.categoryManagement);
adminRoute.get('/brandManagement',middleware.adminthere, adminController.brands);



//admin-controller-post

adminRoute.post('/admin/dashboard', adminController.adminHome);
adminRoute.post('/userBlock/:id',middleware.adminthere, adminController.userBlock);
adminRoute.post('/userUnblock/:id',middleware.adminthere, adminController.userUnblock);
adminRoute.post('/add-category',middleware.adminthere, adminController.addCategory);
adminRoute.post('/categoryTrue/:id', middleware.adminthere,adminController.categoryBlock);
adminRoute.post('/categoryFalse/:id',middleware.adminthere, adminController.categoryUnBlock);
adminRoute.post('/edit-category/:id',middleware.adminthere, adminController.editCategory);
adminRoute.post('/addBrand',middleware.adminthere, adminController.addBrand);
adminRoute.post('/brandTrue/:id',middleware.adminthere, adminController.blockBrand);
adminRoute.post('/brandFalse/:id',middleware.adminthere, adminController.unBlockBrand);
adminRoute.post('/edit-brand/:id',middleware.adminthere, adminController.editBrand);



//product-controller-get

adminRoute.get('/productManagement',middleware.adminthere, productMngController.productManagement);
adminRoute.get('/orderManagement',middleware.adminthere, orderController.orderManagement);
adminRoute.get('/editProduct/:id',middleware.adminthere, productMngController.editProduct);





//product-mng-controller-post

adminRoute.post('/addProduct',middleware.adminthere, productMngController.addProduct);
adminRoute.post('/product-save', upload.array('productImages', 3), productMngController.productSave);
adminRoute.post('/productTrue/:id',middleware.adminthere, productMngController.productBlock);
adminRoute.post('/productFalse/:id',middleware.adminthere, productMngController.productUnBlock);
adminRoute.post('/update-product/:id', upload.array('newProductImages', 3), productMngController.productUpdate);



adminRoute.get('/coupon',couponController.coupon);
adminRoute.post('/add-coupon',couponController.addCoupon);
adminRoute.put('/edit-coupon',couponController.editCoupon);
// adminRoute.delete('/delete-coupon/:id', couponController.deleteCoupon);






module.exports = adminRoute;
