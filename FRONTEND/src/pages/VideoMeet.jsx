import React, { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { TextField } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";

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
        <div className="w-full min-h-[calc(100vh-72px)] bg-white text-slate-900 px-6 pt-6 pb-9 relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

            {askForUsername === true ? (
                <div className="relative max-w-2xl mx-auto mt-5 bg-white border-2 border-blue-200 rounded-2xl px-8 py-8 shadow-xl">
                    <h3 className="text-3xl font-black m-0 text-slate-900">📞 Enter Lobby</h3>
                    <p className="mt-4 mb-0 text-slate-600 text-lg leading-relaxed">Enter your name, preview your camera, then join.</p>

                    <div className="flex flex-col sm:flex-row gap-3 my-6 items-end">
                        <div className="flex-1">
                            <TextField
                                id="outlined-basic"
                                label="Your Name"
                                variant="outlined"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                fullWidth
                                size="small"
                            />
                        </div>
                        <button 
                            className="px-6 py-2.5 rounded-lg border-2 border-blue-400 bg-blue-50 text-blue-700 font-bold text-sm cursor-pointer hover:border-blue-600 hover:bg-blue-100 transition-all"
                            type="button"
                            onClick={connect}
                        >
                            ✨ Connect
                        </button>
                    </div>

                    <div className="bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 h-80 shadow-lg">
                        <video className="w-full h-full object-cover" ref={localVideoRef} autoPlay muted playsInline></video>
                    </div>
                </div>
            ) : (
                <>
                    {/* Meeting Header */}
                    <div className="relative max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row items-start justify-between gap-8">
                        <div className="flex-1">
                            <h3 className="text-4xl font-black m-0 mb-2 text-slate-900">🎥 Meeting Room</h3>
                            <p className="m-0 text-lg text-slate-600 font-semibold">Connected as <span className="text-blue-600">{username || "Guest"}</span></p>

                            {/* Meeting Code Card */}
                            <div className="mt-5 border-2 border-blue-300 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 px-6 py-5 w-full max-w-sm shadow-lg">
                                <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">📋 Meeting Code</p>
                                <p className="m-0 mb-5 text-3xl font-black tracking-widest text-slate-900 font-mono bg-white px-3 py-2 rounded-lg border border-blue-200">{meetingCode || "—"}</p>
                                <div className="flex gap-2 flex-wrap">
                                    <button 
                                        className="px-4 py-2 rounded-lg border-2 border-blue-300 bg-white text-blue-700 text-sm font-bold cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all" 
                                        type="button" 
                                        onClick={handleShareMeeting}
                                    >
                                        Share
                                    </button>
                                    <button 
                                        className="px-4 py-2 rounded-lg border-2 border-blue-300 bg-white text-blue-700 text-sm font-bold cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all" 
                                        type="button" 
                                        onClick={handleCopyMeetingCode}
                                    >
                                        Copy
                                    </button>
                                </div>
                                {meetingActionStatus && (
                                    <p className="mt-3 m-0 text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded">✓ {meetingActionStatus}</p>
                                )}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <button 
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${ video ? "border-green-400 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-700"}`} 
                                type="button" 
                                onClick={handelVideo}
                            >
                                {video ? "📹 Video On" : "📷 Video Off"}
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${ audio ? "border-green-400 bg-green-50 text-green-700" : "border-red-400 bg-red-50 text-red-700"}`} 
                                type="button" 
                                onClick={handelAudio}
                            >
                                {audio ? "🔊 Muted Off" : "🔇 Muted On"}
                            </button>
                            <button 
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${ screen ? "border-purple-400 bg-purple-50 text-purple-700" : "border-slate-300 bg-white text-slate-900"}`} 
                                type="button" 
                                onClick={handelScreen}
                            >
                                {screen ? "🛑 Sharing" : "📺 Share"}
                            </button>
                            <button 
                                className="px-4 py-2 rounded-lg border-2 border-red-400 bg-red-50 text-red-700 text-sm font-bold cursor-pointer hover:border-red-600 hover:bg-red-100 transition-all" 
                                type="button" 
                                onClick={handelEndCall}
                            >
                                ☎️ End
                            </button>
                            <button
                                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold cursor-pointer transition-all ${ showChat ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700" : "border-blue-300 bg-white text-slate-900 hover:border-blue-500 hover:bg-blue-50"}`}
                                type="button"
                                onClick={() => setShowChat(!showChat)}
                            >
                                💬 {showChat ? "Close Chat" : "Open Chat"}
                            </button>
                        </div>
                    </div>

                    {/* Video Grid and Chat */}
                    <div className={`relative max-w-6xl mx-auto flex ${showChat ? "flex-col lg:flex-row" : "flex-col"} gap-5`}>
                        {/* Video Grid */}
                        <div className={`${showChat ? "lg:flex-1" : "w-full"}`}>
                            <div className={`grid gap-3 ${showChat ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                                {/* Local Video */}
                                <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 border-b-2 border-blue-200">
                                        <h2 className="m-0 text-sm font-bold text-slate-800 truncate">
                                            🎤 {username || "You"}
                                        </h2>
                                    </div>
                                    <video className="w-full h-80 bg-slate-900 object-cover block" ref={localVideoRef} autoPlay muted playsInline></video>
                                </div>

                                {/* Remote Videos */}
                                {videos.map((videoItem) => (
                                    <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow" key={videoItem.socketId}>
                                        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 border-b-2 border-blue-200">
                                            <h2 className="m-0 text-sm font-bold text-slate-800 truncate">
                                                👥 {shortLabel(videoItem.socketId)}
                                            </h2>
                                        </div>
                                        <video
                                            className="w-full h-80 bg-slate-900 object-cover block"
                                            autoPlay
                                            playsInline
                                            data-socket={videoItem.socketId}
                                            ref={ref => {
                                                if (ref && videoItem.stream) {
                                                    ref.srcObject = videoItem.stream;
                                                }
                                            }}
                                        ></video>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chat Panel */}
                        {showChat && (
                            <aside className="w-full lg:w-96 bg-white border-2 border-blue-200 rounded-xl shadow-xl flex flex-col max-h-[500px] lg:max-h-[calc(100vh-280px)] lg:sticky lg:top-24">
                                {/* Chat Header */}
                                <div className="flex justify-between items-center gap-3 px-5 py-4 border-b-2 border-blue-200 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-t-lg">
                                    <h4 className="m-0 text-lg font-black text-slate-900">💬 Chat</h4>
                                    <span className="text-xs font-bold text-blue-700 bg-blue-200 rounded-full px-3 py-1">Live</span>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-slate-50">
                                    {chatPreview.map((item, index) => (
                                        <div
                                            key={`${item.sender}-${index}`}
                                            className={`rounded-lg px-4 py-2 max-w-xs text-sm ${
                                                item.sender === "You"
                                                    ? "ml-auto bg-blue-600 text-white border border-blue-700"
                                                    : "bg-white text-slate-900 border-2 border-slate-300"
                                            }`}
                                        >
                                            <p className="m-0 mb-1 text-xs font-bold opacity-75">{item.sender}</p>
                                            <p className="m-0 leading-relaxed text-sm">{item.data}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat Input */}
                                <div className="border-t-2 border-blue-200 px-4 py-3 flex gap-2 bg-blue-50 rounded-b-lg">
                                    <input
                                        className="flex-1 rounded-lg px-3 py-2 text-sm border-2 border-blue-200 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                                        type="text"
                                        placeholder="Say something..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <button 
                                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold cursor-pointer hover:bg-blue-700 transition-all" 
                                        type="button" 
                                        onClick={sendMessage}
                                    >
                                        Send
                                    </button>
                                </div>
                            </aside>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}