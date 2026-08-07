import { config } from "../config/config.js";
import { User } from "../model/user.model.js";
import jwt from 'jsonwebtoken'

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });

    res.cookie("token", token)

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullName: user.fullName,
            role: user.role
        }
    });
}
export async function register(req, res) {
    const { email, contact, fullName, password, isSeller } = req.body;

    try {
        const isUserExists = await User.findOne({
            $or: [{ email }, { contact }],
        });

        if (isUserExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            email,
            contact,
            fullName,
            password,
            role: isSeller ? "seller" : "buyer"
        });

        await sendTokenResponse(user, res, "User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    console.log(email, password);

    const user = await User.findOne({
        email
    })

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    await sendTokenResponse(user, res, "User logged in successfully");
}


export async function googleCallback(req, res) {
    const { id, displayName, emails, photos } = req.user;

    const email = emails[0].value;
    const profilePicture = photos[0].value;

    let user = await User.findOne({
        email
    })

    if (!user) {
        user = await User.create({
            email,
            fullName: displayName,
            contact: null,
            googleId: id
        });
    }

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });

    res.cookie("token", token);

    res.redirect("http://localhost:5173/")
}