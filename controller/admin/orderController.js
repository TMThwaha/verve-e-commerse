const Order = require('../../model/orderModel');
const { orderManagement } = require('./productMngController');
const Address = require('../../model/userAddressModel')



module.exports = {
    orderManagement : async(req,res)=>{

        const order = await Order.find();
        const address = await Address.find();
        res.render('admin/orderManagement',{order,address})
    }
}