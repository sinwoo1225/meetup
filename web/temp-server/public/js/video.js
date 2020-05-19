const constraints = {
  video: true,
  audio: true,
};

let peerConnections = {};

async function setUserMediaStream() {
  try {
    videoSelf.srcObject = await navigator.mediaDevices.getUserMedia(
      constraints
    );
    videoSelf.muted = true;
    videoSelf.oncanplay = function () {
      videoSelf.play();
    };
    socket.emit("broadcaster");
  } catch (error) {
    console.log(error);
  }
}

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

socket.on("watcher", async ({ watcherId }) => {
  console.log(`watcher ${watcherId}`);
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[watcherId] = peerConnection;

  let stream = videoSelf.srcObject;
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
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
      socket.emit("candidate", { watcherId, candidate: event.candidate });
    }
  };
  peerConnection.ontrack = function (event) {
    videoRemote.srcObject = event.streams[0];
    videoRemote.muted = true;
    videoRemote.oncanplay = function () {
      console.log("canplay");
      videoRemote.play();
    };
  };
});

// TODO: offer 응답받고 answer
socket.on("offer", ({ broadcasterId, sdp }) => {
  const peerConnection = new RTCPeerConnection(config);
  peerConnections[broadcasterId] = peerConnection;

  let stream = videoSelf.srcObject;
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
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
    videoRemote.srcObject = event.streams[0];
    videoRemote.muted = true;
    videoRemote.oncanplay = function () {
      videoRemote.play();
    };
  };
  peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      socket.emit("candidate", broadcasterId, event.candidate);
    }
  };
});

socket.on("answer", function ({ watcherId, sdp }) {
  console.log("answer", sdp);
  peerConnections[watcherId].setRemoteDescription(sdp);
});

setUserMediaStream();
