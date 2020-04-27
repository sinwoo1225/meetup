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
    }

    componentDidMount(){
        this.settingVideo();
    }

    render(){
        return (
            <li>
                <video ref={this.videoRef}  autoPlay/>
            </li>
        );
    }
}

export default VideoView;