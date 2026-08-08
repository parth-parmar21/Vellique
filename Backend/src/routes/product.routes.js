import { Router } from "express";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { createProduct } from "../controller/product.controller.js";
import multer from 'multer'
import { validateProducts } from "../validator/product.validator.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})


const router = Router()

router.post("/", authenticateUser,validateProducts, upload.array("images", 7), createProduct)

export default router