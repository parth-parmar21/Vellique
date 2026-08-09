import { Product } from "../model/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export async function createProduct(req, res) {
    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const product = await Product.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    });
}

export async function getSellerProducts(req, res) {
    const seller = req.user

    const products = await Product.find({
        seller: seller._id
    })

    if (!products) {
        return res.status(404).json({
            message: "No products found for this seller",
            success: false
        });
    }

    res.status(200).json({
        message: "Products retrieved successfully",
        success: true,
        products
    }); 
}

export async function getAllProducts(req, res) {
    const products = await Product.find();

    if (!products) {
        return res.status(404).json({
            message: "No products found",
            success: false
        });
    }

    res.status(200).json({
        message: "Products retrieved successfully",
        success: true,
        products
    });
}