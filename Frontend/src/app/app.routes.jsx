import { createBrowserRouter } from "react-router-dom";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";

export const appRoutes = createBrowserRouter([
    {
        path: '/',
        element: <Home />
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
            }
        ]
    }
])