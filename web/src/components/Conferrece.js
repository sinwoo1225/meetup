import React, { Component } from "react";
import VideoView from "./VideoView";
import { getMediaStream } from "../util/userMedia";
import { initSocket } from "../socketControllers/socket";

class Confference extends Component{

    constructor(props){
        super(props);
        const stream = getMediaStream();
        const socket = initSocket();
        if(stream && socket){
            socket.emit("broadcaster");
            socket.emit("watcher");
        }
        this.state = {
            socket,
            videoList: [stream]
        };
    }

    render(){
        const {videoList} = this.state;
        return(
            <ul>
                {videoList.map((value,index)=><VideoView key={index+1} stream={value}/>)}
            </ul>
        );
    }
}

export default Confference;