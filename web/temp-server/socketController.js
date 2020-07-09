const broadcaster = [];

const socketController = (socket, io)=>{
    const broadcast = (event, data) => {
        socket.broadcast.emit(event, data);
      };
    
    socket.on("broadcaster",()=>{
        console.log(`broadcaster 이벤트 # 클라이언트 : ${socket.id} `);
        broadcaster.push(socket.id);
        broadcast("broadcaster");
    });

    socket.on("watcher",()=>{
        // broadcaster들에게 watcher 이벤트로 응답
        broadcaster.forEach((broadcasterId)=>{
            if(broadcasterId !== socket.id)
                io.to(broadcasterId).emit("watcher",{watcherId:socket.id});
        });
    });

    socket.on('offer', ({watcherId, sdp})=>{
        console.log("offer");
    });
}

export default socketController;