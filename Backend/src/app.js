import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import cors from 'cors'
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

import authRouter from "../routes/auth.routes.js";

app.use("/api/auth", authRouter);




export default app;
