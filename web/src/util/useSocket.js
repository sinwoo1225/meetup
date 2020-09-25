import { useState, useEffect } from "react";

export const useSocket = (userMedia) => {
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		if (userMedia.userStream) {
			const webSocket = new WebSocket(
				"wss://chattingvideo.herokuapp.com/ws"
			);
			// //socket 이벤트 설치
			webSocket.onopen = (e) => {
				console.log("open", e);
				webSocket.send(JSON.stringify({ event: "connectToRoom" }));
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
