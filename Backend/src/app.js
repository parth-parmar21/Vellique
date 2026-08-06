import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import cors from 'cors'
import passport from 'passport'
import { Strategy as googleStrategy } from 'passport-google-oauth20'

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize())
passport.use(new googleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile)
}))

app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

import authRouter from "../routes/auth.routes.js";
import { config } from "../config/config.js";

app.use("/api/auth", authRouter);




export default app;
