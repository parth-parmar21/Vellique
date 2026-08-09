import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        allProducts: [],
        isLoading: false
    },
    reducers: {
        setSellerProduct: (state, action) => {
            state.sellerProducts = action.payload
        }, 
        setProducts: (state, action) => {
            state.allProducts = action.payload
        },

    }
})

export const { setSellerProduct, setProducts } = productSlice.actions
export default productSlice.reducer