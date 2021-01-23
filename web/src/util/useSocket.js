import { useState } from "react";
import socketConfig from "./serverConfig";

export const useSocket = () => {
	const [socket, setSocket] = useState(null);

	const initSocket = (roomCode, isPrivate, hostCode) => {
		const webSocket = new WebSocket(
			`${socketConfig ? `wss://${socketConfig.server_host}` : ""}/ws`
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
