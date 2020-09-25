/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

export const useUserMedia = () => {
    const [userMedia, setUserMedia] = useState({
        userStream: null,
        videoList: [],
    });

    useEffect(()=>{
        const  getUserMedia = async ()=>{
            // stream 초기화, client의 미디어(웹캠 동영상 스트림을 얻어옴)
            /** @type {MediaStreamConstraints} */
            const constraints = {
                video: true,
                audio: true,
            };
            let stream = null;
            try {
                stream = await navigator.mediaDevices.getUserMedia(constraints);
                const tempList = Array.from(userMedia.videoList);
                tempList.push(stream);
                setUserMedia({
                    ...userMedia,
                    userStream: stream,
                    videoList: tempList,
                });
            } catch (error) {
                 console.log(error);
            }
        }

        getUserMedia();
    },[]);

    return { userMedia,  setUserMedia};
};