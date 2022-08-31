let videoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio:true
}).then((stream) => {
    videoStream = stream
})


const addVideoStream = (video, stream) => {
    video.srcObject = stream
}