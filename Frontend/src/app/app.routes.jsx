import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";
import ProductDetails from "../features/products/pages/ProductDetails";
import SellerProductDetail from "../features/products/pages/SellerProductDetail";
import CartPage from "../features/cart/page/CartPage";
import AppLayout from "./AppLayout";

export const appRoutes = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        element: <AppLayout />, 
        children: [
            {
        path: '/product/:id',
        element: <ProductDetails />
    },
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/cart',
        element: <CartPage />
    },
    {
        path: '/seller',
        children: [
            {
                path: 'create-product',
                element: <Protected role="seller">
                    <CreateProduct />
                </Protected>
            },
            {
                path: 'dashboard',
                element: <Protected role="seller">
                    <Dashboard />
                </Protected>
            },
            {
                path: 'product/:productId',
                element: <Protected role="seller">
                    <SellerProductDetail />
                </Protected>
            }
        ]
    }
        ]
    }
])