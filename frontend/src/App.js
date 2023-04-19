import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import { useState, useEffect, useRef } from "react";

const socket = io.connect("http://localhost:5000");

function App() {
  const [me, setMe] = useState(""); // my id
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState(""); // id of other person
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState(""); // my name
  const [mesage, setMessage] = useState(""); // my message
  const [messages, setMessages] = useState([]); // array of messages
  const myVideo = useRef(); // my video
  const userVideo = useRef(); // other user video
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const sendMessage = () => {
    const data = {
      name,
      mesage,
      room: "abcde",
    };
    setMessages((prev) => {
      return [...prev, data];
    });
    socket.emit("send-message", data);
  };

  useEffect(() => {
    socket.on("recieve-message", (data) => {
      setMessages((prev) => {
        return [...prev, data];
      });
    });
  }, [socket]);

  useEffect(() => {
    socket.emit("join", "abcde");
  }, []);

  return (
    <div className="App">
      <h1>Zoom</h1>
      <h3>My Video</h3>
      {stream && (
        <video
          playsInline
          ref={myVideo}
          autoPlay
          muted
          style={{ width: "300px", height: "250px" }}
        />
      )}
      <h3>{name} Video</h3>
      {callAccepted && !callEnded ? (
        <video
          playsInline
          ref={userVideo}
          autoPlay
          muted
          style={{ width: "300px", height: "250px" }}
        />
      ) : null}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <CopyToClipboard text={me}>
        <button>Copy ID</button>
      </CopyToClipboard>
      <input
        type="text"
        placeholder="Id to call"
        value={idToCall}
        onChange={(e) => setIdToCall(e.target.value)}
      />
      {callAccepted && !callEnded ? (
        <button onClick={leaveCall}>End Call</button>
      ) : (
        <button onClick={() => callUser(idToCall)}>call</button>
      )}
      {receivingCall && !callAccepted ? (
        <div>
          <h4>{name} is calling</h4>
          <button onClick={answerCall}>Answer</button>
        </div>
      ) : null}
      {callAccepted && (
        <div>
          <input
            type="text"
            placeholder="message"
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>send</button>
        </div>
      )}
      {messages.map((m, i) => {
        return <h2>{m.mesage}</h2>;
      })}
    </div>
  );
}

export default App;
