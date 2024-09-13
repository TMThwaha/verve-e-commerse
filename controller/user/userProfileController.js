const userDb = require('../../model/UserModel');
const productModel = require("../../model/productModel")
const categoryModel = require("../../model/CategoryModel");
const bcrypt = require('bcrypt')
const { decrypt } = require('dotenv');
const Address = require('../../model/userAddressModel');



module.exports = {
    userProfile: async (req, res) => {
        const userInfo = req.session.user;
        let user = req.session.user;
        console.log('User object:', user);
        const id = user?._id;
        // console.log('User ID:', id);
        // console.log('User ID as string:', id.toString());

        const userDetails = await userDb.findById(id);
        console.log('User details:', userDetails);

        res.render('user/userProfile', { userInfo, userDetails });
    },

    editName: async (req, res) => {
   
        const id = req.session.user._id;


        const { editName } = req.body
        const editedName = await userDb.findById(id)

        editedName.name = editName
        await editedName.save()

        console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmm', editedName);
        res.json({ success: true, message: "Name edited successfully", editedName })
    },

    editPassword: async (req, res) => {
        const id = req.session.user._id;
        const pass = req.session.user.password
        console.log('password', pass);
        const { confirmPassword, currentPassword } = req.body

        let passwordOf = await userDb.findById(id)


        var salt = await bcrypt.genSalt(10);
        var hashed = await bcrypt.hash(currentPassword, salt);
        const isValid = await bcrypt.compare(currentPassword, hashed);
        console.log("isValid", isValid);
        if (isValid) {
            console.log("iff ill keryi")
            var salt = await bcrypt.genSalt(10);
            var hashedPassword = await bcrypt.hash(confirmPassword, salt);
            passwordOf.password = hashedPassword;
            await passwordOf.save();

            res.json({ success: true, message: "Password edited successfully", passwordOf })
        } else {
            res.json({ success: false })
        }


    },


    userAddress: async (req, res) => {
        const userInfo = req.session.user;
        const userId = userInfo._id
        // console.log('user0',req.session.user);
        const userAddress = await Address.findOne({ userId })

        const address = userAddress ? userAddress.addresses : [];
        res.render('user/address', { userInfo, address })
    },
    saveAddress: async (req, res) => {
        try {
            const userId = req.session.user;
            console.log('User ID:', userId);

            const { name, number, pincode, locality, address, city, state } = req.body;
            console.log("Request Body:", req.body);


            let userAddress = await Address.findOne({ userId });

            if (userAddress) {

                userAddress.addresses.push({
                    name: name,
                    number: number,
                    pincode: pincode,
                    locality: locality,
                    address: address,
                    city: city,
                    state: state
                });
            } else {

                userAddress = new Address({
                    userId: userId,
                    addresses: [{
                        name: name,
                        number: number,
                        pincode: pincode,
                        locality: locality,
                        address: address,
                        city: city,
                        state: state
                    }]
                });
            }


            await userAddress.save();
            console.log('Address saved successfully');

            res.status(200).send({ success: true, message: 'Address saved successfully' });
        } catch (error) {
            console.log('Error saving address:', error);
            res.status(500).send({ message: 'Internal server error' });
        }
    },
    editAddress: async (req, res) => {
        try {
            const userId = req.session.user; // Get the user ID from session
            const { id } = req.params; // Address ID from route parameters
            const { name, number, pincode, locality, address, city, state } = req.body; // Data to update
    
            // Find the user's address document
            const userAddress = await Address.findOne({ userId });
    
            if (!userAddress) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Find the specific address by ID
            const addressToUpdate = userAddress.addresses.id(id);
    
            if (!addressToUpdate) {                                           
                return res.status(404).json({ message: 'Address not found' });
            }                                                                  
    
            // Update the address fields
            addressToUpdate.name = name || addressToUpdate.name;
            addressToUpdate.number = number || addressToUpdate.number;
            addressToUpdate.pincode = pincode || addressToUpdate.pincode;
            addressToUpdate.locality = locality || addressToUpdate.locality;
            addressToUpdate.address = address || addressToUpdate.address;
            addressToUpdate.city = city || addressToUpdate.city;
            addressToUpdate.state = state || addressToUpdate.state;
    
            // Save the updated address document
            await userAddress.save();
    
            res.status(200).json({ message: 'Address updated successfully', address: addressToUpdate });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error', error });
        }
    }
}