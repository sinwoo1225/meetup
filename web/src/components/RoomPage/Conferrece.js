/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import VideoView from "./VideoView";
import { useSocket } from "../../util/useSocket";
import { useUserMedia } from "../../util/useUserMedia";
import config from "../../util/rtcConfig";
import serverConfig from "../../util/serverConfig";
import axios from "axios";
import RoomHostContext from "../../util/Roomhost.context";
import NicknameContext from "../../util/Nickname.context";
import annyang from "../../util/annyang";
import styled from "styled-components";
import { FaPowerOff } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";

let peerConnections = {};
let userStreams = {};
let isInit = true;
let saveText = "";

const saveToFile = (fileName, content) => {
	const blob = new Blob([content], { type: "text/plain" });
	const objURL = window.URL.createObjectURL(blob);

	// 이전에 생성된 메모리 해제
	if (window.__Xr_objURL_forCreatingFile__) {
		window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
	}
	window.__Xr_objURL_forCreatingFile__ = objURL;
	var a = document.createElement("a");
	a.download = fileName;
	a.href = objURL;
	a.click();
};

function Confference(props) {
	const {
		state: { nickname },
	} = useContext(NicknameContext);
	const {
		state: { roomHost },
		actions: { setRoomHost },
	} = useContext(RoomHostContext);
	const { userMedia, setUserMedia, initUserMedia } = useUserMedia();
	const { socket, initSocket } = useSocket();
	const [roomInfo, setRoomInfo] = useState({
		roomCode: null,
		isExistRoom: false,
		isPrivate: false,
	});
	const [meetingLog, setMeetingLog] = useState({
		tags: null,
		script: null,
	});

	const onClickDownload = () => {
		console.log("click downd");
		if (!meetingLog.script || !meetingLog.tags) {
			return;
		}
		const date = new Date();
		saveToFile(
			`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}_${
				meetingLog.tags[0]
			}_${meetingLog.tags[1]}_${meetingLog.tags[2]}`,
			meetingLog.tags + "\r\n" + meetingLog.script
		);
	};

	const onClickStartConferrence = () => {
		if (socket) {
			setRoomInfo({ ...roomInfo, isRecording: true });
			socket.send(JSON.stringify({ event: "startRecord" }));
		}
	};

	const onClickFinishConferrence = () => {
		if (socket) {
			setRoomInfo({ ...roomInfo, isRecording: false });
			socket.send(JSON.stringify({ event: "finishRecord" }));
		}
	};

	const onClickExitButton = () => {
		props.history.push("/");
	};

	useEffect(() => {
		return () => {
			peerConnections = {};
			userStreams = {};
			isInit = true;
			setRoomHost({
				isHost: null,
				roomCode: null,
				hostCode: null,
			});
		};
	}, []);

	useEffect(() => {
		return () => {
			if (userMedia.userStream) {
				userMedia.userStream.getTracks().forEach(function (track) {
					if (track.readyState === "live") {
						track.stop();
					}
				});
			}
		};
	}, [userMedia.userStream]);

	useEffect(() => {
		if (isInit) {
			isInit = false;
			saveText = "";
			if (!nickname) {
				props.history.push("/");
			} else {
				axios
					.get(
						`${
							serverConfig ? `https://${serverConfig.server_host}` : ""
						}/api/room/${props.match.params.id}`
					)
					.then((response) => {
						const { roomCode, isExistRoom, isPrivate } = response.data;
						if (isExistRoom) {
							initUserMedia();
							setRoomInfo({
								roomCode,
								isExistRoom,
								isPrivate,
							});
						} else {
							alert("회의방이 존재하지않습니다.");
							props.history.push("/");
						}
					});
			}
		}
		if (userMedia.userStream && !socket && roomInfo.isExistRoom) {
			initSocket(
				roomInfo.roomCode,
				roomInfo.isPrivate,
				roomInfo.roomCode === roomHost.roomCode ? roomHost.hostCode : null
			);
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
			console.dir(candidate);
			peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
		};

		const handleAuth = ({ isAuth }) => {
			if (isAuth) {
				setRoomInfo({ ...roomInfo, isAuth: true });
				socket.send(JSON.stringify({ event: "connectToRoom" }));
			} else {
				alert("회의방 인증에 실패하였습니다.");
				props.history.push("/");
			}
		};

		const handleStartRecord = () => {
			setMeetingLog({
				script: null,
				tags: null,
			});
			annyang.start({ autoRestart: true, continuous: true });
			var recognition = annyang.getSpeechRecognizer();
			var final_transcript = "";
			recognition.interimResults = true;
			recognition.onresult = function (event) {
				var getTime = new Date();
				final_transcript = "";
				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						const nowTime =
							(getTime.getHours() < 10
								? "0" + getTime.getHours()
								: getTime.getHours()) +
							":" +
							(getTime.getMinutes() < 10
								? "0" + getTime.getMinutes()
								: getTime.getMinutes()) +
							":" +
							(getTime.getSeconds() < 10
								? "0" + getTime.getSeconds()
								: getTime.getSeconds());
						final_transcript += event.results[i][0].transcript;
						console.log("final_transcript=" + final_transcript);
						saveText +=
							"[" +
							nowTime +
							"]" +
							nickname +
							" : " +
							final_transcript.trim() +
							"\n";
					}
				}
			};
		};

		const handleFinishRecord = () => {
			console.log("Finish Record");
			console.log("최종스크립트 : ", saveText);
			socket.send(JSON.stringify({ event: "receiveScript", script: saveText }));
			saveText = "";
			annyang.abort();
		};

		const handleTag = (data) => {
			setMeetingLog({
				script: data.script,
				tags: data.tags,
			});
			console.dir(data);
		};

		const handleClosedUser = (data) => {
			peerConnections[data.closedUserId].close();
			delete peerConnections[data.closedUserId];
			delete userStreams[data.closedUserId];
			const tempList = [];
			tempList.push(userMedia.userStream);
			for (let key in userStreams) {
				tempList.push(userStreams[key].stream);
			}
			setUserMedia({
				...userMedia,
				videoList: tempList,
			});
		};

		const handlebreakRoom = () => {
			alert("호스트에 의해 회의가 종료되었습니다.");
			props.history.push("/");
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
					case "startRecord":
						handleStartRecord();
						break;
					case "finishRecord":
						handleFinishRecord();
						break;
					case "tag":
						handleTag(data);
						break;
					case "closedUser":
						handleClosedUser(data);
						break;
					case "breakRoom":
						handlebreakRoom();
						break;
					default:
						break;
				}
			};
			return () => {
				if (saveText.trim().length > 0) {
					console.log("스크립트 보냄");
					console.log(saveText);
					socket.send(
						JSON.stringify({ event: "receiveScript", script: saveText })
					);
				}
				setTimeout(() => socket.close(), 3000);
				annyang.abort();
			};
		}
	}, [socket]);

	return (
		<>
			<VideoList>
				{userMedia.videoList
					? userMedia.videoList.map((value, index) => (
							<VideoView
								key={index + 1}
								stream={value}
								isUser={index === 0 ? true : false}
							/>
					  ))
					: null}
			</VideoList>
			<BottomButtonGroup>
				{roomInfo.roomCode === roomHost.roomCode &&
				roomHost.isHost &&
				roomInfo.isAuth ? (
					!roomInfo.isRecording ? (
						<ConferrenceRecordButton
							className="start-btn"
							onClick={onClickStartConferrence}
						>
							<FaPowerOff color="#fff" size="32" />
						</ConferrenceRecordButton>
					) : (
						<ConferrenceRecordButton
							className="finish-btn"
							onClick={onClickFinishConferrence}
						>
							<FaPowerOff color="#fff" size="32" />
						</ConferrenceRecordButton>
					)
				) : null}
				<DownloadButton
					onClick={onClickDownload}
					className={
						!meetingLog.script || !meetingLog.tags
							? "inactive-btn"
							: "active-btn"
					}
				>
					<AiOutlineDownload size="34" color="#fff" />
				</DownloadButton>
				<div className="right-column">
					<ExitButton onClick={onClickExitButton}>회의나가기</ExitButton>
				</div>
			</BottomButtonGroup>
		</>
	);
}

const VideoList = styled.ul`
	display: flex;
	width: 75%;
	height: 90vh;
	margin: 0 auto;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	li {
		height: 48%;
		margin-right: 16px;
	}
`;

const BottomButtonGroup = styled.div`
	position: fixed;
	left: 0;
	bottom: 0;
	display: flex;
	width: 100%;
	height: 10vh;
	justify-content: center;
	align-items: center;
	border-top: 1px solid #dbdbdb;
	background: #fff;
	.right-column {
		position: absolute;
		right: 12px;
	}
`;

const Button = styled.button`
	border-radius: 50%;
	padding: 8px 10px;
	border: 1px solid #dbdbdb;
	outline: none;
`;

const ConferrenceRecordButton = styled(Button)`
	margin-right: 16px;
	&.start-btn {
		background-color: #27ae60;
	}
	&.finish-btn {
		background-color: #e74c3c;
	}
`;

const DownloadButton = styled(Button)`
	&.inactive-btn {
		background-color: #bdc3c7;
	}
	&.active-btn {
		background-color: #3498db;
	}
`;

const ExitButton = styled.button`
	outline: none;
	border: 1px solid #dbdbdb;
	background-color: #e74c3c;
	font-size: 15px;
	font-weight: 500;
	color: #fff;
	border-radius: 6px;
	padding: 12px 16px;
`;

export default Confference;
