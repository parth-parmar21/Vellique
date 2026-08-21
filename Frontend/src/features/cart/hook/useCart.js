import { useDispatch } from "react-redux"
import { setItems, incrementCartItemQty, decrementCartItemQty } from '../state/cart.slice'
import { addItem, fetchCart, updateItemQty, removeItem, incrementCartItem, decrementCartItem } from "../service/cart.api"

export const useCart = () => {
    const dispatch = useDispatch()

    const handleGetCart = async () => {
        try {
            const res = await fetchCart()
            if (res.success && res.data) {
                dispatch(setItems(res.data.items))
            }
            return res
        } catch (error) {
            console.error("Failed to fetch cart:", error)
        }
    }

    const handleAddItem = async ({productId, variantId}) => {
        try {
            const data = await addItem({productId, variantId})
            if (data.success) {
                // Refresh the cart to get the populated product details
                await handleGetCart()
            }
            return data
        } catch (error) {
            console.error("Failed to add item to cart:", error)
            throw error
        }
    }

    const handleUpdateItemQty = async ({productId, variantId, quantity}) => {
        try {
            const res = await updateItemQty({productId, variantId, quantity})
            if (res.success && res.data) {
                dispatch(setItems(res.data.items))
            }
            return res
        } catch (error) {
            console.error("Failed to update cart item quantity:", error)
            throw error
        }
    }

    const handleRemoveItem = async ({productId, variantId}) => {
        try {
            const res = await removeItem({productId, variantId})
            if (res.success && res.data) {
                dispatch(setItems(res.data.items))
            }
            return res
        } catch (error) {
            console.error("Failed to remove cart item:", error)
            throw error
        }
    }

    const handleIncrementCartItem = async ({productId, variantId}) => {
        const data = await incrementCartItem({productId, variantId})
        dispatch(incrementCartItemQty({productId, variantId}))
    }

    const handleDecrementCartItem = async({productId, variantId}) => {
        const data = await decrementCartItem({productId, variantId})
        dispatch(decrementCartItemQty({productId, variantId}))
    }

    return { 
        handleGetCart, 
        handleAddItem, 
        handleUpdateItemQty, 
        handleRemoveItem,
        handleIncrementCartItem,
        handleDecrementCartItem
    }
}