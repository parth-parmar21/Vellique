import axios from "axios";

const api = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})

export const addItem = async ({ productId, variantId }) => {
    console.log("api ids", productId, variantId);

    const response = await api.post(`/add/${productId}/${variantId}`, {
        quantity: 1
    })
    return response.data
}

export const fetchCart = async () => {
    const response = await api.get("/");
    return response.data;
}

export const updateItemQty = async ({ productId, variantId, quantity }) => {
    const response = await api.put(`/update/${productId}/${variantId}`, {
        quantity
    });
    return response.data;
}

export const removeItem = async ({ productId, variantId }) => {
    const response = await api.delete(`/remove/${productId}/${variantId}`);
    return response.data;
}

export const incrementCartItem = async ({ productId, variantId }) => {
    const response = await api.patch(`/quantity/increment/${productId}/${variantId}`);
    return response.data;
}

export const decrementCartItem = async ({ productId, variantId }) => {
    const response = await api.patch(`/quantity/decrement/${productId}/${variantId}`);
    return response.data;
}