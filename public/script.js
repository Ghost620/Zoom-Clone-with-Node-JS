const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})

let videoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {

    videoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectNewUser(userId, stream)
    })

})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    console.log(` ROOM JOINED : ${id}`)
})

const connectNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

let text = $('input')
$('html').keydown((e) => {
    if (e.which == 13 && text.val().legth !==0) {
        console.log(text.val())
        socket.emit('message', text.val())
        text.val('')
    }
})

socket.on('createMessage', msg => {
    console.log('Recieved : ', msg)
    $('.messages').append(`<li class="message"><b>user</b><br/>${msg}</li>`)
    scrollToBottom()
})

const scrollToBottom = () => {
    let d = $('.main_chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}

// MIC MUTE 

const muteUnmute = () => {
    const enabled = videoStream.getAudioTracks()[0].enabled
    if (enabled) {
        videoStream.getAudioTracks().enabled = false
        setUnMuteButton()
    } else {
        setMuteButton()
        videoStream.getAudioTracks()[0].enabled = true
    }

    const setMuteButton = () => {
        const html = `
            <i class="fas fa=microphone"></i>
            <span> Mute </span>
        `
        $('.main_mute_button').innerHTML = html
    }
    
    const setUnMuteButton = () => {
        const html = `
            <i class="unmute fas fa=microphone-slash"></i>
            <span> Unmute </span>
        `
        $('.main_mute_button').innerHTML = html
    }
}

const playStop = () => {

    let enabled = videoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      videoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      videoStream.getVideoTracks()[0].enabled = true;
    }

    const setStopVideo = () => {
        const html = `
          <i class="fas fa-video"></i>
          <span>Stop Video</span>
        `
        $('.main_video_button').innerHTML = html;
      }
      
    const setPlayVideo = () => {
        const html = `
        <i class="stop fas fa-video-slash"></i>
            <span>Play Video</span>
        `
        $('.main_video_button').innerHTML = html;
    }
}