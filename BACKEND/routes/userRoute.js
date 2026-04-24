import { Router } from "express";
import { addToHistory, getUserHistory, login, register } from "../controller/userController.js";

const userRoute = Router();

userRoute.route("/login").post(login);
userRoute.route("/register").post(register);
userRoute.route("/add_to_activity").post(addToHistory)
userRoute.route("/get_all_activity").get(getUserHistory)


export  {userRoute};