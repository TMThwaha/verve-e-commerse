const { body, validationResult } = require('express-validator');
const productModel = require("../../model/productModel");
const CategoryModel = require('../../model/CategoryModel');
const brandModel = require('../../model/brandModel');
const fs = require("fs");
const path = require("path");

// Validation middleware for product fields
const validateProduct = [
    body('productName')
        .trim()
        .notEmpty().withMessage('Product name is required.')
        .matches(/^[A-Za-z\s]+$/).withMessage('Product name should only contain letters and spaces.'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required.'),
    body('price')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    body('stockQuantity')
        .isInt({ gt: 0 }).withMessage('Stock quantity must be a positive integer.'),
    body('category').notEmpty().withMessage('Category is required.'),
    body('brand').notEmpty().withMessage('Brand is required.')
];

module.exports = {
     productManagement : async (req, res) => {
        try {
            const msg = req.session.msg;
            req.session.msg = null;
            const edtSuccess = req.session.editsuccess;
            req.session.editsuccess = null;
            const category = await CategoryModel.find()
            const addProduct = await productModel.find()
                .populate('brand')
                .populate('category');
    
            console.log('Fetched products:', addProduct);
    
            res.render("admin/productManagement", { addProduct, msg, edtSuccess ,category });
        } catch (error) {
            console.error('Error in productManagement:', error);
            res.status(500).send('An error occurred while fetching products');
        }
    },
    

        
       
    

    addProduct: async (req, res) => {
        const cat = await CategoryModel.find();
        const brnd = await brandModel.find();
        res.render("admin/addProduct", { cat, brnd });
    },

    productSave: [
        validateProduct,
        async (req, res) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                // Render the form again with validation errors
                const cat = await CategoryModel.find();
                const brnd = await brandModel.find();
                return res.render('admin/addProduct', {
                    cat,
                    brnd,
                    errors: errors.array(),
                    oldData: req.body
                });
            }

            const { productName, description, category, brand, price, stockQuantity } = req.body;

            try {
                const catId = await CategoryModel.findOne({ name: category });
                const brandId = await brandModel.findOne({ name: brand });

                if (!catId || !brandId) {
                    return res.status(400).json({ success: false, message: 'Category or Brand not found' });
                }

                const ImgFile = req.files.map(value => `${value.filename}`);




                const newProduct = new productModel({
                    name: productName,
                    description,
                    category: catId._id,
                    brand: brandId._id,
                    price,
                    stock: stockQuantity,
                    image: ImgFile
                });

                await newProduct.save();
                req.session.msg = "Successfully added the product";
                res.redirect('/productManagement');
            } catch (error) {
                console.error('Error saving product:', error);
                res.status(500).json({ success: false, message: 'Error saving product' });
            }
        }
    ],
    productBlock: async (req, res) => {
        const { id } = req.params;
        try {
            const userStatus = await productModel.findById(id);
            userStatus.status = false;
            await userStatus.save();
            res.json({ success: true, message: "Product blocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    productUnBlock: async (req, res) => {
        const { id } = req.params;
        try {
            const userStatus = await productModel.findById(id);
            userStatus.status = true;
            await userStatus.save();
            res.json({ success: true, message: "Product unblocked successfully" });
        } catch (error) {
            console.log(error);
        }
    },

    editProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            if (!productId) {
                return res.status(400).send('Product ID is required');
            }

            const product = await productModel.findById(productId)
                .populate('category')
                .populate('brand');

            if (!product) {
                return res.status(404).send('Product not found');
            }


            // console.log('ckeck.......................................',product.image);

            // Fetch categories and brands for dropdowns
            const categories = await CategoryModel.find();
            const brands = await brandModel.find();

            res.render('admin/editProduct', {
                product,
                categories,
                brands
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).send('Server error');
        }
    },
    productUpdate: async (req, res) => {
        console.log('...........................routill kery............................');

        const { id } = req.params;
        const { productName, description, category, brand, price, stockQuantity, deleteImage } = req.body

        console.log('............req.body.............',req.body);
        
        // console.log(req.body);
        // console.log('...........................id pakkaa............................', id, deleteImage);



        try {
            // console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhh",req.body);
            const update = await productModel.findById(id)


            if (!update) {
                console.log("No product there");
                req.session.editfail = "Product not found.";
                res.redirect('/productManagement'); // Ensure this route exists
            } else {

                const ImgFile = req.files.map(value => `${value.filename}`);

                console.log('...........ippo file onnul so empty..............', ImgFile);


                update.name = productName;
                if (ImgFile.length > 0) {
                    update.image = ImgFile;
                }
                update.description = description;
                update.category = category;
                update.brand = brand;
                update.price = price;
                update.stock = stockQuantity;

                const updatedImage = [...update.image]

                if (deleteImage) {
                    const deleteIndex = JSON.parse(deleteImage).map(index => Number(index));
                    console.log("________-deleting the image", deleteIndex);

                    //filter images to delete
                    const imageToDelete = update.image.filter((_, index) => deleteIndex.includes(index));
                    console.log("________-deleting the image", imageToDelete);

                    if (imageToDelete.length > 0) {
                        imageToDelete.forEach(imgPath => {
                            const fullPath = path.join(__dirname, '', 'uploads', imgPath);

                            console.log("ffffffffffffffffffffffffffffffff", fullPath);

                            fs.unlink(fullPath, (err) => {
                                if (err) {
                                    console.log("Error deleting img file", err);

                                } else {
                                    console.log("File deleted", fullPath);

                                }
                            })
                        });

                        update.image = updatedImage.filter((_, index) => !deleteIndex.includes(index));

                    } else {
                        console.log("No images found to delete");

                    }
                } else {
                    console.log("No images to delete");

                }

                await update.save();
                console.log("edited successfully");
                req.session.editsuccess = "Product Edited Successfully."

                res.redirect("/productManagement")
            }



        } catch (error) {
            console.log(error);

        }
    }

};
