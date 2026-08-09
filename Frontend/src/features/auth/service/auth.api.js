import { retry } from "@reduxjs/toolkit/query";
import axios from "axios";

const authApi = axios.create({
    baseURL: "/api/auth",
    withCredentials: true
})

export async function register({email, contact, fullName, password, isSeller}){
    const response = await authApi.post('/register', {
        email,
        contact,
        fullName,
        password,
        isSeller
    })
    return response.data
}

export async function login(email, password) {
    const response = await authApi.post('/login', {
        email,
        password
    })
    return response.data
}

export async function getMe() {
    const response = await authApi.get("/me")

    return response.data
}