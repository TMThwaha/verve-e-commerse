const Razorpay = require('razorpay');
const uuid = require('uuid');
const orderModel = require('../../model/orderModel');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    razorKey: (req, res) => {
        res.json({ key: process.env.RAZORPAY_KEY_ID });
    },
    RazorOrder: async (req, res) => {
        console.log('Received request at /razor-order');
        console.log('Request body:', req.body);
        console.log('.........razoreOrder............................ Befor........', req.session.Amount);
        try {
            const { amount } = req.body;
            console.log("req.body", amount);

            const options = {
                amount: amount * 100,
                currency: 'INR',
                receipt: uuid.v4(),
            };

            const order = await razorpay.orders.create(options);
            console.log('.....................................................');
            console.log("Razor order", order);
            res.json({ order });
        } catch (error) {
            console.error('Error creating Razorpay order:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

}