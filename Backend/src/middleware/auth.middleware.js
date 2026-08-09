import jwt from 'jsonwebtoken'
import { User } from '../model/user.model.js'
import { config } from '../config/config.js'

export const authenticateUser = async (req, res, next) => {
    const token = req.cookies.token
if (!token) {
    return res.status(401).json({
        message: "Unauthorized"
    })
}
    try {
        const decoded = await jwt.verify(token, config.JWT_SECRET_KEY)

        if (!decoded) {
            return res.status(401).json({
                message: "Invalid token"
            })
        }

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized user"
            })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}

export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
try {
    
        const decoded = jwt.verify(token, config.JWT_SECRET_KEY)
    
    if (!decoded) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }

        const user = await User.findById(decoded.id)
    
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
    
        if (user.role !== 'seller') {
            return res.status(403).json({
                message: "Forbidden"
            })
        }
    
        req.user = user
        next()
} catch (err) {
    console.log(err);
    
    return res.status(401).json({
        message: "Invalid token",
        error: err
    })
}
}