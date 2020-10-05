/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import VideoView from "./VideoView";
import { useSocket } from "../../util/useSocket";
import { useUserMedia } from "../../util/useUserMedia";
import config from "../../util/rtcConfig";
import axios from "axios";

const peerConnections = {};
const userStreams = {};
let isInit = false;

function Confference(props) {
	const { userMedia, setUserMedia, initUserMedia } = useUserMedia();
	const { socket, initSocket } = useSocket();
	const [roomInfo, setRoomInfo] = useState({
		roomCode: null,
		isExistRoom: false,
		isPrivate: false,
	});
	useEffect(() => {
		if (!isInit) {
			isInit = true;
			axios
				.get(`https://137bc3dc2fdf.ngrok.io/api/room/${props.match.params.id}`)
				.then((response) => {
					const { roomCode, isExistRoom, isPrivate } = response.data;
					if (isExistRoom) {
						initUserMedia();
						setRoomInfo({ roomCode, isExistRoom, isPrivate });
					} else {
						alert("회의방이 존재하지않습니다.");
					}
				});
		}
		if (userMedia.userStream && !socket && roomInfo.isExistRoom) {
			initSocket(roomInfo.roomCode, roomInfo.isPrivate, null);
		}
	}, [userMedia, roomInfo]);
	useEffect(() => {
		const handleConnectToRoom = ({ broadcasterId }) => {
			socket.send(JSON.stringify({ event: "watcher", broadcasterId }));
		};

		const handleWatcher = ({ watcherId }) => {
			const peerConnection = new RTCPeerConnection(config);
			peerConnections[watcherId] = peerConnection;

			userMedia.userStream.getTracks().forEach((track) => {
				peerConnection.addTrack(track, userMedia.userStream);
			});
			peerConnection
				.createOffer()
				.then((sdp) => peerConnection.setLocalDescription(sdp))
				.then(function () {
					socket.send(
						JSON.stringify({
							event: "offer",
							watcherId,
							sdp: peerConnection.localDescription,
						})
					);
				});
			peerConnection.onicecandidate = function (event) {
				if (event.candidate) {
					socket.send(
						JSON.stringify({
							event: "candidate",
							id: watcherId,
							candidate: event.candidate,
						})
					);
				}
			};
			peerConnection.ontrack = function (event) {
				if (!userStreams[watcherId]) {
					userStreams[watcherId] = {
						stream: event.streams[0],
					};
				}
				userStreams[watcherId][event.track.kind] = true;
				if (
					userStreams[watcherId]["audio"] &&
					userStreams[watcherId]["video"]
				) {
					const tempList = [];
					tempList.push(userMedia.userStream);
					for (let key in userStreams) {
						tempList.push(userStreams[key].stream);
					}
					console.log("굿");
					setUserMedia({
						...userMedia,
						videoList: tempList,
					});
				}
			};
		};

		const handleOffer = ({ broadcasterId, sdp }) => {
			const peerConnection = new RTCPeerConnection(config);
			peerConnections[broadcasterId] = peerConnection;

			let stream = userMedia.userStream;
			stream
				.getTracks()
				.forEach((track) => peerConnection.addTrack(track, stream));
			peerConnection
				.setRemoteDescription(sdp)
				.then(() => peerConnection.createAnswer())
				.then((sdp) => peerConnection.setLocalDescription(sdp))
				.then(function () {
					socket.send(
						JSON.stringify({
							event: "answer",
							broadcasterId,
							sdp: peerConnection.localDescription,
						})
					);
				});
			peerConnection.ontrack = function (event) {
				if (!userStreams[broadcasterId]) {
					userStreams[broadcasterId] = {
						stream: event.streams[0],
					};
				}
				userStreams[broadcasterId][event.track.kind] = true;
				if (
					userStreams[broadcasterId]["audio"] &&
					userStreams[broadcasterId]["video"]
				) {
					const tempList = [];
					tempList.push(userMedia.userStream);
					for (let key in userStreams) {
						tempList.push(userStreams[key].stream);
					}
					console.log("호옹");
					setUserMedia({
						...userMedia,
						videoList: tempList,
					});
				}
			};

			peerConnection.onicecandidate = function (event) {
				if (event.candidate) {
					socket.send(
						JSON.stringify({
							event: "candidate",
							id: broadcasterId,
							candidate: event.candidate,
						})
					);
				}
			};
		};

		const handleAnswer = ({ watcherId, sdp }) => {
			peerConnections[watcherId].setRemoteDescription(sdp);
		};

		const handleCandidate = ({ id, candidate }) => {
			peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
		};

		const handleAuth = ({ isAuth }) => {
			if (isAuth) {
				socket.send(JSON.stringify({ event: "connectToRoom" }));
			} else {
				alert("회의방 인증에 실패하였습니다.");
				props.history.push("/");
			}
		};
		if (socket) {
			socket.onmessage = (e) => {
				const data = JSON.parse(e.data);
				console.log(data.event);
				switch (data.event) {
					case "connectToRoom":
						handleConnectToRoom(data);
						break;
					case "watcher":
						handleWatcher(data);
						break;
					case "offer":
						handleOffer(data);
						break;
					case "answer":
						handleAnswer(data);
						break;
					case "candidate":
						handleCandidate(data);
						break;
					case "auth":
						handleAuth(data);
						break;
					default:
						break;
				}
			};
			return () => {
				socket.close();
			};
		}
	}, [socket]);
	return (
		<>
			{userMedia.userStream ? <h1>userMedia</h1> : <h1>no userMedia</h1>}
			<ul>
				{userMedia.videoList
					? userMedia.videoList.map((value, index) => (
							<VideoView
								key={index + 1}
								stream={value}
								isUser={index === 0 ? true : false}
							/>
					  ))
					: null}
			</ul>
		</>
	);
}

export default Confference;
