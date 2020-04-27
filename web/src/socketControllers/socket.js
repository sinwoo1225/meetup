import socketIo from 'socket.io-client';

const URL = "ws://127.0.0.1:4000/";

let socket = null;

export const getSocket = () => socket; 

export function initSocket(app){
    if(!app) throw Error("Can't Not Found React Component");
    socket = socketIo(URL);
    // 이벤트 설치
    return socket;
};