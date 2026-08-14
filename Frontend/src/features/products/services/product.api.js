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

export async function getAllProducts() {
    const response = await productApi.get("/")
    console.log(response.data);
    
    return response.data
}

export async function getProductById(productId) {
    const response = await productApi.get(`/${productId}`)
    return response.data
}

export async function updateProduct(productId, formData) {
    const response = await productApi.post(`/${productId}/variants`, formData)
    return response.data
}