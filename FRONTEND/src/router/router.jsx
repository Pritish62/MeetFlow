import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayouts.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Landingpage from "../pages/Landingpage.jsx";


const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Landingpage />
            },
            {
                path: "home",
                element: <Home />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "login",
                element: <Login />
            },
            
        ]
    }


]);

export default router