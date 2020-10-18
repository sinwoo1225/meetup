import React from "react";
import { HashRouter, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";
import NickNamePage from "./components/NickNamePage/NickNamePage";
import RoomPage from "./components/RoomPage/RoomPage";
import { GlobalStyle } from "./util/GlobalStyle";
import { NicknameProvider } from "./util/Nickname.context";
import { RoomHostProvider } from "./util/Roomhost.context";

function App() {
	return (
		<>
			<GlobalStyle />
			<NicknameProvider>
			<RoomHostProvider>
				<HashRouter>
					<Route path="/" exact component={LandingPage} />
					<Route path="/nickname" component={NickNamePage} />
					<Route path="/room/:id" component={RoomPage} />
				</HashRouter>
			</RoomHostProvider>
			</NicknameProvider>
		</>
	);
}

export default App;
