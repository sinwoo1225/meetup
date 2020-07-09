import express from "express";
import socketIo from "socket.io";
import logger from "morgan";
import socketController from "./socketController";

const PORT = 4000;
const app = express();

app.use(logger("dev"));

const server = app.listen(PORT,()=>{
    console.log(`✅ Server Listen: http://127.0.0.1:${PORT}`);
});

const io = socketIo.listen(server);

io.on('connection',(socket)=>{
    socketController(socket, io);   
});