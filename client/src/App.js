import './App.css';
import {useEffect} from 'react';
import mock_data from './landmarks-payload.json';
import vertices_map from './facemesh_vertices_mapping.json';
const server_url = 'ws://127.0.0.1:5001';
export default function App() {

  /* websocket part
  useEffect(() => {
    const client = new WebSocket(server_url);
    client.onopen = (() => {
      console.log('WebSocket Client Connected');
    });

    //client.send(JSON.stringify({body: "nothing"}));

    client.onmessage = ((msg) => {
      //console.log(msg);
      //console.log(msg.data);
      const data = JSON.parse(msg.data);
      console.log(data.payload.landmarks.length)
      //console.log(JSON.stringify(data.payload.landmarks));
    });
  }, []);
  */
  
  console.log(vertices_map[0]);

  return (
    <>
      Hello World!
    </>
  );
}

