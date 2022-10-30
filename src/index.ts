import express, {Express, Request, Response} from "express";
import {Server as SocketIOServer} from "socket.io";
const { ExpressPeerServer } = require("peer");
import {Server as HTTPServer} from "http";
const {v4: uuidv4} = require("uuid");
import dotenv from "dotenv";
dotenv.config();


const port = process.env.PORT;
const app: Express = express();
const http = new HTTPServer(app);
const peerServer = ExpressPeerServer(http, {debug: true});

const io = new SocketIOServer(http);


// chat { ...users }
let chats: any = {};

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use("/peerjs", peerServer);

app.get("/", (req: Request, res: Response) => {
    res.render('landing');
  });

app.get('/chat', (req: Request, res: Response) => {
    res.redirect(`/chat/${uuidv4()}`);
  });

  app.get("/chat/:chatid", (req: Request, res: Response) => {
    res.render('chat', {chatID: req.params.chatid});
  });

  io.on("connection", (socket)=>{
    socket.on("join-chat", (chatID, userID)=>{
        // console.log(socket)
        socket.join(chatID);
        socket.to(chatID).emit("user-connected", userID)

        socket.on('disconnect', () => {
            socket.broadcast.emit('user-disconnected', userID)
        })

        socket.on("message", (message)=>{
          let chatUsers = chats[chatID];
          let userName = chatUsers.filter((e: { userID: any; })=>{  
           return e.userID == userID;
          }).map((e: { registerName: string; })=>{ return e.registerName})[0];
          socket.to(chatID).emit("message", message, userID, userName);
        })

        socket.on("register", (registerName, userID)=>{
          console.log(registerName, userID);

          if(chatID in chats){
            chats[chatID].push({
              userID, registerName
            })
          }else{
            chats[chatID] = [{
              userID, registerName
            }]
          }
        })
    });
  });


  
http.listen(port, ()=>{
    console.log(`Server is running.... ${port}`);
})