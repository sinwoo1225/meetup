import React, { useContext } from "react";
import styled from "styled-components";
import { IoMdVideocam } from "react-icons/io";
import NicknameContext from "../../util/Nickname.context";

function NickName({history}) {
	const { actions :{ setNickname }} = useContext(NicknameContext);

	const onSubmitHandle = (event)=>{
		event.preventDefault();
		const { nickname : {value}} = event.currentTarget;
		localStorage.setItem("nickname", value);
		setNickname(value);
		history.push("/");
	}

	return (
		<NickNameLayout>
			<form className="nickname-form" onSubmit={onSubmitHandle}>
				<header className="nickname-form__header">
					<span className="nickname-form__logo">
						<IoMdVideocam color="#5ea7e8" size="42" />
					</span>
					<h2 className="nickname-form__title">FOCUS</h2>
				</header>
				<input
					className="nicknam-form__input"
					type="text"
					name="nickname"
					placeholder="닉네임을 설정해주세요."
				/>
				<button className="nicknam-form__submit-btn">시작하기</button>
			</form>
		</NickNameLayout>
	);
}

const NickNameLayout = styled.main`
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #fafafa;
	.nickname-form {
		background-color: #ffffff;
		padding: 40px 80px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border-radius: 4px;
		border: 1px solid #dbdbdb;
		.nickname-form__header {
			display: flex;
			align-items: center;
			margin-bottom: 32px;
			.nickname-form__logo {
				margin-right: 10px;
				display: flex;
				align-items: center;
			}

			.nickname-form__title {
				font-size: 32px;
				color: #757575;
				font-family: "yg-jalnan";
			}
		}
		.nicknam-form__input {
			width: 100%;
			margin-bottom: 10px;
			display: inline-block;
			padding: 10px 12px;
			font-size: 15px;
			border-radius: 4px;
			border: 1px solid #dbdbdb;
			outline: none;
		}
		.nicknam-form__submit-btn {
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
`;

export default NickName;
