import express, {Application} from "express";
import {Server as SocketIOServer} from "socket.io";
import {createServer, Server as HTTPServer} from "http";


const app = express();

app.get("/", (req,res)=>{
    res.send({uptime: process.uptime()})
})


const server = createServer(app);
const io = new SocketIOServer(server);

io.on("connection", (...params)=>{
    console.log(params)
})


server.listen(4000, ()=>{
    console.log("running at http://localhost:4000")
})