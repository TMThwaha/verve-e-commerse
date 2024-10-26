const coupon = require('../../model/couponModel');

module.exports = {
    coupon : async(req,res)=>{
       

        const coupons = await coupon.find()


        res.render('admin/coupon',{coupons})
    },
    addCoupon : async(req,res)=>{
        const {couponCode,minPurchase,discountAmount,startDate,expiryDate}= req.body;
        
        const Coupon = await coupon.findOne({couponCode:couponCode})
    
    console.log('Coupon Data:', Coupon);

    if(Coupon){
        res.json({ success: false, message: 'Already exists' });
        
    }else{
        console.log('sdgsdgs');
        const Coupon = await coupon.create({
            couponCode:couponCode,
            minPurchaseAmount: minPurchase,
            discountAmount:discountAmount,
            date:startDate,
            expiryDate:expiryDate
        })
     await Coupon.save()
     return res.json({ success: true, message: 'Coupon added successfully' });
    }

    // Send success response
    

    },
    editCoupon: (req,res)=>{
        const {couponCode,minPurchase,discountAmount,startDate,expiryDate}= req.body;

        console.log('likekkekekekekek',couponCode,minPurchase,discountAmount,startDate,expiryDate);
        
    }
}