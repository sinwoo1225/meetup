import socketIo from 'socket.io-client';
import {getMediaStream} from "../util/userMedia";

/** @type {RTCConfiguration} */
const config = { // eslint-disable-line no-unused-vars
    'iceServers': [{
      'urls': ['stun:stun.l.google.com:19302']
    }]
  };

const URL = "ws://127.0.0.1:4000/";

let socket = null;
let peerConnections = {};

export function initSocket(){
    socket = socketIo(URL);
    // 이벤트 설치
    socket.on("broadcaster",()=>{
        socket.emit("watcher")}
    );

    socket.on("watcher",async ({watcherId})=>{
        console.log(`watcher ${watcherId}`);
        const peerConnection = new RTCPeerConnection(config);
	    peerConnections[watcherId] = peerConnection;
        let stream = await getMediaStream();
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
	    peerConnection.createOffer()
	        .then(sdp => peerConnection.setLocalDescription(sdp))
	        .then(function () {
	        	socket.emit('offer', {watcherId, sdp:peerConnection.localDescription});
	        });
	    peerConnection.onicecandidate = function(event) {
	    	if (event.candidate) {
	    		socket.emit('candidate', watcherId, event.candidate);
	    	}
	    };
    })

    // TODO: offer 응답받고 answer 
    return socket;
};