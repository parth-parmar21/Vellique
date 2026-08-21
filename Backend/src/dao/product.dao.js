import { Product } from "../model/product.model.js"

export const stockOfVariant = async(productId, variantId) => {
    const product = await Product.findOne({
        _id: productId,
        "variants._id": variantId
    })

    const stock = product.variants.find(variant => variant._id.toString() === variantId)?.stock
}