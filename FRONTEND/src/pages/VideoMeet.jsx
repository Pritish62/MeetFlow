import React, { useRef, useState, useEffect } from "react";
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

const url = "http://localhost:8000"

var connections = {};

const peerConnections = {
    "iceServer": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState();

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModel, setModel] = useState();

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("")

    let [newMessages, serNewMessages] = useState(0);

    let [askForUsername, setaAskForUsername] = useState(true);

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
                setAudioAvailable(false)
            }
        } catch {

        }
    }
    useEffect(() => {
        getPermission();
    }, []);

    return (
        <div>
            {
                askForUsername === true ?
                    <div>
                        <h3> Enter to Lobby</h3>
                        <TextField id="outlined-basic" label="username" variant="outlined" value={username} onChange={e => setUsername(e.target.value)} />
                        <Button variant="contained">connect</Button>
                        <div>
                            <video ref={localVideoRef} autoPlay muted></video>
                        </div>
                    </div> : <>


                    </>
            }
        </div>
    )
}