import dotenv from 'dotenv'
dotenv.config()

if (!process.env.PORT) {
    throw new Error("PORT environment variable is not set")
}

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set")
}

if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY environment variable is not set")
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not set")
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
throw new Error("GOOGLE_CLIENT_SECRET environment variable is not set")
}

export const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development"
};