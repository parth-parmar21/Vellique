import { Router } from "express";
import { register, login, googleCallback, getMe } from "../controller/auth.controller.js";
import passport from "passport";
import { config } from "../config/config.js";
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router()

router.post("/register", validateRegisterUser, register)
router.post("/login", validateLoginUser, login)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: config.NODE_ENV === "development" ? "http://localhost:5173/login" : "/login" }), googleCallback)
router.get("/me", authenticateUser, getMe)

export default router