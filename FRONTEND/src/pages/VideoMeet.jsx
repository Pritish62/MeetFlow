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


    const getUserMediasuccess = (stream) => {
        
        try {
        window.localStream.getTracks().forEach(track => track.stop());
            
        } catch (er) {
            console.log(er);
        }

        for(let id in connections){
            if(id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer((description) => {
                connections[id].setLocalDescription(description)
                .then(() => {
                    socketIdRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                }).catch(err  => console.log(err)) 
            })
        }

        stream.getTracks.forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                const tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(tracks => tracks.stop())
            } catch (err) {
                console.log(err)
            }
        });
    }


    const silence = () => {
        const ctx = new AudioContext();
        const oscilator = ctx.createOscillator();

        oscilator.start();
        ctx.resume();
        return object.assign(dst.stream.getAudioTracks()[0],{enabled: false})
    }

    const black = ({width = 640, height = 400 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), {width, height});

        canvas.getContext('2d').fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false})
    }


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
    const gotMessageFronServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if(fromId !== socketIdRef.current){
            if(signal.sdp){
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if(signal.sdp.type === "offer"){
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}))
                            })
                            .catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e); 
            }
        }
    } 

    const connectToSocketServer = () => {
        socketRef.current = io(url, { secure: false });
        socketRef.current.on('signal', gotMessageFronServer);
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
                        if(event.candidate !== null){
                        socketRef.current.emit("signal", socketListId, JSON.stringify({'ice' : event.candidate}));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        const videoExist = videoRef.current.find(video => video.socketId === socketListId
                        )

                        if(videoExist) {
                            setVideo((video) => {
                                const updateVideos = videos.map(video => 
                                    video.socketId === socketListId ? {
                                        ...video, stream: event.stream
                                    } : video
                                );
                                videoRef.current = updateVideos;
                                return updateVideos;
                            })
                        } else{
                            const newVideo = {
                                socketId : socketListId,
                                stream : event.stream,
                                autoPlay: true,
                                playsinline: true,
                            }

                            setVideos( (video) => {
                                const updateVideos = [...video, newVideo];
                                videoRef.current = updateVideos;
                                return updateVideos;
                            });
                        }
                    };

                    if(window.localstream !== undefined && window.localstream !== null){
                        connections[socketListId].addStream(window.localstream);
                    }else{
                        //TODO
                        //blackscreen
                        const blackSilence = (...args) => new MediaSTream([black(...args), silence()] );
                        window.localStream  = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }


                })

                if(id === socketIdRef.current){
                    for(const id2 in connections){
                        if(id2 === socketIdRef.current) continue
                        try {
                            connections[id2].addStream(window.localstream);
                        } catch (error) {
                            
                        }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}))
                            })
                            .catch(e => console.log(e))
                        })
                    }
                }
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