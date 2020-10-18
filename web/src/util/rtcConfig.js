/** @type {RTCConfiguration} */
const config = {
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
      { urls: ["stun:stun1.l.google.com:19302"] },
      { urls: ["stun:stun2.l.google.com:19302"] },
      { urls: ["stun:stun3.l.google.com:19302"] },
      { urls: ["stun:stun4.l.google.com:19302"] },
      {
        urls: ["turn:13.125.164.46?transport=tcp"],
        credential: "dilab",
        username: "shinwoo",
      },
      {
        urls: ["turn:13.125.164.46?transport=udp"],
        credential: "dilab",
        username: "shinwoo",
      }
    ],
  };

  export default config;