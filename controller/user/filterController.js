const User = require('../../model/UserModel');
const productModel = require('../../model/productModel');
const brandModel = require('../../model/brandModel');
const Category = require('../../model/CategoryModel');


module.exports = {
    filterProducts: async (req, res) => {
        const { selectedBrands, selectedCategories, selectedPrices, searchValue, sortBy } = req.query;
        console.log(
            "Extracted parameters:",
            { selectedBrands, selectedCategories, selectedPrices, searchValue, sortBy }
        );

        try {
            // Base filter for active products
            const filter = { status: true };

            // Adding brand filter if provided
            if (selectedBrands) {
                const brandNames = selectedBrands.split(',');
                const brandDocs = await brandModel.find({ name: { $in: brandNames } }).select('_id');
                const brandIds = brandDocs.map(doc => doc._id);
                filter.brand = { $in: brandIds };
            }

            // Adding category filter if provided
            if (selectedCategories) {
                const categoryNames = selectedCategories.split(',');
                const categoryDocs = await Category.find({ name: { $in: categoryNames } }).select('_id');
                const categoryIds = categoryDocs.map(doc => doc._id);
                filter.category = { $in: categoryIds };
            }

            // Adding price filter if provided
            if (selectedPrices) {
                try {
                    const [minPrice, maxPrice] = selectedPrices.replace(/\$/g, '').split('-').map(price => parseFloat(price.trim()));

                    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                        filter.price = {
                            $gte: minPrice,
                            $lte: maxPrice
                        };
                    } else if (!isNaN(minPrice)) {
                        filter.price = { $gte: minPrice };
                    } else if (!isNaN(maxPrice)) {
                        filter.price = { $lte: maxPrice };
                    } else {
                        console.warn("Invalid price range provided:", selectedPrices);
                    }
                } catch (error) {
                    console.error("Error parsing price range:", error);
                }

                console.log("Price filter:", filter.price);
            }

            // Adding search filter if provided
            if (searchValue) {
                filter.$or = [
                    { name: { $regex: searchValue, $options: "i" } },
                    { description: { $regex: searchValue, $options: "i" } }
                ];
            }

            console.log("Final filter:", filter);

            let sortOption = {};
            if (sortBy ===  'High to Low') {
                sortOption = { price: 1 };
            } else if (sortBy === 'High to Low') {
                sortOption = { price: -1 };
            }

            const products = await productModel.find(filter)
                .populate("brand")
                .populate("category")
                .sort(sortOption);

            console.log("Products found:", products.length);

            // Respond with found products
            res.json({ success: true, products });
        } catch (error) {
            console.error("Error occurred while fetching products:", error);
            res.status(500).json({
                success: false,
                message: "An error occurred while fetching products.",
                error: error.message,
            });
        }
    },


    searchProducts: async(req, res) => {

        const { searchValue } = req.query;

        console.log('search value', searchValue);
        const filter = { status: true };


        if (searchValue) {
            filter.$or = [
                { productName: { $regex: searchValue, $options: "i" } },
            ];

            const [category, brand] = await Promise.all([
                Category.findOne({ name: { $regex: searchValue, $options: "i" } }),
                brandModel.findOne({ name: { $regex: searchValue, $options: "i" } }),
            ]);

            if (category) filter.$or.push({ category: category._id });
            if (brand) filter.$or.push({ brand: brand._id });
        }



        const products = await productModel.find(filter)
            .populate("brand")
            .populate("category")
       

             res.json({ success: true, products });
    }



}