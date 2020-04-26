const socketController = (socket, io)=>{
    const broadcast = (event, data) => {
        socket.broadcast.emit(event, data);
      };
    
    socket.on("echo",({message})=>{
        console.log(`echo 이벤트 # 클라이언트 : ${message}`);
        socket.emit("receive", {message})
    });
}

export default socketController;