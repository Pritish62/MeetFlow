import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { TextField } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import styles from "./VideoMeet.module.css";

const url = "http://localhost:8000";

var connections = {};

const peerConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

const getStoredAuthUsername = () => {
    const token = localStorage.getItem("token");
    if (!token) return "";

    try {
        const storedUser = JSON.parse(localStorage.getItem("authUser") || "{}");
        return typeof storedUser.username === "string" ? storedUser.username : "";
    } catch (error) {
        return "";
    }
};

export default function VideoMeetComponent() {

    const { url: meetingCode = "" } = useParams();
    const meetingLink = `${window.location.origin}/${meetingCode}`;
    const [storedAuthUsername] = useState(() => getStoredAuthUsername());
    const autoConnectRef = useRef(false);

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

    let [newMessages, setNewMessages] = useState(0);

    let [showChat, setShowChat] = useState(false);

    let [askForUsername, setAskForUsername] = useState(() => !storedAuthUsername);

    let [username, setUsername] = useState(() => storedAuthUsername || "");

    let [meetingActionStatus, setMeetingActionStatus] = useState("");

    let [permissionsReady, setPermissionsReady] = useState(false);

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    const routeTo = useNavigate();

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
        } finally {
            setPermissionsReady(true);
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
    //TODO addMessage
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ])

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevCount) => prevCount + 1);
        }
    }


    const connectToSocketServer = () => {
        socketRef.current = io.connect(url, { secure: false });
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

    useEffect(() => {
        if (!permissionsReady || !storedAuthUsername || autoConnectRef.current) {
            return;
        }

        autoConnectRef.current = true;
        setAskForUsername(false);
        getMedia();
    }, [permissionsReady, storedAuthUsername]);

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

    const handelEndCall = () => {
        try {
            const localTracks = localVideoRef.current?.srcObject?.getTracks?.() || [];
            localTracks.forEach((track) => track.stop());

            const streamTracks = window.localStream?.getTracks?.() || [];
            streamTracks.forEach((track) => track.stop());

            Object.values(connections).forEach((connection) => connection?.close?.());
            connections = {};

            if (socketRef.current) {
                socketRef.current.off("chat-message", addMessage);
                socketRef.current.disconnect();
            }
        } catch (error) {
            console.log(error);
        }

        routeTo("/home");
    };


    const getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.log(error);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => [
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    })
                    .catch((err) => console.log(err))
            ])
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                const tracks = window.localStream ? window.localStream.getTracks() : [];
                tracks.forEach(tracks => tracks.stop())
            } catch (err) {
                console.log(err)
            }

            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();

        });
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

    const copyText = async (textToCopy) => {
        try {
            await navigator.clipboard.writeText(textToCopy);
            return true;
        } catch (error) {
            return false;
        }
    };

    const handleCopyMeetingCode = async () => {
        if (!meetingCode) return;
        const copied = await copyText(meetingCode);
        setMeetingActionStatus(copied ? "Meeting code copied." : "Could not copy meeting code.");
    };

    const handleShareMeeting = async () => {
        const shareData = {
            title: "Meeting Invite",
            text: `Join my meeting. Code: ${meetingCode}`,
            url: meetingLink
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                setMeetingActionStatus("Meeting link shared.");
                return;
            } catch (error) {
                if (error?.name === "AbortError") {
                    return;
                }
            }
        }

        const copied = await copyText(`${shareData.text}\n${shareData.url}`);
        setMeetingActionStatus(copied ? "Share text copied." : "Could not share meeting link.");
    };

    useEffect(() => {
        if (!meetingActionStatus) return;

        const timer = setTimeout(() => {
            setMeetingActionStatus("");
        }, 2200);

        return () => clearTimeout(timer);
    }, [meetingActionStatus]);

    const chatPreview = messages.length > 0 ? messages : [
        { sender: "Host", data: "Drop your quick updates here while speaking." },
        { sender: "You", data: "This is the chat UI preview." }
    ];

    const sendMessage = () => {
        if (!message.trim() || !socketRef.current) return;
        socketRef.current.emit("chat-message", message, username);
        setMessage("")
    }
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
                            <div className={styles.meetTopMeta}>
                                <h3 className={styles.title}>Meeting Room</h3>
                                <p className={styles.subtitle}>Connected as {username || "Guest"}</p>

                                <div className={styles.meetingCodeCard}>
                                    <p className={styles.meetingCodeLabel}>Meeting code</p>
                                    <p className={styles.meetingCodeValue}>{meetingCode || "Unavailable"}</p>
                                    <div className={styles.meetingCodeActions}>
                                        <button className={styles.controlBtn} type="button" onClick={handleShareMeeting}>Share</button>
                                        <button className={styles.controlBtn} type="button" onClick={handleCopyMeetingCode}>Copy Code</button>
                                    </div>
                                    {meetingActionStatus && <p className={styles.meetingActionStatus}>{meetingActionStatus}</p>}
                                </div>
                            </div>
                            <div className={styles.controlsRow}>
                                <button className={styles.controlBtn} type="button" onClick={handelVideo}>{video ? "Turn Video Off" : "Turn Video On"}</button>
                                <button className={styles.controlBtn} type="button" onClick={handelAudio}>{audio ? "Mute" : "Unmute"}</button>
                                <button className={styles.controlBtn} type="button" onClick={handelScreen}>{screen ? "Stop Share" : "Share Screen"}</button>
                                <button className={styles.controlBtn} type="button" onClick={handelEndCall}>End Call</button>
                                <button
                                    className={`${styles.controlBtn} ${showChat ? styles.controlBtnActive : ""}`}
                                    type="button"
                                    onClick={() => setShowChat(!showChat)}>
                                    {showChat ? "Close Chat" : "Open Chat"}
                                </button>
                            </div>
                        </div>

                        <div className={`${styles.meetingLayout} ${showChat ? styles.chatOpen : ""}`}>
                            <div className={styles.meetingMain}>
                                <div className={`${styles.videoGrid} ${showChat ? styles.videoGridWithChat : ""}`}>
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
                            </div>

                            {showChat && (
                                <aside className={styles.chatPanel}>
                                    <div className={styles.chatHead}>
                                        <h4 className={styles.chatTitle}>Room Chat</h4>
                                        <span className={styles.chatStatus}>UI Preview</span>
                                    </div>

                                    <div className={styles.chatMessages}>
                                        {chatPreview.map((item, index) => (
                                            <div
                                                key={`${item.sender}-${index}`}
                                                className={`${styles.chatBubble} ${item.sender === "You" ? styles.chatBubbleSelf : ""}`}>
                                                <p className={styles.chatSender}>{item.sender}</p>
                                                <p className={styles.chatText}>{item.data}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.chatInputArea}>
                                        <input
                                            className={styles.chatInput}
                                            type="text"
                                            placeholder="Type a message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                        <button className={styles.chatSendBtn} type="button" onClick={sendMessage}>Send</button>
                                    </div>
                                </aside>
                            )}
                        </div>

                    </>
            }
        </div>
    )
}