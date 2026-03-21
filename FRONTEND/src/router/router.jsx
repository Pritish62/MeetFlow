import { createBrowserRouter, Router, RouterProvider } from "react-router-dom";
import MainLayout from "../layouts/MainLayouts.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Landingpage from "../pages/Landingpage.jsx";
import VideoMeetComponent from "../pages/VideoMeet.jsx";


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
            {
                path: "/:url",
                element: <VideoMeetComponent/>
            }
        ]
    }


]);

export default router