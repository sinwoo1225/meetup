const broadcaster = [];

const socketController = (socket, io) => {
  const broadcast = (event, data) => {
    socket.broadcast.emit(event, data);
  };

  socket.on("broadcaster", () => {
    console.log(`broadcaster 이벤트 # 클라이언트 : ${socket.id} `);
    broadcaster.push(socket.id);
    broadcast("broadcaster");
  });

  socket.on("watcher", () => {
    // broadcaster들에게 watcher 이벤트로 응답
    broadcaster.forEach((broadcasterId) => {
      if (broadcasterId !== socket.id)
        io.to(broadcasterId).emit("watcher", { watcherId: socket.id });
    });
  });

  socket.on("offer", ({ watcherId, sdp }) => {
    socket.to(watcherId).emit("offer", { broadcasterId: socket.id, sdp });
  });

  socket.on("answer", function ({ broadcasterId, sdp }) {
    console.log("answer", broadcasterId);
    socket.to(broadcasterId).emit("answer", { watcherId: socket.id, sdp });
  });

  socket.on("candidate", ({ id, candidate }) => {
    socket.to(id).emit("candidate",{id:socket.id,candidate});
  });

};

export default socketController;
