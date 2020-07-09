import React, { Component } from "react";

class VideoView extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    settingVideo() {
        const { current: video } = this.videoRef;
        const { stream, isUser } = this.props;

        video.srcObject = stream;
        video.muted = isUser;
        video.oncanplay = function () {
            video.play();
        };
    }

    componentDidMount() {
        this.settingVideo();
    }

    render() {
        return (
            <li>
                <video ref={this.videoRef} playsInline></video>
            </li>
        );
    }
}

export default VideoView;
