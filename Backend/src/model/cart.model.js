import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variants",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        price: {
            type: priceSchema,
            required: true
        }
    }]
});

export const Cart = mongoose.model("Cart", cartSchema)