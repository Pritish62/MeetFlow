import React, { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import {
    TextField,
    Button,
    Container,
    Typography,
    Box,
    Link,
    CssBaseline,
    Avatar,
    Grid,
} from '@mui/material';

const url = "http://localhost:8000";

var connections = {};

const peerConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModel, setModel] = useState();

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("")

    let [newMessages, serNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef();

    let [videos, setVideos] = useState();

    // TODO

    // if(isChrome() === false) {


    // } 


    const getPermission = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false)
            }
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localstream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        getPermission();
    }, []);
    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(() => { }) //todo getUserMediasuccess
                .then((stream) => { })

                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }
        }
    }
    useEffect(() => {
        if (video == !undefined && audio == !undefined) {
            getUserMedia();
        }
    }, [audio, video]);

    //TODO addMessage
    const addMessage = ( ) => {

    }   
    const getMessageFronServer = () => {

    } 

    const connectToSocketServer = () => {
        socketRef.current = io(url, { secure: false });
        socketRef.current.on('signal', getMessageFronServer);
        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on("chat-message", addMessage);
            socketRef.current.on("user-left", (id) => {
                setVideo((videos) => videos.filter((video)=> video.socketId !== id))
            })
            socketRef.current.on("user-joind", (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        socketRef.current.emit("signal", socketListId, JSON.stringify({'ice' : event.candidate}));
                    }
                })
            })
        })
    };


    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    const connect = () => {
        if (!username.trim()) return;
        getMedia();
        setAskForUsername(false);
    };

    return (
        <div>
            {
                askForUsername === true ?
                    <div>
                        <h3> Enter to Lobby</h3>
                        <TextField id="outlined-basic" label="username" variant="outlined" value={username} onChange={e => setUsername(e.target.value)} />
                        <Button variant="contained" onClick={connect}>connect</Button>
                        <div>
                            <video ref={localVideoRef} autoPlay muted></video>
                        </div>
                    </div> : <>


                    </>
            }
        </div>
    )
}