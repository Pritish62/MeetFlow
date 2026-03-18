import { User } from "../models/user.js";
import { status } from "http-status";
import bcrypt from "bcryptjs";
import crypto from "crypto"; 


const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(status.NOT_ACCEPTABLE).json({message: "provide email and password"});
    }

    try {
        const  user = await User.findOne({ email});
        if(!user){
            return res.status(status.NOT_FOUND).json({message: "User not found, please register"});
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(status.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }

        const token  = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();
        return res.status(status.OK).json({ token: token, username: user.username, email: user.email });

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "somthing went worng"});
    }
}
const register = async (req, res) => {
    const { username, email, password } = req.body;
   

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(status.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword  = await bcrypt.hash(password, 10);

        const newUser = new User ({
            email,
            username, 
            password: hashedPassword,
        });
        await newUser.save();

        res.status(status.CREATED).json({ message: "User created", username: newUser.username, email: newUser.email });
       
    } catch (error) {
        res.json({message: `something went wrong, ${error}`})
    }
}

export {login , register};