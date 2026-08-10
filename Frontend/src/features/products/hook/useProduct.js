import { useDispatch } from "react-redux"
import { createProduct, getAllProducts, getSellerProduct } from "../services/product.api"
import { setProducts, setSellerProduct } from "../state/product.slice"

export const useProducts = () => {
    const dispatch = useDispatch()


    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct()
        dispatch(setSellerProduct(data.products))

        return data.products
    }

    async function handleGetAllProducts() {
        const data = await getAllProducts()
        dispatch(setProducts(data.products))

        return data.products
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        dispatch(setProducts(data.product))
        // return data.product
    }

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById
    }
}