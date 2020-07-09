import socketIo from 'socket.io-client';
import {getMediaStream} from "../util/userMedia";

/** @type {RTCConfiguration} */
const config = { // eslint-disable-line no-unused-vars
    'iceServers': [{
      'urls': ['stun:stun.l.google.com:19302']
    }]
  };

const URL = "ws://127.0.0.1:8080/ws";

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
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
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
        socket.emit("candidate", { id: watcherId, candidate: event.candidate });
      }
    };
    peerConnection.ontrack = function (event) {
      const { videoList } = app.state;
      for (let i = 0; i < videoList.length; i++) {
        if (videoList[i].id === event.streams[0].id) {
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
      for (let i = 0; i < videoList.length; i++) {
        if (videoList[i].id === event.streams[0].id) {
          return;
        }
      }
      videoList.push(event.streams[0]);
      app.setState({ videoList });
    };
    peerConnection.onicecandidate = function (event) {
      if (event.candidate) {
        socket.emit("candidate", {
          id: broadcasterId,
          candidate: event.candidate,
        });
      }
    };
  });

  socket.on("answer", ({ watcherId, sdp }) => {
    peerConnections[watcherId].setRemoteDescription(sdp);
  });

  socket.on("candidate", ({ id, candidate }) => {
    console.log(id, candidate);
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });
  return socket;
}
