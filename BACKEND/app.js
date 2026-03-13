import dotenv from "dotenv"
import express, { response } from "express"
import {createServer} from "node:http"
import mongoose from "mongoose"
import {Server} from "socket.io"
import { connectSocket } from "./controller/socketCntroller.js"
import cors from "cors"
import {userRoute} from "./routes/userRoute.js"
import 'dotenv/config';



const app = express();
const server = createServer(app);
const io = connectSocket(server);

app.set("port", process.env.POST || 8000);

//Middleware connect
app.use(cors());
app.use(express.json({limit: "40kb"}))
app.use(express.urlencoded({limit: "40kb", extended: true}))



//mongoDB connection
const start = async () => {
    
    const connectionDB = await mongoose.connect(process.env.MONGO_URL)

    console.log(`mongo connectionDB Host:`)
    server.listen(app.get("port"), () => {
        console.log("LISTING TO POST 8000");
    })
}

//routes
app.use("/users", userRoute);
app.get("/home", (req, res) => {
    return res.json({"hello" : "world"});
});


start();