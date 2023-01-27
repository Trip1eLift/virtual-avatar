const url = "ws://localhost:5000";

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
  iceCandidatePoolSize: 10,
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
const MESSAGE_TYPE = {
  push:                 'push',
  startPeerConnection:  'start-peer-connection',
  offerPeerConnection:  'offer-peer-connection',
  answerPeerConnection: 'answer-peer-connection',
  newIceCandidate:      'new-ice-candidate',
};

// WebRTC docs:   https://levelup.gitconnected.com/establishing-the-webrtc-connection-videochat-with-javascript-step-3-48d4ae0e9ea4
// firebase docs: https://github.com/fireship-io/webrtc-firebase-demo/blob/main/main.js
// WebRTC org:    https://webrtc.org/getting-started/peer-connections

class WebSocketPeering {
  constructor(peerConnection) {
    this.url = url;
    this.pc = peerConnection;
  }

  ownerConn(setRoomId) {
    const socket = new WebSocket(this.url, ["owner"]);
  
    socket.onopen = async function(e) {
      console.log("[open] Connection established");
      
      const room_id = await Demand(socket, "Room-Id");
      console.log(`Room-Id: ${room_id}`);
      setRoomId(room_id);
    };
    
    socket.onmessage = async function(event) {
      const payload = JSON.parse(event.data);
      const peerConnection = this.pc;

      if (payload.message_type === MESSAGE_TYPE.push) {
        console.log(`[client] recieved: ${payload.message}`);
      }

      // 2. Owner reacts to start-peer-connection
      if (payload.message_type === MESSAGE_TYPE.startPeerConnection) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.send(JSON.stringify({message_type: MESSAGE_TYPE.offerPeerConnection, message: offer}));
      }

      // 3. Guest recieves offer data
      if (payload.message_type === MESSAGE_TYPE.offerPeerConnection) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(payload.message));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.send(JSON.stringify({message_type: MESSAGE_TYPE.answerPeerConnection, message: answer}));
      }

      // 4. Owner recieves answer data
      if (payload.message_type === MESSAGE_TYPE.answerPeerConnection) {
        const remoteDesc = new RTCSessionDescription(payload.message);
        await peerConnection.setRemoteDescription(remoteDesc);

        // 5. Owner retrieves a local ICE candidate
        peerConnection.addEventListener('icecandidate', event => {
          if (event.candidate) {
            socket.send(JSON.stringify({message_type: MESSAGE_TYPE.newIceCandidate, message: event.candidate}));
          }
        });

        // 7. Owner detects peer connection estiblishments
        peerConnection.addEventListener('connectionstatechange', event => {
          if (peerConnection.connectionState === 'connected') {
            console.log("Owner is connected to peer connection.");

            // TODO: set stream here
          }
        });
      }

      // 6. Guest recieves a remote ICE candidate
      if (payload.message_type === MESSAGE_TYPE.newIceCandidate) {
        if (payload.message) {
          try {
            await peerConnection.addIceCandidate(payload.message);
          } catch (e) {
            console.error('Error adding received ice candidate', e);
          }
        }

        // 7. Guest detects peer connection estiblishments
        peerConnection.addEventListener('connectionstatechange', event => {
          if (peerConnection.connectionState === 'connected') {
            console.log("Guest is connected to peer connection.");

            // TODO: set stream here
          }
        });
      }
    }
    
    socket.onclose = function(event) {
      if (event.wasClean) {
        console.info(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.error('[close] Connection died');
      }
    };
  
    socket.onerror = function(error) {
      console.error(error);
      console.error(`[error]`);
    };
    
    this.socket = socket;
    return socket;
  }

  guestConn(room_id) {
    const socket = new WebSocket(this.url, ["guest"]);
  
    socket.onopen = async function(e) {
      console.log("[open] Connection established");
      
      await Supply(socket, "Room-Id", room_id);

      // 1. Guest triggers start-peer-connection
      this.socket.send(JSON.stringify({message_type: MESSAGE_TYPE.startPeerConnection}));
    };
  
    socket.onmessage = function(event) {
      console.log(`[owner] recieved: ${event.data}`);
    };
    
    socket.onclose = function(event) {
      if (event.wasClean) {
        console.info(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        console.error('[close] Connection died');
      }
    };
  
    socket.onerror = function(error) {
      console.error(error);
      console.error(`[error]`);
    };
  
    this.socket = socket;
    return socket;
  }

  sendUuid() {
    if (this.socket !== undefined) {
      this.socket.send(JSON.stringify({message_type: MESSAGE_TYPE.push, message: uuidv4()}));
    }
  }
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

// async function mediaSources(peerConnection) {
//   const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//   const remoteStream = new MediaStream();

//   // Push tracks from local stream to peer connection
//   localStream.getTracks().forEach((track) => {
//     peerConnection.addTrack(track, localStream);
//   });

//   // Pull tracks from remote stream, add to video stream
//   peerConnection.ontrack = (event) => {
//     event.streams[0].getTracks().forEach((track) => {
//       remoteStream.addTrack(track);
//     });
//   };

//   // React ref
//   // webcamVideo.srcObject = localStream;
//   // remoteVideo.srcObject = remoteStream;
// }

export {WebSocketPeering, ICE_config};

/**
 * Usage:
 * peerConnection = new RTCPeerConnection(ICE_config);
 * wp = new WebSocketPeering(peerConnection);
 */