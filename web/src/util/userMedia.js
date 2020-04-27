const constraints = {
    video:true,
    audio:true
};

export  const getUserMediaStream = async () => {
    let stream = null;

    try{
        stream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    catch(error){
        console.log(error);
    }finally{
        return stream;
    }
}