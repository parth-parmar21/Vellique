import { body, validationResult } from "express-validator";

function validateRequest(req, res, next) {
    const erros = validationResult(req)

    if (!erros.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: erros.array()
        });
    }

    next();
}

export const validateProducts = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("priceAmount").isFloat({ min: 0 }).withMessage("Invalid price amount"),
    body("priceCurrency").optional().isString().withMessage("Invalid price currency")
]
