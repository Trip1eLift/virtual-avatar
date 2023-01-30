import { v4 as uuidv4 } from 'uuid';

const ICE_config = {
  iceServers: [
    {
      'url': 'stun:stun.l.google.com:19302'
    },
    {
      'url': 'turn:192.158.29.39:3478?transport=udp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    },
    {
      'url': 'turn:192.158.29.39:3478?transport=tcp',
      'credential': 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      'username': '28224511:1379330808'
    }
  ],
  iceCandidatePoolSize: 30,
};

const Peer_options = {
  optional: [{
    RtpDataChannels: true
  }]
};

/**
 * Client to client negotiation: 
 * event.data = JSON.stringify(payload)
 * 
 * Payload types:
 * 
 * { message_type: 'push',                    message: "uuid"    }
 * { message_type: 'start-peer-connection',   message: undefined }
 * { message_type: 'offer-peer-connection',   message: offer     } offer  = await peerConnection.createOffer();
 * { message_type: 'answer-peer-connection',  message: answer    } answer = await peerConnection.createAnswer();
 * { message_type: 'new-ice-candidate',       message: candidate }
 */

// TODO: handle cross device peer connection

const MESSAGE_TYPE = {
  push:                 'push',
  startPeerConnection:  'start-peer-connection',
  offerPeerConnection:  'offer-peer-connection',
  answerPeerConnection: 'answer-peer-connection',
  newIceCandidate:      'new-ice-candidate',
  facemeshData:         'facemesh-data',
};

class WebSocketPeering {
  constructor(streamVideo = false) {
    console.log("Constructing wsp..."); // Debuging for constrcutor spamming
    const peer = new RTCPeerConnection(ICE_config, Peer_options);
    const remoteStream = new MediaStream();

    peer.addEventListener("track", (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    })

    peer.ondatachannel = (event) => {
      event.channel.onmessage = (event) => {
        // PeerConnection DataChannel Listener
        //const payload = JSON.parse(event.data);

        // if (payload.message_type === MESSAGE_TYPE.push) {
        //   console.log(`[peer] recieved: ${payload.message}`);
        // }
        if (this.facemeshDataHandler !== undefined) { 
          this.facemeshDataHandler(event.data);
        }
      };
    };

    const datachannel = peer.createDataChannel("data");
    
    // 7. Peer connection established
    datachannel.onopen = () => {
      console.log("[peer] Connection established; Closing websocket");
      this.socket.close(1000, "websocket is no longer needed.");
      this.dc_open = true;

      console.log("7. Peer connection established");
    };
    
    datachannel.onclose = () => {
      console.log("[peer] Connection close.");
      this.dc_open = false;
    };

    this.socket = undefined;
    this.peer = peer;
    this.dc = datachannel;
    this.dc_open = false;
    this.remoteStream = remoteStream;
    this.streamVideo = streamVideo;
    this.facemeshDataHandler = undefined;
  }

  ownerConn(url, setRoomId) {
    const socket = new WebSocket(url, ["owner"]);
    const peer = this.peer;
  
    socket.onopen = async function(e) {
      console.log("[socket open] Connection established");
      
      const room_id = await Demand(socket, "Room-Id");
      console.log(`Room-Id: ${room_id}`);
      setRoomId(room_id);
    };
    
    socket.onmessage = async function(event) {
      const payload = JSON.parse(event.data);

      if (payload.message_type === MESSAGE_TYPE.push) {
        console.log(`[owner socket] recieved: ${payload.message}`);
      }

      // 2. Owner reacts to start-peer-connection
      if (payload.message_type === MESSAGE_TYPE.startPeerConnection) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.send(JSON.stringify({message_type: MESSAGE_TYPE.offerPeerConnection, message: offer}));
        //console.log("2. Owner reacts to start-peer-connection");
      }

      // 4. Owner recieves answer data
      if (payload.message_type === MESSAGE_TYPE.answerPeerConnection) {
        const remoteDesc = new RTCSessionDescription(payload.message);
        await peer.setRemoteDescription(remoteDesc);
        //console.log("4. Owner recieves answer data");
      }

      // 6.5 Owner recieves a remote ICE candidate
      if (payload.message_type === MESSAGE_TYPE.newIceCandidate) {
        if (payload.message) {
          try {
            console.log(payload.message.candidate); // for debug
            await peer.addIceCandidate(payload.message);
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
        //console.log("6.5 Owner recieves a remote ICE candidate")
      }
    }

    // 5. Owner retrieves a local ICE candidate
    peer.addEventListener('icecandidate', event => {
      if (event.candidate) {
        console.log(event.candidate.candidate); // for debug
        socket.send(JSON.stringify({message_type: MESSAGE_TYPE.newIceCandidate, message: event.candidate}));
        //console.log("5. Owner retrieves a local ICE candidate");
      }
    });
    
    attachCommonSocketHandlers(socket);
    this.socket = socket;
  }

  guestConn(url, room_id) {
    const socket = new WebSocket(url, ["guest"]);
    const peer = this.peer;
  
    socket.onopen = async function(e) {
      console.log("[socket open] Connection established");
      
      await Supply(socket, "Room-Id", room_id);

      // 1. Guest triggers start-peer-connection
      socket.send(JSON.stringify({message_type: MESSAGE_TYPE.startPeerConnection}));
      //console.log("1. Guest triggers start-peer-connection");
    };
  
    socket.onmessage = async function(event) {
      const payload = JSON.parse(event.data);

      if (payload.message_type === MESSAGE_TYPE.push) {
        //console.log(`[guest socket] recieved: ${payload.message}`);
      }

      // 3. Guest recieves offer data
      if (payload.message_type === MESSAGE_TYPE.offerPeerConnection) {
        peer.setRemoteDescription(new RTCSessionDescription(payload.message));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.send(JSON.stringify({message_type: MESSAGE_TYPE.answerPeerConnection, message: answer}));
        //console.log("3. Guest recieves offer data")
      }

      // 6. Guest recieves a remote ICE candidate
      if (payload.message_type === MESSAGE_TYPE.newIceCandidate) {
        if (payload.message) {
          try {
            console.log(payload.message.candidate); // for debug
            await peer.addIceCandidate(payload.message);
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }
        //console.log("6. Guest recieves a remote ICE candidate")
      }
    };

    // 5.5 Guest retrieves a local ICE candidate
    peer.addEventListener('icecandidate', event => {
      if (event.candidate) {
        console.log(event.candidate.candidate); // for debug
        socket.send(JSON.stringify({message_type: MESSAGE_TYPE.newIceCandidate, message: event.candidate}));
        //console.log("5.5 Guest retrieves a local ICE candidate");
      }
    });
    
    attachCommonSocketHandlers(socket);
    this.socket = socket;
  }

  onUserMedia(stream) {
    if (this.streamVideo) {
      // Stream audio and video
      stream.getTracks().forEach((track) => {
        this.peer.addTrack(track, stream);
      });
    } else {
      // Stream audio only
      stream.getAudioTracks().forEach((track) => {
        this.peer.addTrack(track, stream);
      });
    }
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  boolStreamVideo() {
    return this.streamVideo;
  }

  sendFacemeshData(message) {
    if (this.dc_open) {
      this.dc.send(message);
    }
  }

  handleFacemeshData(callback) {
    this.facemeshDataHandler = callback;
  }

  sendUuid() {
    if (this.socket !== undefined) {
      this.socket.send(JSON.stringify({message_type: MESSAGE_TYPE.push, message: uuidv4()}));
    }
  }

  sendUuidPeer() {
    if (this.dc !== undefined) {
      this.dc.send(JSON.stringify({message_type: MESSAGE_TYPE.push, message: uuidv4()}));
    }
  }
}

// Attach common socket handlers that are used in both owner and guest
function attachCommonSocketHandlers(socket) {
  socket.onclose = function(event) {
    if (event.wasClean) {
      console.info(`[socket close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.error('[socket close] Connection died');
    }
  };

  socket.onerror = function(error) {
    console.error(`[error] ${error}`);
  };
}

// Only used to communicate against match server
function Demand(conn, ask) {
  return new Promise((resolve, reject) => {
    const handlerTemp = conn.onmessage;
    conn.onmessage = (event) => {
      const pack = JSON.parse(event.data);
      conn.onmessage = handlerTemp;
      resolve(pack.Bus);
    }
    conn.send(JSON.stringify({
      "Bus": ask
    }));
  });
}

// Only used to communicate against match server
function Supply(conn, ask, ans) {
  return new Promise((resolve, reject) => {
    const handlerTemp = conn.onmessage;
    conn.onmessage = (event) => {
      const pack = JSON.parse(event.data);
      if (pack.Bus == ask) {
        conn.send(JSON.stringify({
          "Bus": ans
        }));
      }
      conn.onmessage = handlerTemp;
      resolve();
    }
  });
}

export default WebSocketPeering;