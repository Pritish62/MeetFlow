import { createElement, useEffect } from "react";
import { useNavigate } from "react-router-dom"

const isAuth = (WrappedComp) => {
    const AuthComponent = (props) => {
        const router = useNavigate();
        const isAuthenticated = Boolean(localStorage.getItem("token"));

        useEffect(() => {
            if (!isAuthenticated) {
                router("/login", { replace: true })
            }

        }, [isAuthenticated, router])

        if (!isAuthenticated){
            return null;
        }

        return createElement(WrappedComp, props)
    }
    return AuthComponent
}

export default isAuth;