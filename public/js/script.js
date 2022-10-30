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

//using https://medium.com/codesphere-cloud/building-a-video-chat-app-with-socket-io-peerjs-codesphere-b0663bcbe3d7
/* chat room */
const videoContainer = document.querySelector(".videoContainer");

const createVideoEl = (muted)=>{
        const video = document.createElement("video");
        const cameraContainer = document.createElement("div");
        cameraContainer.classList.add("cameraContainer");
        cameraContainer.appendChild(video);
        if(muted){
            video.muted=true;
        }
        return cameraContainer;
};

const addVideoStream = (video, stream)=>{
    videoEl = video.querySelector("video")
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", ()=>{
        videoEl.play();
    })
    
    videoContainer.append(video);
    
};


if(videoContainer){

    const myCameraContainer = createVideoEl(true);

    /* socket stuff for chat */
    

    
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream)=>{
        const socket = io("/");
        let peer = new Peer();
        
        
        addVideoStream(myCameraContainer, stream); //this adds our video;
        
        peer.on("call", (call)=>{
            call.answer(stream);
           
            const cameraContainer = createVideoEl(false);

            call.on("stream", (userVideoStream)=>{
                addVideoStream(cameraContainer, userVideoStream);
            });
        });

        socket.on("user-connected", (userID)=>{
            // cameraContainer.setAttribute("data-user-id", userID )
            connectToNewUser(userID, stream);
        });
    
    socket.on("user-disconnected",(userID)=>{
        const removeVideo = document.querySelector(`[data-user-id="${userID}"]`);
        if(removeVideo){
            removeVideo.parentNode.removeChild(removeVideo)
        }
    });


    peer.on("open", (id)=>{
        myCameraContainer.setAttribute("data-user-id", id )
        socket.emit("join-chat", ROOM_ID, id);
    })


    const connectToNewUser = (userID, stream)=>{
        const call = peer.call(userID, stream);

        const cameraContainer = createVideoEl(false);
        
        call.on("stream", (userVideoStream)=>{
            addVideoStream(cameraContainer, userVideoStream)
            cameraContainer.setAttribute("data-user-id", userID )
        });
        
        call.on("close", ()=>{
            const removeVideo = document.querySelector(`[data-user-id="${userID}"]`);
            if(removeVideo){
                removeVideo.parentNode.removeChild(removeVideo)
            }
        })
        
    };


    window.addEventListener('beforeunload', (event) => { socket.close() });

});





};

}


