import React, { Component } from "react";
import styled from "styled-components";

class VideoView extends Component {
    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    settingVideo() {
        const { current: video } = this.videoRef;
        const { stream } = this.props;

        video.srcObject = stream;
        video.muted = this.props.isUser;
        video.oncanplay = () => {
            video.play();
        };
    }

    componentDidMount() {
        this.settingVideo();
    }

    render() {
        return (
            <li>
                <Video ref={this.videoRef} playsInline></Video>
            </li>
        );
    }
}

const Video = styled.video`
    height:100%;
`;


export default VideoView;
