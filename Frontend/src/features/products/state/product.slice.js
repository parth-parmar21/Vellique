import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        allProducts: [],
        isLoading: false,
        searchQuery: ""
    },
    reducers: {
        setSellerProduct: (state, action) => {
            state.sellerProducts = action.payload
        }, 
        setProducts: (state, action) => {
            state.allProducts = action.payload
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
        }
    }
})

export const { setSellerProduct, setProducts, setSearchQuery } = productSlice.actions
export default productSlice.reducer