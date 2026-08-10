import { Router } from "express";
import { authenticateSeller } from "../middleware/auth.middleware.js";
import { createProduct, getAllProducts, getProductById, getSellerProducts } from "../controller/product.controller.js";
import multer from 'multer'
import { validateProducts } from "../validator/product.validator.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})


const router = Router()

router.post("/", authenticateSeller, upload.array("images", 7), validateProducts, createProduct)
router.get("/seller", authenticateSeller, getSellerProducts)
router.get("/", getAllProducts)
router.get("/:productId", getProductById)

export default router