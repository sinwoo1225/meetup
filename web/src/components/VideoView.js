import React, { Component } from "react";

class VideoView extends Component{
    
    constructor(props){
        super(props);
        this.videoRef = React.createRef();
    }
    
    async settingVideo(){
        const { current: video } = this.videoRef;
        const { stream } =  this.props;
        
        video.srcObject = await stream;
        video.muted= true;
        video.oncanplay = function(){
            video.play();
        }
    }

    componentDidMount(){
        this.settingVideo();
    }

    render(){
        return (
            <li>
                <video ref={this.videoRef} />
            </li>
        );
    }
}

export default VideoView;