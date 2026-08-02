import { body, validationResult } from 'express-validator'

function validateRequest(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

export const validateRegisterUser = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body("contact")
        .isNumeric()
        .withMessage("Mobile number must contain only digits")
        .isLength({ min: 10, max: 10 })
        .withMessage("Mobile number must be exactly 10 digits")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Please enter a valid Indian mobile number"),

    body("fullName")
        .isLength({ min: 2, max: 50 })
        .withMessage("Please enter a valid full name"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    body("isSeller")
        .isBoolean()
        .withMessage("Please enter a valid boolean value"),
    validateRequest
]

export const validateLoginUser = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),

    validateRequest
]