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
if(videoContainer){

    const myCamera = document.createElement("video");
    myCamera.muted = true;
    
    /* socket stuff for chat */
    

    
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then((stream)=>{
        const socket = io("/");
        let peer = new Peer();
        
        const addVideoStream = (video, stream)=>{
            
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", ()=>{
                video.play();
            })
            
            videoContainer.append(video);
            
        };
        
        addVideoStream(myCamera, stream); //this adds our video;
        
        peer.on("call", (call)=>{
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream)=>{
                addVideoStream(video, userVideoStream);
            });
        });
    socket.on("user-connected", (userID)=>{
        console.log(`${userID} has connected`)
        connectToNewUser(userID, stream);
    });
    
    socket.on("user-disconnected",(userID)=>{
        const removeVideo = document.querySelector(`[data-user-id="${userID}"]`);
        if(removeVideo){
            removeVideo.parentNode.removeChild(removeVideo)
        }
    });


    peer.on("open", (id)=>{
        myCamera.setAttribute("data-user-id", id )
        socket.emit("join-chat", ROOM_ID, id);
    })


    const connectToNewUser = (userID, stream)=>{
        const call = peer.call(userID, stream);
        const video = document.createElement("video");
        call.on("stream", (userVideoStream)=>{
            addVideoStream(video, userVideoStream)
            video.setAttribute("data-user-id", userID )
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


