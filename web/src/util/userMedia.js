const constraints = {
    video:true,
    audio:true
};

let stream = null;

export const getMediaStream = async () => {
    if(!stream) await setUserMediaStream();
    return stream
};

export  const setUserMediaStream = async () => {
    try{
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    catch(error){
        console.log(error);
    }
}