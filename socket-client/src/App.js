import './App.css';
import { w3cwebsocket as W3WebSocket } from 'websocket';

const server_url = 'ws://127.0.0.1:5001'
export default function App() {

  const client = new W3WebSocket(server_url);
  client.onopen = (() => {
    console.log('WebSocket Client Connected');
  });

  //client.send(JSON.stringify({body: "nothing"}));

  client.onmessage = ((msg) => {
    console.log(msg);
  })

  return (
    <>
      Hello World!
    </>
  );
}

