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

export async function getProductById(req, res) {
    const { productId } = req.params

    const product = await Product.findById(productId)

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }

    return res.status(200).json({
        message: "Get product successfully",
        product
    })
}

export async function addProductVarient(req, res) {
    const productId = req.params.productId
    const product = await Product.findOne({
        _id: productId,
        seller: req.user._id
    })

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }


    const files = req.files
    const images = []

    if (files && files.length > 0) {
        const uploadedImages = await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))
        uploadedImages.forEach(image => images.push(image))
    }

    let existingImageUrls = req.body.existingImageUrls
    if (existingImageUrls) {
        if (!Array.isArray(existingImageUrls)) {
            existingImageUrls = [existingImageUrls]
        }
        existingImageUrls.forEach(url => {
            if (url) images.push({ url })
        })
    }
    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributesArray = JSON.parse(req.body.attributes || "[]")

    const attributes = Object.fromEntries(
        attributesArray.map(({ key, value }) => [
            key,
            value
        ])
    )

    console.log(product, price, stock, attributesArray);
    
    product.variants.push({
        images,
        price: {
            amount: price || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock,
        attributes
    })

    await product.save()

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })
}

