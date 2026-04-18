import React from "react";
import isAuth from "../utils/isAuth";

const Home = () => {
    return (
        <div>this is home page</div>
    )
}

export default isAuth(Home);