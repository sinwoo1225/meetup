/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import VideoView from "./VideoView";
import {useSocket} from "../util/useSocket";
import { useUserMedia } from "../util/useUserMedia";
import config from "../util/rtcConfig";

const peerConnections = {};
const userStreams  = {};

function Confference() {
    const { userMedia, setUserMedia } = useUserMedia();
    const socket = useSocket(userMedia);
    console.log(Object.entries(peerConnections).length, userMedia);
    useEffect(()=>{
        const handleBroadcaster = ({ broadcasterId }) => {
            socket.send(JSON.stringify({event:"watcher", broadcasterId}));
        }
    
        const handleWatcher = ({ watcherId }) => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections[watcherId] = peerConnection;
        
            userMedia.userStream.getTracks().forEach((track) => {
                peerConnection.addTrack(track, userMedia.userStream);
              });
            peerConnection
                .createOffer()
                .then((sdp) => peerConnection.setLocalDescription(sdp))
                .then(function () {
                    socket.send(JSON.stringify( {
                        event: "offer",
                        watcherId,
                        sdp: peerConnection.localDescription,
                    }));
                });
            peerConnection.onicecandidate = function (event) {
                if (event.candidate) {
                    socket.send(JSON.stringify({
                        event:"candidate", 
                        id:watcherId, 
                        candidate: event.candidate 
                    }));
                }
            };
              peerConnection.ontrack = function (event) {
                if(!userStreams[watcherId]){
                    userStreams[watcherId] = {
                        stream: event.streams[0]
                    };
                }
                userStreams[watcherId][event.track.kind] = true;
                if(userStreams[watcherId]["audio"] && userStreams[watcherId]["video"]){
                    const tempList = [];
                    tempList.push(userMedia.userStream); 
                    for(let key in userStreams) {
                        tempList.push(userStreams[key].stream);
                    }
                    console.log("굿");
                    setUserMedia({
                        ...userMedia,
                        videoList: tempList
                    })
                }
            }
        } 
    
        const handleOffer = ({ broadcasterId, sdp }) =>{
            const peerConnection = new RTCPeerConnection(config);
            peerConnections[broadcasterId] = peerConnection;
            
            let stream = userMedia.userStream;
            stream
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, stream));
            peerConnection
            .setRemoteDescription(sdp)
            .then(() => peerConnection.createAnswer())
            .then((sdp) => peerConnection.setLocalDescription(sdp))
            .then(function () {
                socket.send(JSON.stringify({
                    event:"answer",
                    broadcasterId,
                    sdp: peerConnection.localDescription,
                }));
            });
            peerConnection.ontrack = function (event) {
                if(!userStreams[broadcasterId]){
                    userStreams[broadcasterId] = {
                        stream: event.streams[0]
                    };
                }
                userStreams[broadcasterId][event.track.kind] = true;
                if(userStreams[broadcasterId]["audio"] && userStreams[broadcasterId]["video"]){
                    const tempList = [];
                    tempList.push(userMedia.userStream); 
                    for(let key in userStreams) {
                        tempList.push(userStreams[key].stream);
                    }
                    console.log("호옹");
                    setUserMedia({
                        ...userMedia,
                        videoList: tempList
                    })
                }
            }

            peerConnection.onicecandidate = function (event) {
                if (event.candidate) {
                    socket.send( JSON.stringify({
                        event:"candidate",
                        id: broadcasterId,
                        candidate: event.candidate,
                    }));
                }
            };
        }
    
        const handleAnswer = ({ watcherId, sdp })=>{
            peerConnections[watcherId].setRemoteDescription(sdp);
        }
        
        const handleCandidate = ({ id, candidate }) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
          }

        if(socket){
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                switch(data.event){
                    case "broadcaster":
                        handleBroadcaster(data);
                        break;
                    case "watcher":
                        handleWatcher(data);
                        break;
                    case "offer":
                        handleOffer(data);
                        break;
                    case "answer":
                        handleAnswer(data);
                        break;
                    case "candidate":
                        handleCandidate(data);
                        break;
                    default:
                        break;
                }
            };
        }
    }, [socket])
    return (
        <ul>
            { userMedia.videoList? userMedia.videoList.map((value, index) => (
                <VideoView key={index + 1} stream={value} isUser={index===0 ? true : false} />
            )): null}
        </ul>
    );
}

export default Confference;