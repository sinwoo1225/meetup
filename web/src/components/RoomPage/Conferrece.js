/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import VideoView from "./VideoView";
import { useSocket } from "../../util/useSocket";
import { useUserMedia } from "../../util/useUserMedia";
import config from "../../util/rtcConfig";
import axios from "axios";
import RoomHostContext from "../../util/Roomhost.context";
import NicknameContext from "../../util/Nickname.context";
import annyang from '../../util/annyang';
import styled from 'styled-components';
import { FaPowerOff } from "react-icons/fa";

let peerConnections = {};
let userStreams = {};
let isInit = true;
let saveText = "";

function Confference(props) {
	const {
		state: { nickname },
	} = useContext(NicknameContext);
	const {state:{ roomHost }} = useContext(RoomHostContext); 
	const { userMedia, setUserMedia, initUserMedia } = useUserMedia();
	const { socket, initSocket } = useSocket();
	const [roomInfo, setRoomInfo] = useState({
		roomCode: null,
		isExistRoom: false,
		isPrivate: false,
	});
	
	useEffect(()=>{
		return ()=>{
			peerConnections = {};
			userStreams = {};
			isInit = true;
		}
	},[])
	useEffect(()=>{
		return ()=>{
			if(userMedia.userStream){
				userMedia.userStream.getTracks().forEach(function(track) {
					if (track.readyState === 'live') {
						track.stop();
					}
				});
			}
		}
	},[userMedia.userStream])

	useEffect(() => {
		if (isInit) {
			isInit = false;
			saveText = "";
			if(!nickname){
				props.history.push("/");
			}else{
				axios
					.get(`https://20984fd08e12.ngrok.io/api/room/${props.match.params.id}`)
					.then((response) => {
						const { roomCode, isExistRoom, isPrivate } = response.data;
						if (isExistRoom) {
							initUserMedia();
							setRoomInfo({ 
								roomCode, 
								isExistRoom, 
								isPrivate});
						} else {
							alert("회의방이 존재하지않습니다.");
							props.history.push("/");
						}
					});
			}
		}
		if (userMedia.userStream && !socket && roomInfo.isExistRoom) {
			initSocket(roomInfo.roomCode, roomInfo.isPrivate, roomInfo.roomCode === roomHost.roomCode? roomHost.hostCode: null );
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
				setRoomInfo({...roomInfo, isAuth:true});
				socket.send(JSON.stringify({ event: "connectToRoom" }));
			} else {
				alert("회의방 인증에 실패하였습니다.");
				props.history.push("/");
			}
		};

		const handleStartRecord = () => {
			annyang.start({ autoRestart: true, continuous: true });
			var recognition = annyang.getSpeechRecognizer();
			var final_transcript = "";
			recognition.interimResults = true;
			recognition.onresult = function (event) {
				var getTime = new Date();
				final_transcript = "";
				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						const nowTime = (getTime.getHours()<10? "0" + getTime.getHours():getTime.getHours()) +":" + (getTime.getMinutes()<10?"0"+getTime.getMinutes():getTime.getMinutes()) +":" + (getTime.getSeconds()<10? "0"+getTime.getSeconds():getTime.getSeconds());
						final_transcript += event.results[i][0].transcript;
						console.log("final_transcript=" + final_transcript);
						saveText += "["+nowTime+"]"+ nickname+" : "+ final_transcript.trim()+"\n";
					}
				}
			};
		}

		const handleFinishRecord = () => {
			console.log("Finish Record");
			console.log("최종스크립트 : " ,saveText);
			socket.send(JSON.stringify({event:"receiveScript", script:saveText}));
			saveText = "";
			annyang.abort();
		}

		const handleTag = (data) => {
			console.dir(data);
		}

		const handleClosedUser = (data) =>{
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
		}

		const handlebreakRoom = () => {
			alert("호스트에 의해 회의가 종료되었습니다.");
			props.history.push("/");
		}

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
				if(saveText.trim().length >0){
					console.log("스크립트 보냄");
					console.log(saveText);
					socket.send(JSON.stringify({event:"receiveScript", script:saveText}));
				}
				setTimeout(()=>socket.close(),3000);
				annyang.abort();
			};
		}
	}, [socket]);

	const onClickStartConferrence = ()=> {
		if(socket){
			setRoomInfo({...roomInfo, isRecording: true});
			socket.send(JSON.stringify({event:"startRecord"}))
		}
	}

	const onClickFinishConferrence = () => {
		if(socket){
			setRoomInfo({...roomInfo, isRecording: false});
			socket.send(JSON.stringify({event:"finishRecord"}))
		}
	}

	return (
		<>
			{
				roomHost.hostCode && roomInfo.isAuth? 
				<TopButtonGroup>
					{!roomInfo.isRecording? <ConferrenceRecordButton className="start-btn" onClick={onClickStartConferrence}><FaPowerOff color="#fff" size="32"/></ConferrenceRecordButton>:null}
					{roomInfo.isRecording? <ConferrenceRecordButton className="finish-btn" onClick={onClickFinishConferrence}><FaPowerOff color="#fff" size="32"/></ConferrenceRecordButton>:null}	
				</TopButtonGroup>: null
			}	
			<VideoList>
			{/* {userMedia.userStream
					? 
					<>
							<VideoView
								stream={userMedia.userStream}
							/>
							<VideoView
								stream={userMedia.userStream}
							/>
							<VideoView
								stream={userMedia.userStream}
							/>
							<VideoView
								stream={userMedia.userStream}
							/>
					  </>
					: null} */}
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
		</>
	);
}

const VideoList = styled.ul`
	display: flex;
	width:100%;
	flex-wrap: wrap;
	justify-content:center;
`;

const TopButtonGroup = styled.div`
	display:flex;
	justify-content:center;
`;

const ConferrenceRecordButton = styled.button`
	border-radius: 50%;
	padding:8px 10px;
	border: 1px solid #dbdbdb;
	&.start-btn{
		background-color:#27ae60;
	}
	&.finish-btn{
		background-color:#e74c3c;
	}
`;

export default Confference;
