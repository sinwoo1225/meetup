import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaPencilAlt } from "react-icons/fa";
import VideoImage from "../../assets/images/video.png";
import PlusImage from "../../assets/images/plus.png";
import NicknameContext from "../../util/Nickname.context";
import RoomHostContext from "../../util/Roomhost.context";
import serverConfig from "../../util/serverConfig";
import axios from "axios";

const useCreatRoomModal = () => {
	const createRoomModal = useRef();
	const onClickCreateRoomModal = (e) => {
		if (e.target.localName === "div") {
			createRoomModal.current.classList.add("hide");
		}
	};
	const onClickCreateRoomBtn = () => {
		createRoomModal.current.classList.remove("hide");
	};
	return [createRoomModal, onClickCreateRoomModal, onClickCreateRoomBtn];
};

const useCreateRoomForm = (history) => {
	const {
		actions: { setRoomHost },
	} = useContext(RoomHostContext);
	const [checked, setChecked] = useState(true);
	const inputPassword = useRef();
	const onChangeCheckPassword = () => {
		if (checked) {
			inputPassword.current.classList.add("hide");
		} else {
			inputPassword.current.classList.remove("hide");
		}
		setChecked(!checked);
	};
	const onSubmit = (e) => {
		e.preventDefault();
		axios
			.post(
				`${serverConfig ? `https://${serverConfig.server_host}` : ""}/api/room`,
				{ password: e.currentTarget[1].value }
			)
			.then((response) => {
				const { roomCode, hostCode } = response.data.room;
				setRoomHost({
					isHost: hostCode ? true : false,
					roomCode,
					hostCode,
				});
				history.push(`/room/${roomCode}`);
			});
	};
	return [checked, inputPassword, onChangeCheckPassword, onSubmit];
};

const useJoinRoomMoal = () => {
	const joinRoomModal = useRef();
	const onClickJoinRoomModal = (e) => {
		if (e.target.localName === "div") {
			joinRoomModal.current.classList.add("hide");
		}
	};
	const onClickJoinRoomBtn = () => {
		joinRoomModal.current.classList.remove("hide");
	};
	return [joinRoomModal, onClickJoinRoomModal, onClickJoinRoomBtn];
};

const useJoinRoomForm = (history) => {
	const onSubmit = (e) => {
		e.preventDefault();
		const { value: roomCode } = e.currentTarget[0];
		history.push(`/room/${roomCode}`);
	};
	return [onSubmit];
};

function Home({ history }) {
	const {
		state: { nickname },
	} = useContext(NicknameContext);
	const [
		createRoomModal,
		onClickCreateRoomModal,
		onClickCreateRoomBtn,
	] = useCreatRoomModal();
	const [
		checked,
		inputPassword,
		onChangeCheckPassword,
		onCreateRoomSubmit,
	] = useCreateRoomForm(history);
	const [
		joinRoomModal,
		onClickJoinRoomModal,
		onClickJoinRoomBtn,
	] = useJoinRoomMoal();
	const [onJoinRoomSubmit] = useJoinRoomForm(history);
	useEffect(() => {
		if (!nickname) {
			history.push("/nickname");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nickname]);

	return (
		<HomeLayout>
			<div className="nickname">
				<span className="nickname__user-nickname">{nickname}</span>
				<Link to="/nickname">
					<button className="nickname__update-btn">
						<FaPencilAlt size="28" color="#3b3b3b" />
					</button>
				</Link>
			</div>
			<div className="function">
				<div className="function__button-group">
					<button
						onClick={onClickCreateRoomBtn}
						className="function__create-conference-btn square-btn"
					>
						<img src={VideoImage} alt="비디오 이미지" />
					</button>
					<span className="function__text">새회의</span>
				</div>
				<div className="function__button-group">
					<button
						onClick={onClickJoinRoomBtn}
						className="function__join-conference-btn square-btn"
					>
						<img src={PlusImage} alt="플러스 이미지" />
					</button>
					<span className="function__text">회의참가</span>
				</div>
			</div>
			<div
				ref={createRoomModal}
				className="modal hide"
				onClick={onClickCreateRoomModal}
			>
				<form className="create-room-form" onSubmit={onCreateRoomSubmit}>
					<h2>회의생성</h2>
					<p>
						<label htmlFor="check-password">비밀번호 설정</label>
						<input
							id="check-password"
							onChange={onChangeCheckPassword}
							checked={checked}
							type="checkbox"
							name="check-password"
						/>
					</p>
					<input
						ref={inputPassword}
						type="password"
						name="password"
						placeholder="비밀번호를 입력하세요."
					/>
					<button type="submit">회의방 생성</button>
				</form>
			</div>
			<div
				ref={joinRoomModal}
				className="modal hide"
				onClick={onClickJoinRoomModal}
			>
				<form className="join-room-form" onSubmit={onJoinRoomSubmit}>
					<h2>회의방 참가</h2>
					<input
						type="text"
						name="room_code"
						placeholder="회의방 코드를 입력하세요."
					/>
					<button type="submit">회의방 참가</button>
				</form>
			</div>
		</HomeLayout>
	);
}

const HomeLayout = styled.main`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	.nickname {
		display: flex;
		align-items: center;
		margin-bottom: 42px;
		.nickname__user-nickname {
			font-size: 28px;
			margin-right: 10px;
			border-bottom: 2px solid #3b3b3b;
		}
		.nickname__update-btn {
			border: none;
			outline: none;
			background: none;
			cursor: pointer;
		}
	}

	.function {
		display: flex;
		.function__button-group {
			display: flex;
			flex-direction: column;
			align-items: center;
			&:first-child {
				margin-right: 20px;
			}
		}
		.square-btn {
			border: none;
			outline: none;
			width: 100px;
			height: 100px;
			background: none;
		}
		.square-btn:hover {
			transform: scale(1.05);
		}
	}
	.modal {
		&.hide {
			display: none;
		}
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
		background: rgba(0, 0, 0, 0.24);
		form {
			background-color: #fff;
			border-radius: 7px;
			padding: 80px 120px;
			display: flex;
			flex-direction: column;
			h2 {
				align-self: center;
				margin-bottom: 24px;
				font-size: 24px;
				font-weight: 600;
				color: #3b3b3b;
				font-family: "yg-jalnan";
			}
			p {
				width: 100%;
				margin-bottom: 16px;
			}
			input[name="password"],
			input[name="room_code"] {
				width: 100%;
				margin-bottom: 8px;
				display: inline-block;
				padding: 10px 12px;
				font-size: 15px;
				border-radius: 4px;
				border: 1px solid #dbdbdb;
				outline: none;
				&.hide {
					display: none;
				}
			}
			button {
				width: 100%;
				padding: 10px 0;
				font-size: 15px;
				outline: none;
				border: none;
				border-radius: 4px;
				background-color: #5ea7e8;
				color: #fcfcfc;
			}
		}
	}
`;

export default Home;
