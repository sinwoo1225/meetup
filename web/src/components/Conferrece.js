import React, { Component } from "react";
import VideoView from "./VideoView";
import { initSocket } from "../socketControllers/socket";

class Confference extends Component {

  constructor(props){
    super(props);
    this.state = {};
    this.init();
  }

  async init(){
    /** @type {MediaStreamConstraints} */
    const constraints = {
      video:true,
      audio:true
    };
    let stream = null;
    const socket = initSocket(this); 

    try{
      stream  = await navigator.mediaDevices.getUserMedia(constraints);;
    }catch(error){
      console.log(error);
    }
    if(stream && socket){
      this.setState({userStream :stream, videoList:[stream]});
      socket.emit("broadcaster");
    }
  }


  render() {
    const { videoList } = this.state;
    return (
      <ul>
        { videoList? videoList.map((value, index) => (
          <VideoView key={index + 1} stream={value} />
        )): null}
      </ul>
    );
  }
}

export default Confference;
