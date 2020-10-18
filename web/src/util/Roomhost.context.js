import React, { useState } from "react";

const RoomHostContext = React.createContext({
    state: {roomHost: null},
    actions:{
        setRoomHost: ()=>{}
    }
});

const RoomHostProvider = ({children}) =>{
    const [roomHost, setRoomHost] = useState({
        isHost: null,
        roomCode: null,
        hostCode: null
    }); 

    const value = {
        state: {roomHost},
        actions: {setRoomHost}
    };

    return (
        <RoomHostContext.Provider value={value}>{children}</RoomHostContext.Provider>
    )
};

const {Consumer: RoomHostConsumer} = RoomHostContext;
export {RoomHostProvider, RoomHostConsumer};
export default RoomHostContext;