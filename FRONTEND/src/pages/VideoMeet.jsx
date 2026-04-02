import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { TextField } from '@mui/material';
import styles from "./VideoMeet.module.css";

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

    let [video, setVideo] = useState(undefined);

    let [audio, setAudio] = useState(undefined);

    let [screen, setScreen] = useState();

    let [showModel, setModel] = useState();

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("")

    let [newMessages, serNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    // TODO

    // if(isChrome() === false) {


    // } 


    const getPermission = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            const hasVideoPermission = !!videoPermission;
            if (videoPermission) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false)
            }
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            const hasAudioPermission = !!audioPermission;
            if (audioPermission) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }
            if (hasVideoPermission || hasAudioPermission) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoPermission, audio: hasAudioPermission });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
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
        const previousStream = window.localStream;

        try {
            const previousTracks = previousStream?.getTracks?.() || [];
            previousTracks.forEach(track => track.stop());

        } catch (er) {
            console.log(er);
        }

        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    }).catch(err => console.log(err))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                const tracks = window.localStream ? window.localStream.getTracks() : [];
                tracks.forEach(tracks => tracks.stop())
            } catch (err) {
                console.log(err)
            }

            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

        });
    }


    const silence = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    const black = ({ width = 640, height = 400 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), { width, height });

        canvas.getContext('2d').fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }


    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then((stream) => getUserMediasuccess(stream))

                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = window.localStream ? window.localStream.getTracks() : [];
                tracks.forEach(track => track.stop());
                window.localStream = null;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = null;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
    useEffect(() => {
        if (!askForUsername && video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video, askForUsername]);

    //TODO addMessage
    const addMessage = () => {

    }
    const gotMessageFronServer = (fromId, message) => {
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }))
                                })
                                .catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
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
                setVideos((prevVideos) => prevVideos.filter((item) => item.socketId !== id))
            })
            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {



                    connections[socketListId] = new RTCPeerConnection(peerConnections);


                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate !== null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        const videoExist = videoRef.current.find(video => video.socketId === socketListId
                        )

                        if (videoExist) {
                            setVideos((prevVideos) => {
                                const updateVideos = prevVideos.map((item) =>
                                    item.socketId === socketListId ? {
                                        ...item, stream: event.stream
                                    } : item
                                );
                                videoRef.current = updateVideos;
                                return updateVideos;
                            })
                        } else {
                            const newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true,
                            }

                            setVideos((video) => {
                                const updateVideos = [...video, newVideo];
                                videoRef.current = updateVideos;
                                return updateVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        //TODO
                        //blackscreen
                        const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }

                })

                if (id === socketIdRef.current) {
                    for (const id2 in connections) {
                        if (id2 === socketIdRef.current) continue
                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (error) {

                        }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
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
    const handelVideo = () => {
        setVideo(!video);
    }

    const handelAudio = () => {
        setAudio(!audio);
    }
    const getDisplayMediaSuccess  =( ) => {
        
    } 
    const getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e));
            }
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        };
    }, [screen]);

    const handelScreen = () => {
        setScreen(!screen);
    }

    const shortLabel = (id) => {
        if (!id) return "Guest";
        return id.length > 16 ? `${id.slice(0, 16)}...` : id;
    };

    return (
        <div className={styles.page}>
            {
                askForUsername === true ?
                    <div className={styles.lobbyCard}>
                        <h3 className={styles.title}>Enter to Lobby</h3>
                        <p className={styles.subtitle}>Enter your name, preview your camera, then connect.</p>

                        <div className={styles.formRow}>
                            <TextField
                                id="outlined-basic"
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                fullWidth
                            />
                            <button className={styles.controlBtn} type="button" onClick={connect}>Connect</button>
                        </div>

                        <div className={styles.previewPanel}>
                            <video className={styles.videoFrame} ref={localVideoRef} autoPlay muted playsInline></video>
                        </div>
                    </div> : <>
                        <div className={styles.meetTopBar}>
                            <div>
                                <h3 className={styles.title}>Meeting Room</h3>
                                <p className={styles.subtitle}>Connected as {username || "Guest"}</p>
                            </div>
                            <div className={styles.controlsRow}>
                                <button className={styles.controlBtn} type="button" onClick={handelVideo}>{video ? "Turn Video Off" : "Turn Video On"}</button>
                                <button className={styles.controlBtn} type="button" onClick={handelAudio}>{audio ? "Mute" : "Unmute"}</button>
                                <button className={styles.controlBtn} type="button" onClick={handelScreen}>{screen ? "Stop Share" : "Share Screen"}</button>
                            </div>
                        </div>

                        <div className={styles.videoGrid}>
                            <div className={styles.videoCard}>
                                <h2 className={styles.videoLabel}>{username || "You"}</h2>
                                <video className={styles.videoFrame} ref={localVideoRef} autoPlay muted playsInline></video>
                            </div>

                            {videos.map((videoItem) => (
                                <div className={styles.videoCard} key={videoItem.socketId}>
                                    <h2 className={styles.videoLabel}>{shortLabel(videoItem.socketId)}</h2>
                                    <video
                                        className={styles.videoFrame}
                                        autoPlay
                                        playsInline
                                        data-socket={videoItem.socketId}
                                        ref={ref => {
                                            if (ref && videoItem.stream) {
                                                ref.srcObject = videoItem.stream;
                                            }
                                        }}></video>
                                </div>
                            ))}
                        </div>

                    </>
            }
        </div>
    )
}