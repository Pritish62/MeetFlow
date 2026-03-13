import { Router } from "express";
import { login, register } from "../controller/userController.js";

const userRoute = Router();

userRoute.route("/login").post(login);
userRoute.route("/register").post(register);
userRoute.route("/add_to_activity");
userRoute.route("/get_all_activity");


export  {userRoute};