const userDb = require('../../model/UserModel');
const CategoryModel = require('../../model/CategoryModel');
const brandModel = require('../../model/brandModel');
const productModel = require("../../model/productModel");



//credentials
const Credential = {
    email: "thwaha323@gmail.com",
    password: "12345"
};


module.exports = {
    adminLogin: (req, res) => {
        const errMes = req.session.Err;
        req.session.Err = null;
        res.render('admin/adminLogin', { errMes });
    },


    renderHome:(req,res)=>{
        res.render("admin/admindash");
    },

    adminHome: async(req, res) => {
        const { email, password } = req.body;
       

        try {
          
            if (Credential.email === email && Credential.password === password) {
                req.session.admin = true
                res.render("admin/admindash");
            } else {
                req.session.Err = "Invalid username or password";
                res.redirect('/admin');
            }
        } catch (error) {
            console.log(error);
        }
    },

    userManagement: async (req, res) => {
        const userInfo = await userDb.find();
        res.render('admin/userManagement', { userInfo });
    },

    

    userBlock: async (req, res) => {
        const { id } = req.params;
        try {
            const userStatus = await userDb.findById(id);
            userStatus.status = false;
            await userStatus.save();
            res.json({ success: true, message: "User blocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    userUnblock: async (req, res) => {
        const { id } = req.params;
        try {
            const userStatus = await userDb.findById(id);
            userStatus.status = true;
            await userStatus.save();
            res.json({ success: true, message: "User unblocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    categoryManagement: async (req, res) => {
        const addCat = await CategoryModel.find();
        res.render("admin/categoryManagement", { addCat });
    },

    addCategory: async (req, res) => {
        console.log(req.body);
       
        
        const { name } = req.body;

        const names = name.toUpperCase()

        if (!names) {
            return res.status(400).json({ success: false, message: "Invalid category name. It should only contain letters and spaces." });
        }

        try {
            const naMe = await CategoryModel.findOne({name:names});
            if(naMe){
                
                return res.status(404).json({ success: false  , message : "Category already exists"});

            }
            const newCat = new CategoryModel({ name : names });
            await newCat.save();
            return res.json({ success: true, message: "Category added successfully" });
        } catch (error) {
            console.error("Error adding category:", error);
            return res.status(500).json({ success: false, message: "Error adding category" });
        }
    },

    categoryBlock: async (req, res) => {
        const { id } = req.params;
        try {
            const userStatus = await CategoryModel.findById(id);
            userStatus.status = false;
            await userStatus.save();
            res.json({ success: true, message: "Category blocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    categoryUnBlock: async (req, res) => {
        const { id } = req.params;
        try {
            const userStatus = await CategoryModel.findById(id);
            userStatus.status = true;
            await userStatus.save();
            res.json({ success: true, message: "Category unblocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    editCategory: async (req, res) => {
        const { name } = req.body;
        const names = name.toUpperCase()
        const { id } = req.params;

        if (!names) {
            return res.status(400).json({ success: false, message: "Invalid category name. It should only contain letters and spaces." });
        }

        try {
            const naMe = await CategoryModel.findOne({name:names});
            // console.log(naMe);
            if(naMe){
                console.log('mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm');
                
                return res.json({ success: false });

            }
            
             await CategoryModel.updateOne({ _id: id }, { name:names });
            res.json({ success: true, message: 'Category updated successfully' });
        } catch (error) {
            console.error('Error updating category:', error);
            res.status(500).json({ success: false, message: 'Error updating category' });
        }
    },

    brands: async (req, res) => {
        const addBrand = await brandModel.find();
        res.render("admin/brandManagement", { addBrand });
    },

    addBrand: async (req, res) => {
        const { name } = req.body;

        if (!name || !isValidName(name)) {
            return res.status(400).json({ success: false, message: "Invalid brand name. It should only contain letters and spaces." });
        }

        try {
            const newBrand = new brandModel({ name });
            await newBrand.save();
            return res.json({ success: true, message: "Brand added successfully" });
        } catch (error) {
            console.error("Error adding brand:", error);
            return res.status(500).json({ success: false, message: "Error adding brand" });
        }
    },

    blockBrand: async (req, res) => {
        const { id } = req.params;
        try {
            const brandStatus = await brandModel.findById(id);
            brandStatus.status = false;
            await brandStatus.save();
            res.json({ success: true, message: "Brand blocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    unBlockBrand: async (req, res) => {
        const { id } = req.params;
        try {
            const brandStatus = await brandModel.findById(id);
            brandStatus.status = true;
            await brandStatus.save();
            res.json({ success: true, message: "Brand unblocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    editBrand: async (req, res) => {
        const { name } = req.body;
        const { id } = req.params;

        if (!name || !isValidName(name)) {
            return res.status(400).json({ success: false, message: "Invalid brand name. It should only contain letters and spaces." });
        }

        try {
            const result = await brandModel.updateOne({ _id: id }, { name });
            res.json({ success: true, message: 'Brand updated successfully' });
        } catch (error) {
            console.error('Error updating brand:', error);
            res.status(500).json({ success: false, message: 'Error updating brand' });
        }
    }
};
