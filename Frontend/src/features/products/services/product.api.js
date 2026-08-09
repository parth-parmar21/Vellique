import axios from 'axios'

const productApi = axios.create({
    baseURL: "/api/products",
    withCredentials: true
})

export async function createProduct(formData) {
    const response = await productApi.post("/", formData)

    return response.data
}

export async function getSellerProduct() {
    const response = await productApi.get("/seller")
    return response.data
}