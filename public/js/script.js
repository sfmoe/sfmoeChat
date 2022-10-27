window.onload = function() {
/* landing page functionality */
const form = document.querySelector("form[name=joinChat]");
if(form){
    form.addEventListener("submit", (e)=>{
        e.preventDefault();
        let joinChat = form.querySelector("input#chatRoomID");
        if (joinChat.value !== ""){
            window.location.href=`/chat/${joinChat.value}`;
        }else{
            console.log("need input")
        }
    });
    }

/* chat room */
const videoContainer = document.querySelector(".videoContainer");
const myCamera = document.createElement("video");
myCamera.muted = true;

/* socket stuff for chat */

const socket = io("/");
let peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "8000"
});

const addVideoStream = (video, stream)=>{

    console.log(stream)
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", ()=>{
        video.play();
    })

    videoContainer.append(video);

};

navigator.mediaDevices.getUserMedia({audio: true, video: true})
.then((stream)=>{

    addVideoStream(myCamera, stream);

    peer.on("call", (call)=>{
        call.answer(stream);
        const video = document.createElement("video");
            call.on("stream", (userVideoStream)=>{
                addVideoStream(video, userVideoStream)
            });
    });
    socket.on("user-connected", (userID)=>{
        console.log(userID)
        connectToNewUser(userID, stream);
    });
});


peer.on("open", (id)=>{
    socket.emit("join-chat", ROOM_ID, id);
})


const connectToNewUser = (userID, stream)=>{
    const call = peer.call(userID, stream);
    const video = document.createElement("video");
    call.on("stream", (userVideoStream)=>{
        addVideoStream(video, userVideoStream)
    });

    call.on('close', () => {
        video.remove()
    })
};
window.addEventListener('beforeunload', (event) => { socket.close() });
};



