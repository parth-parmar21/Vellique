import { stockOfVariant } from "../dao/product.dao.js";
import { Cart } from "../model/cart.model.js";
import { Product } from "../model/product.model.js";

export async function addToCart(req, res) {
    const { productId, variantId } = req.params;
    const { quantity = 1 } = req.body;
    const product = await Product.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId);

    // FIX: change user -> userId to match cart.model.js schema
    const cart = (await Cart.findOne({ userId: req.user._id })) ||
        (await Cart.create({ userId: req.user._id }))

    const isProductAlreadtyInCart = cart.items.some(item => item.product.toString() === productId && item.variant.toString() === variantId);

    if (isProductAlreadtyInCart) {
        const qtyInCat = cart.items.find(item => item.product.toString() === productId && item.variant.toString() === variantId)?.quantity || 0;

        if (qtyInCat + quantity > stock) {
            return res.status(400).json({
                message: "Not enough stock available",
                success: false
            });
        }

        // FIX: change user -> userId
        await Cart.findOneAndUpdate(
            { userId: req.user._id, "items.product": productId, "items.variant": variantId },
            { $inc: { "items.$.quantity": quantity } },
            { new: true }
        )

        return res.status(200).json({
            message: "cart updated successfully",
            success: true
        });
    }

    if (quantity > stock) {
        return res.status(400).json({
            message: "Not enough stock available",
            success: false
        });
    }

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: product.price
    })

    await cart.save()

    return res.status(200).json({
        message: "Item added to cart successfully",
        success: true
    });
}

export async function getCart(req, res) {
    // FIX: change user -> userId
    const cart = (await Cart.findOne({ userId: req.user._id }).populate("items.product")) || (await Cart.create({ userId: req.user._id }))

    return res.status(200).json({
        message: "Cart retrieved successfully",
        success: true,
        data: cart
    });
}

export async function updateCartItem(req, res) {
    const { productId, variantId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 1) {
        return res.status(400).json({
            message: "Quantity must be at least 1",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId);
    if (quantity > stock) {
        return res.status(400).json({
            message: "Not enough stock available",
            success: false
        });
    }

    const cart = await Cart.findOneAndUpdate(
        { userId: req.user._id, "items.product": productId, "items.variant": variantId },
        { $set: { "items.$.quantity": quantity } },
        { new: true }
    ).populate("items.product");

    if (!cart) {
        return res.status(404).json({
            message: "Cart item not found",
            success: false
        });
    }

    return res.status(200).json({
        message: "Cart updated successfully",
        success: true,
        data: cart
    });
}

export async function removeFromCart(req, res) {
    const { productId, variantId } = req.params;

    const cart = await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { $pull: { items: { product: productId, variant: variantId } } },
        { new: true }
    ).populate("items.product");

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        });
    }

    return res.status(200).json({
        message: "Item removed from cart successfully",
        success: true,
        data: cart
    });
}

export async function incrementCartItem(req, res) {
    const { productId, variantId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        });
    }

    const cart = await Cart.findOne({
        userId: req.user._id
    })

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        });
    }

    const stock = await stockOfVariant(productId, variantId)

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant.toString() === variantId)?.quantity || 0;

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items of this variant are available and you have ${itemQuantityInCart} in your cart`,
            success: false
        });
    }

    await Cart.findOneAndUpdate(
        {
            userId: req.user._id,
            "items.product": productId,
            "items.variant": variantId
        },
        { $inc: { "items.$.quantity": 1 } },
        { new: true }
    )

    return res.status(200).json({
        message: "Item quantity incremented successfully",
        success: true
    });
}
export async function decrementCartItem(req, res) {
    const { productId, variantId } = req.params;

    const product = await Product.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        });
    }

    const cart = await Cart.findOne({
        userId: req.user._id
    })

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        });
    }


    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant.toString() === variantId)?.quantity || 1;

    if (itemQuantityInCart <= 1) {
        return res.status(400).json({
            message: "Cannot decrement item quantity below zero",
            success: false
        });
    }

    await Cart.findOneAndUpdate(
        {
            userId: req.user._id,
            "items.product": productId,
            "items.variant": variantId
        },
        { $inc: { "items.$.quantity": -1 } },
        { new: true }
    )

    return res.status(200).json({
        message: "Item quantity incremented successfully",
        success: true
    });
}
