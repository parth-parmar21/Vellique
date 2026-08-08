import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";

export const appRoutes = createBrowserRouter([
    {
        path: '/',
        element: <h1>Hello world</h1>
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/seller/create-product',
        element: <CreateProduct />
    }
])