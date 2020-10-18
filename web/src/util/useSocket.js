import { useState } from "react";

export const useSocket = () => {
	const [socket, setSocket] = useState(null);

	const initSocket = (roomCode, isPrivate, hostCode) => {
		const webSocket = new WebSocket(
			"wss://20984fd08e12.ngrok.io/ws"
			// "wss://chattingvideo.herokuapp.com/ws"
		);
		// //socket 이벤트 설치
		webSocket.onopen = (e) => {
			console.log("open", e);
			const data = { roomCode, hostCode };
			if (!hostCode && isPrivate) {
				do {
					data.password = prompt("회의방 비밀번호를 입력해주세요.");
				} while (!data.password);
			}
			webSocket.send(JSON.stringify({ event: "login", ...data }));
			// webSocket.send(JSON.stringify({ event: "connectToRoom" }));
		};
		webSocket.onclose = (e) => {
			console.log("close", e);
		};
		webSocket.onerror = (e) => {
			console.log("error", e);
		};
		setSocket(webSocket);
	};
	return { socket, initSocket };
};
