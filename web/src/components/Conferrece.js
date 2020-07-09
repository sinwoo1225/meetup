/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import VideoView from "./VideoView";
import {useSocket} from "../util/useSocket";
import { useUserMedia } from "../util/useUserMedia";
import config from "../util/rtcConfig";

const peerConnections = {};

function Confference() {
    const { userMedia, setUserMedia } = useUserMedia();
    const socket = useSocket(userMedia);
    
    useEffect(()=>{
        const handleBroadcaster = () => {
            socket.send(JSON.stringify({event:"watcher"}));
        }
    
        const handleWatcher = ({ watcherId }) => {
            console.log("watcher",watcherId);
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
                for (let i = 0; i < userMedia.videoList.length; i++) {
                        if (userMedia.videoList[i].id === event.streams[0].id) {
                            return;
                        }
                }
                const tempList = Array.from(userMedia.videoList);
                tempList.push(event.streams[0]);
                setUserMedia({
                    ...userMedia,
                    videoList: tempList
                })
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
                const { videoList } = userMedia;
                
                for (let i = 0; i < videoList.length; i++) {
                    if (videoList[i].id === event.streams[0].id) {
                        return;
                    }
                }
                
                const tempList = Array.from(videoList);
                tempList.push(event.streams[0]);
                setUserMedia({
                    ...userMedia,
                    videoList:tempList
                });
            };
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
            console.log(id, candidate);
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
          }

        if(socket){
            socket.onmessage = (e) => {
                const data = JSON.parse(e.data);
                switch(data.event){
                    case "broadcaster":
                        handleBroadcaster();
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
    },[socket])

    return (
        <ul>
            { userMedia.videoList? userMedia.videoList.map((value, index) => (
                <VideoView key={index + 1} stream={value} isUser={index===0 ? true : false} />
            )): null}
        </ul>
    );
}

export default Confference;