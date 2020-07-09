/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";

export const useSocket = (userMedia) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (userMedia.userStream) {
            const webSocket = new WebSocket("wss://0b5999ff488e.ngrok.io/ws");
            // //socket 이벤트 설치
            webSocket.onopen = (e) => {
                console.log("open");
                webSocket.send(JSON.stringify({ event: "broadcaster" }));
            };
            webSocket.onclose = (e) => {
                console.log("close", e);
            };
            webSocket.onerror = (e) => {
                console.log("error", e);
            };

            setSocket(webSocket);
        }
    }, [userMedia.userStream]);

    return socket;
};
