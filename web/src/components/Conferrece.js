import React, { Component } from "react";
import VideoView from "./VideoView";
import { getUserMediaStream } from "../util/userMedia";

class Confference extends Component{

    constructor(props){
        super(props);
        const stream = getUserMediaStream();
        this.state = {
            videoList: [<VideoView key={1} stream={stream} />]
        };
    }

    render(){
        const {videoList} = this.state;
        return(
            <ul>
                {videoList}
            </ul>
        );
    }
}

export default Confference;