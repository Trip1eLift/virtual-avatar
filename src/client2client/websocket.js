const url = "ws://localhost:5000";

function ownerConn(url, setRoomId) {
  const socket = new WebSocket(url, ["owner"]);

  socket.onopen = async function(e) {
    console.log("[open] Connection established");
    
    const room_id = await Demand(socket, "Room-Id");
    console.log(`Room-Id: ${room_id}`);
    setRoomId(room_id);
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

  return socket;
}

function guestConn(url, room_id) {
  const socket = new WebSocket(url, ["guest"]);

  socket.onopen = async function(e) {
    console.log("[open] Connection established");
    
    await Supply(socket, "Room-Id", room_id);
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

  return socket;
}

function sendUuid(socket) {
  if (socket !== undefined) {
    socket.send(`Push ${uuidv4()}`);
  }
}

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