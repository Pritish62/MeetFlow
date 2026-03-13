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
            return res.status(status.NOT_FOUND).json({message:"user is not found"});
        }

        if(bcrypt.compare(password, user.password)){
            const token  = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(status.OK).json({token: token});
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({message: "somthing went worng"});
    }
}
const register = async (req, res) => {
    const { username, email, password } = req.body;
   

    try {
         const existingUser = await User.findOne({ username});
        if(existingUser) {
            return res.status(status.FOUND).json({message: "USer is Already Exist"});
        }
        const hashedPassword  = await bcrypt.hash(password, 10);

        const newUser = new User ({
            email,
            username, 
            password: hashedPassword,
        })
        await newUser.save();

        res.status(status.CREATED).json({message: "user is cereated"});
       
    } catch (error) {
        res.json({message: `something went wrong, ${error}`})
    }
}

export {login , register};