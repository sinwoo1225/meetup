import React, { useState } from "react";

const NicknameContext = React.createContext({
    state: {nickname: null},
    actions:{
        setNickName: ()=>{}
    }
});

const NicknameProvider = ({children}) =>{
    const [nickname, setNickname] = useState(localStorage.getItem("nickname")); 

    const value = {
        state: {nickname},
        actions: {setNickname}
    };

    return (
        <NicknameContext.Provider value={value}>{children}</NicknameContext.Provider>
    )
};

const {Consumer: NicknameConsumer} = NicknameContext;
export {NicknameProvider, NicknameConsumer};
export default NicknameContext;