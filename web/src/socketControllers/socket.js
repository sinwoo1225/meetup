import socketIo from "socket.io-client";

/** @type {RTCConfiguration} */
const config = {
  iceServers: [
    { urls: ["stun:stun01.sipphone.com"] },
    { urls: ["stun:stun.ekiga.net"] },
    { urls: ["stun:stun.fwdnet.net"] },
    { urls: ["stun:stun.ideasip.com"] },
    { urls: ["stun:stun.iptel.org"] },
    { urls: ["stun:stun.rixtelecom.se"] },
    { urls: ["stun:stun.schlund.de"] },
    { urls: ["stun:stun.l.google.]com:19302"] },
    { urls: ["stun:stun1.l.google.]com:19302"] },
    { urls: ["stun:stun2.l.google.]com:19302"] },
    { urls: ["stun:stun3.l.google.]com:19302"] },
    { urls: ["stun:stun4.l.google.]com:19302"] },
    { urls: ["stun:stunserver.org"] },
    { urls: ["stun:stun.softjoys.com"] },
    { urls: ["stun:stun.voiparound.com"] },
    { urls: ["stun:stun.voipbuster.com"] },
    { urls: ["stun:stun.voipstunt.com"] },
    { urls: ["stun:stun.voxgratia.org"] },
    { urls: ["stun:stun.xten.com"] },
    {
      urls: ["turn:numb.viagenie.ca"],
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: ["turn:192.158.29.39:3478?transport=udp"],
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      urls: ["turn:192.158.29.39:3478?transport=tcp"],
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808",
    },
    {
      urls: ["turn:13.250.13.83:3478?transport=udp"],
      username: "YzYNCouZM1mhqhmseWk6",
      credential: "YzYNCouZM1mhqhmseWk6",
    },
  ],
};

const URL = "https://a6b42ee9.ngrok.io";

let socket = null;
let peerConnections = {};

export function initSocket(app) {
  socket = socketIo(URL);
  // 이벤트 설치
  socket.on("broadcaster", () => {
    socket.emit("watcher");
  });

  socket.on("watcher", ({ watcherId }) => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[watcherId] = peerConnection;

    let stream = app.state.userStream;
    stream
      .getTracks()
      .forEach((track) => {
        peerConnection.addTrack(track, stream)
      });
    peerConnection
      .createOffer()
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(function () {
        socket.emit("offer", {
          watcherId,
          sdp: peerConnection.localDescription,
        });
      });
    peerConnection.onicecandidate = function (event) {
      if (event.candidate) {
        socket.emit("candidate", { id:watcherId, candidate: event.candidate });
      }
    };
    peerConnection.ontrack = function (event) {
      const { videoList } = app.state;
      for(let i = 0; i<videoList.length;i++){
        if(videoList[i].id === event.streams[0].id){
          return;
        }
      }
      videoList.push(event.streams[0]);
      app.setState({ videoList });
    };
  });

  // TODO: offer 응답받고 answer
  socket.on("offer", ({ broadcasterId, sdp }) => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[broadcasterId] = peerConnection;

    let stream = app.state.userStream;
    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));
    peerConnection
      .setRemoteDescription(sdp)
      .then(() => peerConnection.createAnswer())
      .then((sdp) => peerConnection.setLocalDescription(sdp))
      .then(function () {
        socket.emit("answer", {
          broadcasterId,
          sdp: peerConnection.localDescription,
        });
      });
    peerConnection.ontrack = function (event) {
      const { videoList } = app.state;
      for(let i = 0; i<videoList.length;i++){
        if(videoList[i].id === event.streams[0].id){
          return;
        }
      }
      videoList.push(event.streams[0]);
      app.setState({ videoList });
    };
    peerConnection.onicecandidate = function (event) {
      if (event.candidate) {
        socket.emit("candidate", { id:broadcasterId, candidate: event.candidate });
      }
    };
  });

  socket.on("answer", ({ watcherId, sdp }) =>{
    peerConnections[watcherId].setRemoteDescription(sdp);
  });

  socket.on("candidate",({id,candidate})=>{
    console.log(id,candidate)
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  })
  return socket;
}
