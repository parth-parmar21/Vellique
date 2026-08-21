import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { validateAddToCart, validateIncrementCartItem } from "../validator/cart.validator.js";
import { addToCart, getCart, updateCartItem, removeFromCart, incrementCartItem, decrementCartItem } from "../controller/cart.controller.js";

const router = Router()

router.post("/add/:productId/:variantId", authenticateUser, validateAddToCart, addToCart)
router.get("/", authenticateUser, getCart)
router.put("/update/:productId/:variantId", authenticateUser, updateCartItem)
router.delete("/remove/:productId/:variantId", authenticateUser, removeFromCart)
router.patch("/quantity/increment/:productId/:variantId", authenticateUser, validateIncrementCartItem, incrementCartItem)
router.patch("/quantity/decrement/:productId/:variantId", authenticateUser, validateIncrementCartItem, decrementCartItem)
export default router
