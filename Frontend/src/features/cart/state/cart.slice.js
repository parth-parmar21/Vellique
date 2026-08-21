import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
    },
    reducers: {
        setItems: (state, action) => {
            state.items = action.payload || [];
        },
        addItemToCart: (state, action) => {
            const newItem = action.payload;
            if (!newItem) return;
            const existing = state.items.find(
                item => {
                    const itemId = item.product?._id || item.product;
                    const newId = newItem.product?._id || newItem.product;
                    return itemId === newId && item.variant === newItem.variant;
                }
            );
            if (existing) {
                existing.quantity += newItem.quantity || 1;
            } else {
                state.items.push(newItem);
            }
        },
        updateCartItemQty: (state, action) => {
            const { productId, variantId, quantity } = action.payload;
            const existing = state.items.find(
                item => {
                    const itemId = item.product?._id || item.product;
                    return itemId === productId && item.variant === variantId;
                }
            );
            if (existing) {
                existing.quantity = quantity;
            }
        },
        removeCartItem: (state, action) => {
            const { productId, variantId } = action.payload;
            state.items = state.items.filter(
                item => {
                    const itemId = item.product?._id || item.product;
                    return !(itemId === productId && item.variant === variantId);
                }
            );
        },
        incrementCartItemQty: (state, action) => {
            const { productId, variantId } = action.payload;
            state.items = state.items.map(item => {
                if (item.product._id === productId && item.variant === variantId) {
                    return { ...item, quantity: item.quantity + 1 }
                } else return item
            })
        },
        decrementCartItemQty: (state, action) => {
            const { productId, variantId } = action.payload;
            state.items = state.items.map(item => {
                if (item.product._id === productId && item.variant === variantId) {
                    return { ...item, quantity: Math.max(1, item.quantity - 1) }
                } else return item
            })
        }
    }
})

export const { setItems, addItemToCart, updateCartItemQty, removeCartItem, incrementCartItemQty, decrementCartItemQty } = cartSlice.actions;
export default cartSlice.reducer;